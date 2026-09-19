// The numbers on the art, read out of the contracts rather than typed.
//
// A card that prints "4%" is a claim about a deployed contract, and it is worth
// exactly as much as the check behind it. These come from the source the hook
// and the factory are compiled from, and every render — the launchpad's and any
// token's — fails rather than shipping a figure the contracts do not agree with.
//
// So: change a rate in `../contracts/src`, and nothing renders until the copy
// here and in the markdown is rewritten. That is the intended order.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const contracts = join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), "contracts", "src");

/** What the copy in this repository says. The check below is against these. */
export const EXPECTED = {
  tollBps: 400,
  creatorBps: 8_000,
  supply: 1_000_000_000n * 10n ** 18n,
  lpFee: 0,
};

function constantFrom(file, name) {
  const source = readFileSync(join(contracts, file), "utf8");
  // Solidity writes 1_000_000_000e18, so the exponent is part of the literal and
  // not optional to read: dropping it is how a supply of a billion prints as
  // nothing at all.
  const match = source.match(new RegExp(`constant\\s+${name}\\s*=\\s*([0-9_]+)(?:e(\\d+))?\\s*;`));
  if (!match) throw new Error(`${file} no longer declares ${name} — the cards cannot state a rate it does not have`);
  return BigInt(match[1].replaceAll("_", "")) * 10n ** BigInt(match[2] ?? 0);
}

/**
 * The locker's whole claim is a negative: there is no way out. Asserted against
 * the source, so a card saying "locked permanently" cannot outlive the contract
 * that made it true.
 */
function assertNoWayOut() {
  const source = readFileSync(join(contracts, "TollLocker.sol"), "utf8");
  const forbidden = [/function\s+withdraw/, /function\s+collect/, /function\s+rescue/, /liquidityDelta:\s*-/];
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error(`TollLocker.sol now matches ${pattern} — the lock card would be a lie`);
  }
}

export function readRates() {
  const tollBps = Number(constantFrom("TollHook.sol", "TOLL_BPS"));
  const creatorBps = Number(constantFrom("TollHook.sol", "CREATOR_BPS"));
  const supply = constantFrom("ToollpadFactory.sol", "FIXED_SUPPLY");
  const lpFee = Number(constantFrom("ToollpadFactory.sol", "LP_FEE"));

  if (tollBps !== EXPECTED.tollBps || creatorBps !== EXPECTED.creatorBps || supply !== EXPECTED.supply) {
    throw new Error(
      `the contracts now say toll ${tollBps}bps, creator ${creatorBps}bps, supply ${supply} — rewrite the copy before re-rendering`,
    );
  }
  if (lpFee !== EXPECTED.lpFee) {
    throw new Error(`the pool's LP fee is now ${lpFee}, so "one fee" is no longer true — rewrite the copy first`);
  }
  assertNoWayOut();

  return {
    tollBps,
    creatorBps,
    lpFee,
    supplyWei: supply,
    toll: `${tollBps / 100}%`,
    creator: `${creatorBps / 100}%`,
    treasury: `${(10_000 - creatorBps) / 100}%`,
    supply: (supply / 10n ** 18n).toLocaleString("en-US"),
  };
}
