import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TokenLive } from "@/components/token/TokenLive";
import { copyFor } from "@/components/token/copy";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ROBINHOOD_CHAIN_ID } from "@/lib/chain";
import { CREATOR_BPS, SUPPLY, TOLL_BPS } from "@/lib/contracts";
import { formatBps, formatCount } from "@/lib/format";
import { openingValuation, writtenToken, writtenTokens } from "@/lib/tokens";

/** Only the tokens in `tokens/`. An unknown slug is a 404, not a lookup. */
export const dynamicParams = false;

export function generateStaticParams() {
  return writtenTokens().map((token) => ({ slug: token.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const token = writtenToken((await params).slug);
  if (!token) return {};

  return {
    title: `${token.name} ($${token.symbol})`,
    description: token.blurb,
    openGraph: { images: [{ url: token.art.og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [token.art.og] },
  };
}

/**
 * One token's page.
 *
 * Two halves, kept apart on purpose. Above: the launch as it was written down,
 * out of the same file the launch transaction is sent from — so the page and the
 * transaction cannot disagree. Below: what the chain says, read live, and
 * nothing at all if there is no launch recorded to read.
 *
 * The figures that belong to the launchpad rather than to this token — the toll,
 * the split, the supply — come from `lib/contracts`, which is where the
 * constants in `contracts/src` are written down once.
 */
export default async function TokenPage({ params }: { params: Promise<{ slug: string }> }) {
  const token = writtenToken((await params).slug);
  if (!token) notFound();

  const copy = copyFor(token.language);
  const opening = openingValuation(token);

  const rows: Array<[string, string, string?]> = [
    [copy.opening, `${opening.eth.toFixed(4)} ETH`, copy.openingHint(token.launch.openingEth)],
    [copy.range, `${token.launch.openingEth} ETH → ${token.launch.ceilingEth} ETH`],
    [copy.supply, formatCount(SUPPLY) ?? "—"],
    [copy.intoPool, copy.allOfIt],
    [copy.toll, formatBps(TOLL_BPS) ?? "—", copy.bothWays],
    [copy.split, copy.splitValue(formatBps(CREATOR_BPS) ?? "—", formatBps(10_000 - CREATOR_BPS) ?? "—")],
    [copy.poolFee, copy.zero],
    [copy.venue, `Uniswap v4 · ETH · Robinhood Chain ${ROBINHOOD_CHAIN_ID}`],
    [copy.liquidity, copy.locked],
    [copy.heldBack, copy.nothing],
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={token.art.avatar}
          alt=""
          width={96}
          height={96}
          className="size-24 shrink-0 border-2 border-signal/40 bg-ground-lift object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-display text-3xl text-lane">{token.name}</h1>
            <span className="micro font-semibold text-signal">${token.symbol}</span>
            <Badge tone="signal">{copy.writtenDown}</Badge>
          </div>
          {token.blurb && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lane-soft">{token.blurb}</p>}
        </div>
      </header>

      <Panel label={copy.ticket}>
        <dl className="divide-y divide-signal/20">
          {rows.map(([label, value, hint]) => (
            <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5 first:pt-0 last:pb-0">
              <dt className="micro text-lane-faint">{label}</dt>
              <dd className="text-right text-sm font-semibold text-lane">
                {value}
                {hint && <span className="mt-0.5 block text-xs font-normal text-lane-faint">{hint}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      <TokenLive onChain={token.onChain} language={token.language} />

      <Panel label={copy.theAccount}>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="micro text-lane-faint">{copy.displayName}</dt>
            <dd className="mt-0.5 text-lane">{token.displayName}</dd>
          </div>
          <div>
            <dt className="micro text-lane-faint">{copy.handle}</dt>
            <dd className="mt-0.5 text-lane">
              {/* A handle nobody has registered is printed as a plan, never as a link:
                  a link to it is an introduction to whoever registers it next. */}
              {token.handleRegistered ? (
                <a
                  className="underline decoration-signal/40 underline-offset-4 hover:text-signal"
                  href={`https://x.com/${token.handle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {token.handle} ↗
                </a>
              ) : (
                <>
                  <span className="text-lane-soft">{token.handle}</span>
                  <span className="ml-2 text-xs text-lane-faint">{copy.handleUnregistered}</span>
                </>
              )}
            </dd>
          </div>
          {token.bio && (
            <div>
              <dt className="micro text-lane-faint">{copy.bio}</dt>
              <dd className="mt-0.5 leading-relaxed text-lane-soft">{token.bio}</dd>
            </div>
          )}
        </dl>
      </Panel>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={token.art.banner}
        alt=""
        width={1500}
        height={500}
        className="w-full border-2 border-signal/35"
      />

      <p className="micro">
        <Link className="text-lane-faint hover:text-signal" href="/learn">
          {copy.readMore} →
        </Link>
      </p>
    </div>
  );
}
