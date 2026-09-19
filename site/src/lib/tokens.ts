import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { Address } from "viem";

import type { TokenLanguage } from "./language";
import { SUPPLY } from "./contracts";
import { ethPerToken } from "./pool";
import { launchRange, pricePerToken } from "./ticks";

/**
 * The tokens this repository has written down, read from `tokens/` at build time.
 *
 * Every page here is prerendered, so this runs while the site is being built and
 * never at request time — there is no filesystem to reach on a serving edge, and
 * that is deliberate. The folder is the same one `npm run launch` reads, so a
 * token's page and the transaction that launches it cannot disagree about the
 * name, the ticker or the range: there is one file, not two.
 *
 * What is *not* here is anything the chain knows. A page describes the launch as
 * it was written; `TokenLive` reads what actually happened, and says so
 * separately.
 */
const TOKENS_DIR = join(process.cwd(), "..", "tokens");

export type { TokenLanguage };

export type WrittenToken = {
  slug: string;
  name: string;
  symbol: string;
  blurb: string;
  link: string;
  language: TokenLanguage;
  displayName: string;
  handle: string;
  handleRegistered: boolean;
  bio: string;
  launch: { openingEth: string; ceilingEth: string; tickSpacing: number };
  /** Where the art is served from, which is where `imageURI` on the notice points. */
  art: { avatar: string; banner: string; og: string };
  /**
   * Where the launch landed, written back by `npm run launch` from the receipt.
   *
   * Absent until it has been launched, and that absence is the whole point: the
   * page has no other way to know which notice is this token, and the only thing
   * it could guess from is the ticker — which anybody can launch again.
   */
  onChain: { token: Address; notice: number; launchTx: string | null; chainId: number | null } | null;
};

type RawToken = {
  name?: string;
  symbol?: string;
  blurb?: string;
  link?: string;
  launch?: { openingEth?: string; ceilingEth?: string; tickSpacing?: number };
  deployed?: { token?: string; notice?: number; launchTx?: string; chainId?: number };
  profile?: {
    displayName?: string;
    handle?: string;
    handleRegistered?: boolean;
    language?: string;
    bio?: Record<string, string>;
  };
};

function read(slug: string): WrittenToken | null {
  const path = join(TOKENS_DIR, slug, "token.json");
  if (!existsSync(path)) return null;

  const raw = JSON.parse(readFileSync(path, "utf8")) as RawToken;
  const launch = raw.launch ?? {};
  if (!raw.name || !raw.symbol || !launch.openingEth || !launch.ceilingEth) return null;

  const language: TokenLanguage = raw.profile?.language === "en" ? "en" : "id";
  const art = `/tokens/${slug}`;

  // An address and a notice, or neither. Half a record would be a page printing
  // figures it cannot attribute to anything.
  const deployed = raw.deployed ?? {};
  const onChain =
    /^0x[0-9a-fA-F]{40}$/.test(deployed.token ?? "") && Number.isInteger(deployed.notice)
      ? {
          token: deployed.token as Address,
          notice: deployed.notice as number,
          launchTx: deployed.launchTx ?? null,
          chainId: deployed.chainId ?? null,
        }
      : null;

  return {
    slug,
    name: raw.name,
    symbol: raw.symbol,
    blurb: raw.blurb ?? "",
    link: raw.link ?? "",
    language,
    displayName: raw.profile?.displayName ?? `${raw.name} | $${raw.symbol}`,
    handle: raw.profile?.handle ?? "",
    handleRegistered: raw.profile?.handleRegistered === true,
    bio: raw.profile?.bio?.[language] ?? "",
    launch: {
      openingEth: launch.openingEth,
      ceilingEth: launch.ceilingEth,
      tickSpacing: launch.tickSpacing ?? 200,
    },
    art: {
      avatar: `${art}/avatar-1000.png`,
      banner: `${art}/banner-1500x500.png`,
      og: `${art}/og-1200x630.png`,
    },
    onChain,
  };
}

export function writtenTokens(): WrittenToken[] {
  if (!existsSync(TOKENS_DIR)) return [];
  return readdirSync(TOKENS_DIR)
    .map(read)
    .filter((token): token is WrittenToken => token !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function writtenToken(slug: string): WrittenToken | null {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? read(slug) : null;
}

/**
 * Where the pool will open, run through the same tick math the launch runs.
 *
 * A valuation is asked for and a tick is what the pool gets, and the two are
 * never quite the same number — the grid is 200 wide, and both edges round
 * towards a dearer token so the sale never starts below the floor. The page
 * prints both, because only one of them is a fact about the transaction.
 */
export function openingValuation(token: WrittenToken) {
  const range = launchRange({
    floorEthPerToken: pricePerToken(token.launch.openingEth, SUPPLY),
    ceilEthPerToken: pricePerToken(token.launch.ceilingEth, SUPPLY),
    tickSpacing: token.launch.tickSpacing,
  });

  return {
    ...range,
    /** What the whole supply is worth at the opening tick, in ETH. */
    eth: ethPerToken(range.sqrtPriceX96) * Number(SUPPLY),
  };
}
