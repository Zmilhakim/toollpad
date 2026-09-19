// A token, read out of the file it is written down in.
//
// A launch is one transaction and nothing about it can be edited afterwards, so
// the name, the ticker, the sentence on the notice and the two valuations the
// supply opens between are better reviewed in a diff than typed at a prompt.
// That file is the token's, not the launchpad's: a token launched here is not
// part of Toollpad, and the ones this repository's own scripts sent live in
// repositories of their own.
//
// So `TOKEN` is a path. `TOKEN=../../lane-one` finds a repository cloned beside
// this one; `TOKEN=lane-one` finds the same thing, because a bare name is tried
// as a sibling checkout too; and `TOKEN=/somewhere/token.json` is taken as it
// is. What is never guessed is which token a launch is for.
//
// It reads and checks before a launch, and writes exactly one thing after one:
// where the token landed. Nothing in a token file is secret, and nothing secret
// ever goes in one.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fail } from "./env.mjs";

const contracts = dirname(dirname(fileURLToPath(import.meta.url)));
const beside = dirname(dirname(contracts)); // where a sibling checkout would be

/**
 * The file `TOKEN` names, or nothing.
 *
 * Four places are tried, in the order that puts what was actually typed first.
 * A directory is allowed because a token lives in one, and `token.json` is
 * always the file inside it.
 */
function findToken(value) {
  const asked = String(value).trim();
  if (asked === "") return null;

  const candidates = [];
  const add = (path) => {
    candidates.push(path.endsWith(".json") ? path : join(path, "token.json"));
  };

  add(isAbsolute(asked) ? asked : resolve(process.cwd(), asked));
  if (!isAbsolute(asked) && !asked.includes("/")) {
    add(join(contracts, "..", "tokens", asked));
    add(join(beside, asked));
  }

  return candidates.find((path) => existsSync(path)) ?? { tried: candidates };
}

const isDecimal = (value) => typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim()) && Number(value) > 0;

/**
 * The token `slug` names, checked hard enough that a bad one fails here rather
 * than inside a simulated transaction where the revert says `EmptyMetadata`.
 */
export function loadToken(value) {
  const found = findToken(value);

  if (!found || typeof found !== "string") {
    fail(
      `no token file at ${value}`,
      "",
      "TOKEN is a path to a token.json, or to the folder holding one. Tried:",
      ...(found?.tried ?? []).map((path) => `  ${path}`),
    );
  }

  const path = found;
  const clean = dirname(path).split("/").pop();

  let token;
  try {
    token = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${path} is not valid JSON: ${error.message}`);
  }

  const say = (...lines) => fail(`${path} — ${lines[0]}`, ...lines.slice(1));

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
      `${path} has already been launched: ${token.deployed.token}`,
      token.deployed.launchTx ? `  in ${token.deployed.launchTx}` : "",
      "",
      "Launching it again would deploy a second contract with the same name and",
      "ticker. If that is really what you want, copy the folder and give the copy",
      "its own name; if the recorded launch is wrong, delete the `deployed` block.",
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
    path,
    slug: clean,
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
export function recordLaunched(path, values) {
  const token = JSON.parse(readFileSync(path, "utf8"));

  token.deployed = { ...token.deployed, ...values };
  writeFileSync(path, `${JSON.stringify(token, null, 2)}\n`);

  console.log(`\nwritten to ${path}: ${Object.keys(values).join(", ")}`);
}
