// Publishes the source of every deployed Toollpad contract to the explorer.
//
//   npm run verify
//
// Run this straight after deploying, and again after launching a token. The
// whole claim this project makes is about code: the locker has no function that
// removes liquidity, the rate is a constant with no setter, the treasury is an
// immutable. Until the source is verified, none of that can be checked — an
// explorer showing only bytecode turns the strongest thing about these
// contracts into something people have to take on trust, at exactly the moment
// they are deciding whether to.
//
//   EXPLORER_URL=https://…   defaults to Robinhood Chain's Blockscout
//   TOKENS=8                 how many of the newest launches to include
//
// It sends no transaction, spends no gas and needs no private key. Verification
// is a claim about source code, checked by recompiling it — the chain is not
// touched.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { encodeAbiParameters, parseAbiParameters } from "viem";

import { configAddress, loadConfig } from "./lib/config.mjs";
import { connect, fail } from "./lib/env.mjs";
import { sleep, withBackoff } from "./lib/backoff.mjs";
import { readArtifact } from "./lib/artifacts.mjs";

const require = createRequire(import.meta.url);
const solc = require("solc");

const here = dirname(fileURLToPath(import.meta.url));
const explorer = (process.env.EXPLORER_URL || "https://robinhoodchain.blockscout.com").replace(/\/$/, "");

/**
 * Blockscout sits behind Cloudflare, which answers a bare fetch with a challenge
 * page rather than the API. Looking like a browser is usually enough to be let
 * through; when it is not, the script says so and hands over the manual route
 * rather than leaving a 403 and an HTML fragment on screen.
 */
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  origin: explorer,
  referer: `${explorer}/`,
};

const isChallenge = (status, text) =>
  status === 403 && /just a moment|cloudflare|cf-browser-verification|challenge/i.test(text);

let input;
try {
  input = readFileSync(join(here, "out", "solc-input.json"), "utf8");
} catch {
  fail("out/solc-input.json is not there — run `npm run compile` first.");
}

// The exact compiler, taken from the compiler rather than written down. A
// version that is close but not identical produces different bytecode and a
// rejection that does not say why.
const version = `v${solc.version().replace(".Emscripten.clang", "")}`;

const config = loadConfig();
const poolManager = configAddress(config, "poolManager", "POOL_MANAGER", { what: "the pool manager" });
const treasury = configAddress(config, "treasury", "TREASURY", { what: "where the treasury's share goes" });

const deployed = config.deployed ?? {};
if (!deployed.factory) {
  fail(
    "nothing is deployed yet, so there is no source to publish.",
    "",
    "Run `npm run deploy` first. It writes the addresses back into",
    "toollpad.config.json, which is where this reads them from.",
  );
}

if (!deployed.hookSalt) {
  fail(
    "toollpad.config.json has no hookSalt, and the factory cannot be verified without it.",
    "",
    "It is the factory's third constructor argument. A deployment made before",
    "this script existed did not record it; `npm run mine` prints the salt for a",
    "given nonce, and the one that was used is the nonce the deploy was sent at.",
  );
}

const address = (value) => (value && value !== "" ? value : null);

/**
 * What to submit, and what each was built with.
 *
 * Constructor arguments are supplied rather than left to the explorer to guess.
 * The hook and the locker were deployed by the factory, so there is no creation
 * transaction to recover them from, and an explorer that cannot find them
 * reports a mismatch that reads like the source being wrong.
 */
const CONTRACTS = [
  {
    name: "ToollpadFactory",
    path: "ToollpadFactory.sol",
    address: address(deployed.factory),
    args: encodeAbiParameters(parseAbiParameters("address, address, bytes32"), [
      poolManager,
      treasury,
      deployed.hookSalt,
    ]),
  },
  {
    name: "TollHook",
    path: "TollHook.sol",
    address: address(deployed.hook),
    args: encodeAbiParameters(parseAbiParameters("address, address"), [poolManager, treasury]),
  },
  {
    name: "TollLocker",
    path: "TollLocker.sol",
    address: address(deployed.locker),
    args: encodeAbiParameters(parseAbiParameters("address"), [poolManager]),
  },
];

/**
 * Every token on the board, newest first.
 *
 * A launched token gets its own explorer page, and that page is where a buyer
 * actually lands — so an unverified token is the one that matters most. The
 * arguments come off the notice the factory recorded, and the supply went to the
 * locker rather than to whoever launched it.
 */
async function tokensOnTheBoard() {
  const limit = Number(process.env.TOKENS ?? 8);
  if (!Number.isInteger(limit) || limit <= 0) return [];

  const factoryArtifact = readArtifact("ToollpadFactory");

  let publicClient;
  try {
    ({ publicClient } = await connect());
  } catch {
    console.log("rpc        unreachable — publishing the launchpad's own contracts only");
    return [];
  }

  const [notices, supply] = await Promise.all([
    publicClient.readContract({
      address: deployed.factory,
      abi: factoryArtifact.abi,
      functionName: "latest",
      args: [0n, BigInt(limit)],
    }),
    publicClient.readContract({
      address: deployed.factory,
      abi: factoryArtifact.abi,
      functionName: "FIXED_SUPPLY",
    }),
  ]);

  return notices.map((notice) => ({
    name: "TollToken",
    path: "TollToken.sol",
    label: `$${notice.symbol}`,
    address: notice.token,
    args: encodeAbiParameters(parseAbiParameters("string, string, uint256, address"), [
      notice.name,
      notice.symbol,
      supply,
      deployed.locker,
    ]),
  }));
}

async function verify(contract) {
  const body = new FormData();
  body.append("compiler_version", version);
  body.append("license_type", "mit");
  body.append("contract_name", `${contract.path}:${contract.name}`);
  body.append("autodetect_constructor_args", contract.args ? "false" : "true");
  if (contract.args) body.append("constructor_args", contract.args);
  body.append("files[0]", new Blob([input], { type: "application/json" }), "solc-input.json");

  const url = `${explorer}/api/v2/smart-contracts/${contract.address}/verification/via/standard-input`;

  const { status, text, ok } = await withBackoff(async () => {
    const r = await fetch(url, { method: "POST", body, headers: BROWSER_HEADERS });
    return { status: r.status, text: await r.text(), ok: r.ok, headers: r.headers };
  }, contract.name);

  if (ok) return { ok: true, message: "submitted" };
  if (status === 429) return { ok: false, message: "still rate limited — re-run in a few minutes" };

  // Already-verified is a success as far as anyone reading the explorer cares.
  if (/already verified/i.test(text)) return { ok: true, message: "already verified" };
  if (isChallenge(status, text)) return { ok: false, blocked: true, message: "blocked by Cloudflare" };

  return { ok: false, message: `${status} ${text.slice(0, 200)}` };
}

async function isVerified(contract) {
  const { status, text } = await withBackoff(async () => {
    try {
      const r = await fetch(`${explorer}/api/v2/smart-contracts/${contract.address}`, { headers: BROWSER_HEADERS });
      return { status: r.status, text: await r.text(), headers: r.headers };
    } catch (error) {
      // A dropped connection is not a rate limit, so it must not be retried
      // here — it falls through as "not verified", which is what it was before.
      return { status: 0, text: error.message };
    }
  }, contract.name);

  if (status !== 200) return false;
  try {
    return Boolean(JSON.parse(text).is_verified);
  } catch {
    return false;
  }
}

const tokens = await tokensOnTheBoard();
const queue = [...CONTRACTS, ...tokens];

console.log(`explorer   ${explorer}`);
console.log(`compiler   ${version}`);
console.log(`sources    ${Object.keys(JSON.parse(input).sources).length} files, imports included`);
console.log(`queue      ${CONTRACTS.length} launchpad contracts, ${tokens.length} launched token${tokens.length === 1 ? "" : "s"}`);
console.log("");

let failures = 0;
let blocked = 0;
let first = true;

for (const contract of queue) {
  // A gap between submissions, because the limit is on the account rather than
  // on any one contract.
  if (!first) await sleep(4000);
  first = false;

  const label = (contract.label ?? contract.name).padEnd(16);

  if (!contract.address) {
    console.log(`  skip   ${label} not deployed yet`);
    continue;
  }

  if (await isVerified(contract)) {
    console.log(`  ok     ${label} ${contract.address} already verified`);
    continue;
  }

  const result = await verify(contract);
  if (!result.ok) {
    console.log(`  ${result.blocked ? "block" : "FAIL "}  ${label} ${contract.address}`);
    console.log(`         ${result.message}`);
    // The arguments are the hard part of verifying by hand, so print them where
    // they can be copied rather than worked out again.
    if (contract.args) console.log(`         constructor args: ${contract.args}`);
    if (result.blocked) blocked += 1;
    else failures += 1;
    continue;
  }

  // Blockscout compiles in the background, so a submission is not yet an answer.
  // Wait for one rather than reporting a job as a result.
  let verified = false;
  for (let attempt = 0; attempt < 10 && !verified; attempt += 1) {
    await sleep(6000);
    verified = await isVerified(contract);
  }

  console.log(
    verified
      ? `  ok     ${label} ${contract.address} verified`
      : `  slow   ${label} ${contract.address} submitted, still compiling — check the explorer`,
  );
}

console.log("");

if (blocked > 0) {
  console.log("  Cloudflare answered the API with a challenge page rather than letting it");
  console.log("  through. That is about the explorer's bot protection, not about the source —");
  console.log("  the same files verify by hand in a browser, which passes the challenge.");
  console.log("");
  console.log(`  1. Open the contract on ${explorer}`);
  console.log("  2. Contract → Verify & Publish → Solidity (Standard JSON input)");
  console.log(`  3. Compiler ${version}, license MIT`);
  console.log(`  4. Upload ${join(here, "out", "solc-input.json")}`);
  console.log("  5. Paste the constructor arguments printed above for that contract");
  console.log("");
  console.log("  The arguments are the part worth copying rather than retyping: the hook and");
  console.log("  the locker were deployed by a contract, so the explorer cannot recover them.");
  process.exit(1);
}

if (failures > 0) {
  console.log(`  ${failures} contract${failures === 1 ? "" : "s"} did not verify. The source on the explorer is what`);
  console.log("  makes this project's claims checkable, so this is worth fixing before announcing.");
  process.exit(1);
}

console.log("  Source is published. The locker can be read rather than taken on trust.");
