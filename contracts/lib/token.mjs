// A token, read out of the folder it is written down in.
//
// `tokens/<slug>/token.json` is the launch: the name and ticker that go on the
// chain, the sentence that goes on the notice, the picture the site shows, and
// the two valuations the supply opens between. Writing it down rather than
// typing it at a prompt is the same argument as `toollpad.config.json` makes for
// addresses — a launch is one transaction and nothing about it can be edited
// afterwards, so the values should be reviewable in a diff before they are sent.
//
// It reads and checks before a launch, and writes exactly one thing after one:
// where the token landed. Nothing in a token folder is secret, and nothing
// secret ever goes in one.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fail } from "./env.mjs";

const TOKENS = join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), "tokens");

const isDecimal = (value) => typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0;

/** Every folder under `tokens/` that actually holds a token. */
export function knownTokens() {
  if (!existsSync(TOKENS)) return [];
  return readdirSync(TOKENS).filter((slug) => existsSync(join(TOKENS, slug, "token.json")));
}

/**
 * The token `slug` names, checked hard enough that a bad one fails here rather
 * than inside a simulated transaction where the revert says `EmptyMetadata`.
 */
export function loadToken(slug) {
  const clean = String(slug).trim();
  const path = join(TOKENS, clean, "token.json");

  if (!/^[a-z0-9][a-z0-9-]*$/.test(clean) || !existsSync(path)) {
    const known = knownTokens();
    fail(
      `no token written down at tokens/${clean}/token.json`,
      "",
      known.length > 0 ? `There is: ${known.join(", ")}` : "There are none yet.",
    );
  }

  let token;
  try {
    token = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`tokens/${clean}/token.json is not valid JSON: ${error.message}`);
  }

  const say = (...lines) => fail(`tokens/${clean}/token.json — ${lines[0]}`, ...lines.slice(1));

  if (typeof token.name !== "string" || token.name.trim() === "") say("name is empty, and the factory refuses that");
  if (typeof token.symbol !== "string" || !/^[A-Z0-9]{2,11}$/.test(token.symbol)) {
    say(`symbol ${JSON.stringify(token.symbol)} is not 2–11 characters of A–Z and 0–9`);
  }

  const launch = token.launch ?? {};
  if (!isDecimal(launch.openingEth)) say("launch.openingEth must be a decimal string of ETH, like \"1.7\"");
  if (!isDecimal(launch.ceilingEth)) say("launch.ceilingEth must be a decimal string of ETH, like \"170\"");
  if (Number(launch.openingEth) >= Number(launch.ceilingEth)) {
    say(`launch.ceilingEth (${launch.ceilingEth}) must be above launch.openingEth (${launch.openingEth})`);
  }
  if (launch.tickSpacing !== undefined && (!Number.isInteger(launch.tickSpacing) || launch.tickSpacing <= 0)) {
    say(`launch.tickSpacing ${launch.tickSpacing} is not a positive whole number`);
  }

  // A notice carries these forever and nothing can edit them afterwards. An
  // `http://` picture is a mixed-content blank on the site; a link that is not a
  // link is a dead one on every page that prints it.
  for (const field of ["imageURI", "link"]) {
    const value = token[field] ?? "";
    if (typeof value !== "string") say(`${field} must be a string`);
    if (value !== "" && !value.startsWith("https://")) say(`${field} must be empty or start with https:// — got ${value}`);
  }
  if (typeof (token.blurb ?? "") !== "string") say("blurb must be a string");

  // Launching the same written-down token twice deploys a second contract with
  // the same name and ticker, and leaves the file pointing at only one of them —
  // which is the shape of a token whose real address nobody can settle. Stop,
  // rather than quietly making the pair.
  if (token.deployed?.token) {
    fail(
      `tokens/${clean} has already been launched: ${token.deployed.token}`,
      token.deployed.launchTx ? `  in ${token.deployed.launchTx}` : "",
      "",
      "Launching it again would deploy a second contract with the same name and",
      "ticker. If that is really what you want, copy the folder under a new slug;",
      "if the recorded launch is wrong, delete the `deployed` block first.",
    );
  }

  return {
    slug: clean,
    name: token.name.trim(),
    symbol: token.symbol,
    imageURI: (token.imageURI ?? "").trim(),
    blurb: (token.blurb ?? "").trim(),
    link: (token.link ?? "").trim(),
    openingEth: launch.openingEth.trim(),
    ceilingEth: launch.ceilingEth.trim(),
    tickSpacing: launch.tickSpacing,
    path: `tokens/${clean}/token.json`,
  };
}

/**
 * Where a launch landed, written back into the token's own file.
 *
 * Without this the site would have to guess which notice on the board is this
 * token, and the only thing it could guess from is the ticker — which anybody
 * can launch again. An address recorded by the transaction that produced it is
 * not a guess, and the page checks it against the notice before printing a
 * figure.
 */
export function recordLaunched(slug, values) {
  const path = join(TOKENS, slug, "token.json");
  const token = JSON.parse(readFileSync(path, "utf8"));

  token.deployed = { ...token.deployed, ...values };
  writeFileSync(path, `${JSON.stringify(token, null, 2)}\n`);

  console.log(`\nwritten to tokens/${slug}/token.json: ${Object.keys(values).join(", ")}`);
}
