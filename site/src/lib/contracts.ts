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
const DEPLOYED_FACTORY = "0x84834C830E90B11b583ded93d16c09f675528fdF";

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
 * The deployment this one replaced.
 *
 * It charged 5%, was never posted to, and is still on chain — nothing can remove
 * a contract. It is also still permissionless, so a launch into it would work
 * and would charge the old rate. Naming it here is the only way a reader who
 * found it on the explorer can tell which of the two is this launchpad: both are
 * verified, both say Toollpad, and only one of them is what this site talks
 * about.
 */
export const SUPERSEDED = {
  factory: "0x8f61c8d12f7f3135c1202dfDd113F2B37c6A7fd6" as Address,
  tollBps: 500,
  deployedOn: "19 September 2026",
} as const;

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
