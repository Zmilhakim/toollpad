// Posts one token to the board: mints the supply, opens its pool, and locks the
// whole supply into it. One transaction, no posting fee, nothing held back.
//
//   TOKEN=lane-one npm run launch                                # prints the plan
//   TOKEN=lane-one CONFIRM=launch npm run launch                 # sends it
//
//   NAME="Some Token" SYMBOL=SOME npm run launch                 # the same, ad hoc
//   NAME="Some Token" SYMBOL=SOME CONFIRM=launch npm run launch
//
// TOKEN names a folder under `tokens/`, where a launch is written down in full
// and can be reviewed in a diff before it is sent — which is worth rather more
// than a shell history for a transaction nothing can edit afterwards. Everything
// in it can still be overridden for one run: NAME, SYMBOL, IMAGE, BLURB, LINK,
// FLOOR_ETH and CEIL_ETH all win over the file, and over the config's defaults.
//
// Do not chain these with `&&`. A dry run is a success, so the first command
// exits 0 without sending anything and the next one in the chain would run
// against a launch that never happened.
import { createWalletClient, formatEther, http, parseEventLogs } from "viem";

import { configAddress, configNumber, configPrice, loadConfig } from "./lib/config.mjs";
import { connect, fail, requireDeployerKey, requireEnv } from "./lib/env.mjs";
import { readArtifact } from "./lib/artifacts.mjs";
import { toollpadPoolKey } from "./lib/pool.mjs";
import { loadToken } from "./lib/token.mjs";
import { amountsInPosition, ethPerTokenFromSqrtPrice, launchRange, pricePerToken } from "./lib/ticks.mjs";

const factoryArtifact = readArtifact("ToollpadFactory");

const written = process.env.TOKEN ? loadToken(process.env.TOKEN) : null;

// A name and a ticker have to come from somewhere. With TOKEN they come from the
// file; without it, from the shell, and there is nowhere else to look.
requireEnv(written ? ["DEPLOYER_KEY"] : ["DEPLOYER_KEY", "NAME", "SYMBOL"]);

const config = loadConfig();
const factory = configAddress(config, "deployed.factory", "FACTORY", {
  what: "the Toollpad factory — run `npm run deploy` first",
});
const tickSpacing = configNumber(config, "launch.tickSpacing", "TICK_SPACING", written?.tickSpacing ?? 200);

// Three places a price can come from, tried most specific first: the shell, for
// a one-off; the token's own file, for a launch this repository has written
// down; then the config, which is the default for a launch that has neither.
const price = (envName, fromToken, path, what) => {
  const once = (process.env[envName] ?? "").trim();
  if (once !== "") return once;
  if (fromToken) return fromToken;
  return configPrice(config, path, envName, { what });
};

const floorEth = price("FLOOR_ETH", written?.openingEth, "launch.floorEth", "what the whole supply is worth where selling starts");
const ceilEth = price("CEIL_ETH", written?.ceilingEth, "launch.ceilEth", "what the whole supply is worth at the far end of the range");

const account = requireDeployerKey();
const { chain, publicClient } = await connect();
if (chain.id !== config.chainId) fail(`toollpad.config.json says chain ${config.chainId}, not ${chain.id}`);

const WHOLE_SUPPLY = 1_000_000_000n;
const range = launchRange({
  floorEthPerToken: pricePerToken(floorEth, WHOLE_SUPPLY),
  ceilEthPerToken: pricePerToken(ceilEth, WHOLE_SUPPLY),
  tickSpacing,
});

const params = {
  name: process.env.NAME ?? written?.name,
  symbol: process.env.SYMBOL ?? written?.symbol,
  imageURI: process.env.IMAGE ?? written?.imageURI ?? "",
  blurb: process.env.BLURB ?? written?.blurb ?? "",
  link: process.env.LINK ?? written?.link ?? "",
  tickSpacing,
  sqrtPriceX96: range.sqrtPriceX96,
  tickLower: range.tickLower,
  tickUpper: range.tickUpper,
};

console.log(`factory    ${factory}`);
console.log(`creator    ${account.address}`);
if (written) console.log(`written    ${written.path}`);
console.log(`balance    ${formatEther(await publicClient.getBalance({ address: account.address }))} ETH`);
console.log(`\ntoken      ${params.name} ($${params.symbol})`);
console.log(`supply     1,000,000,000 — all of it into the pool, none to anyone`);
console.log(`range      ${floorEth} ETH at the floor, ${ceilEth} ETH at the ceiling (whole supply)`);
console.log(`ticks      ${range.tickLower} … ${range.tickUpper}, spacing ${tickSpacing}`);
// The rate this pool will charge, read off the launchpad rather than repeated
// from this repository's copy of it. The toll is a constant in the hook and the
// hook is in the pool's key, so it is decided by which factory is being launched
// into — and the plan is the last place that can still be noticed.
const [, , , tollBps, creatorBps] = await publicClient.readContract({
  address: factory,
  abi: factoryArtifact.abi,
  functionName: "boardStats",
});
console.log(`toll       ${Number(tollBps) / 100}% of every swap, ${Number(creatorBps) / 100}% of it to ${account.address}`);

// Simulated against the node before anything is broadcast: a launch that would
// revert is better learned about here than from a receipt.
const { request, result } = await publicClient
  .simulateContract({
    address: factory,
    abi: factoryArtifact.abi,
    functionName: "launch",
    args: [params],
    account,
  })
  .catch((error) => {
    fail(
      "the launch would revert:",
      `  ${error.shortMessage ?? error.message?.split("\n")[0] ?? error}`,
      "",
      "A pool that already exists for this token, or a range that does not sit",
      "entirely below the opening price, are the two that come up.",
    );
  });

const [, token] = result;
console.log(`\nwould deploy the token at ${token}`);

if (process.env.CONFIRM !== "launch") {
  console.log(`\nNothing was sent. To send it:\n`);
  const again = written ? `TOKEN=${written.slug}` : `NAME="${params.name}" SYMBOL="${params.symbol}"`;
  console.log(`    ${again} CONFIRM=launch npm run launch`);
  process.exit(0);
}

const wallet = createWalletClient({ account, chain, transport: http() });
const hash = await wallet.writeContract(request);
console.log(`\ntx         ${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") fail("the launch reverted");

const [launched] = parseEventLogs({ abi: factoryArtifact.abi, eventName: "Launched", logs: receipt.logs });
const notice = await publicClient.readContract({
  address: factory,
  abi: factoryArtifact.abi,
  functionName: "noticeAt",
  args: [launched.args.id],
});

const key = toollpadPoolKey({
  token: notice.token,
  hook: await publicClient.readContract({ address: factory, abi: factoryArtifact.abi, functionName: "hook" }),
  tickSpacing: notice.tickSpacing,
});
const inPosition = amountsInPosition(notice.liquidity, range.sqrtPriceX96, notice.tickLower, notice.tickUpper);

console.log(`\nnotice     #${launched.args.id}`);
console.log(`token      ${notice.token}`);
console.log(`pool       ${key.currency0} / ${key.currency1}, fee ${key.fee}, hook ${key.hooks}`);
console.log(`locked     ${inPosition.tokens / 10n ** 18n} tokens, ${formatEther(inPosition.eth)} ETH`);
console.log(`price      ${formatEther(ethPerTokenFromSqrtPrice(range.sqrtPriceX96))} ETH per token, to start`);
console.log(`\nThe liquidity is in the locker and is not coming back out. What you own is`);
console.log(`${Number(creatorBps) / 100}% of the toll, which you take with \`npm run collect\`.`);
