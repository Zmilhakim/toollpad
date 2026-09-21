import type { Address } from "viem";
import { isAddress } from "viem";

import { toollpadFactoryAbi } from "./abi/toollpadFactory";
import { tollHookAbi } from "./abi/tollHook";
import { tollLockerAbi } from "./abi/tollLocker";
import { tollTokenAbi } from "./abi/tollToken";

export { toollpadFactoryAbi, tollHookAbi, tollLockerAbi, tollTokenAbi };

/**
 * The factory the site reads.
 *
 * It is written here rather than only in a dashboard variable because a
 * deployment that forgets a variable does not fail — it quietly builds a page
 * telling visitors the launchpad does not exist. In the file it is in git, it is
 * reviewable in a diff, and a fresh Vercel project serves the right board
 * without anyone remembering to configure it.
 *
 * NEXT_PUBLIC_FACTORY_ADDRESS still wins when set, which is how a preview build
 * points at a different deployment without a commit.
 *
 * This must match `deployed.factory` in ../contracts/toollpad.config.json —
 * that file is the record, this is the copy the browser gets.
 */
const DEPLOYED_FACTORY = "";

const configured = process.env.NEXT_PUBLIC_FACTORY_ADDRESS?.trim() || DEPLOYED_FACTORY;

export const FACTORY_ADDRESS: Address | undefined = isAddress(configured, { strict: false })
  ? (configured as Address)
  : undefined;

/** Whether there is anything on chain to read. */
export const BOARD_IS_OPEN = FACTORY_ADDRESS !== undefined;

/** Uniswap v4 on Robinhood Chain, from Uniswap's deployment record for 4663. */
export const POOL_MANAGER = "0x8366a39CC670B4001A1121B8F6A443A643e40951" as Address;

export const NATIVE = "0x0000000000000000000000000000000000000000" as Address;

/**
 * The three numbers the contracts fix, repeated here for the copy to read.
 *
 * They are not settings and the site never reads them from a form: `TOLL_BPS`
 * and `CREATOR_BPS` are constants in TollHook, `FIXED_SUPPLY` and `LP_FEE` are
 * constants in ToollpadFactory. Where a page shows them next to live data it
 * reads `boardStats()` instead, so a mismatch shows up rather than hiding.
 */
export const TOLL_BPS = 400;
export const CREATOR_BPS = 8_000;
export const LP_FEE = 0;
export const SUPPLY = 1_000_000_000n;

/** The grid a launch opens on. Wide, because a memecoin's range is wide. */
export const LAUNCH_TICK_SPACING = 200;

export const TICKER = "TOLL";

/**
 * The deployments this one replaces. Newest first.
 *
 * Both are still on chain — nothing removes a contract — both are verified, both
 * say Toollpad, and both are still permissionless: a launch into either would
 * work and would charge the rate that deployment was built with. Naming them is
 * the only way a reader who found one on an explorer can tell which is which.
 *
 * `holds` is the part that matters. The 5% one was never posted to, so there is
 * nothing on it. The 4% one carries notice #0 — $TOLL — and that pool cannot be
 * moved: a hook is part of a pool's key, so the pool belongs to the launchpad it
 * opened on, and its tolls go on paying the addresses that deployment names.
 */
export const SUPERSEDED = [
  {
    factory: "0x84834C830E90B11b583ded93d16c09f675528fdF" as Address,
    tollBps: 400,
    deployedOn: "20 September 2026",
    why: "the treasury is an immutable in the hook, and it moved",
    holds: "notice #0, $TOLL — that pool stays there, and its tolls stay with it",
  },
  {
    factory: "0x8f61c8d12f7f3135c1202dfDd113F2B37c6A7fd6" as Address,
    tollBps: 500,
    deployedOn: "19 September 2026",
    why: "the toll was lowered to 4%, and the rate is a constant",
    holds: null,
  },
] as const;

export type Notice = {
  id: bigint;
  token: Address;
  creator: Address;
  name: string;
  symbol: string;
  imageURI: string;
  blurb: string;
  link: string;
  supply: bigint;
  launchedAt: bigint;
  tickSpacing: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
};
