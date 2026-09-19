"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";

import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { StatTile } from "@/components/ui/StatTile";
import { useToollpad } from "@/lib/board";
import { explorerAddress, explorerTx, ROBINHOOD_CHAIN_ID } from "@/lib/chain";
import { BOARD_IS_OPEN, FACTORY_ADDRESS, POOL_MANAGER, toollpadFactoryAbi, type Notice } from "@/lib/contracts";
import { formatEth, formatTokenAmount, shortAddress } from "@/lib/format";
import { decodeSlot0, ethPerToken, extsloadAbi, poolId, poolStateSlot, toollpadPoolKey } from "@/lib/pool";
import { ethInPosition, tokensInPosition } from "@/lib/ticks";
import type { TokenLanguage } from "@/lib/language";
import { copyFor } from "./copy";

type OnChain = { token: Address; notice: number; launchTx: string | null };

/**
 * What the chain says about this token, or why there is nothing to say.
 *
 * It reads the notice this token's own file records — not one it found by
 * matching the ticker, because a ticker is not an identity and anybody can
 * launch another token calling itself the same thing. If the notice at that id
 * turns out to be a different token, nothing is printed at all: a page that
 * would rather show a number than admit a mismatch is a page nobody should read
 * a number off.
 */
export function TokenLive({ onChain, language }: { onChain: OnChain | null; language: TokenLanguage }) {
  const copy = copyFor(language);
  const { hook } = useToollpad();

  const notice = useReadContract({
    address: FACTORY_ADDRESS,
    abi: toollpadFactoryAbi,
    chainId: ROBINHOOD_CHAIN_ID,
    functionName: "noticeAt",
    args: onChain ? [BigInt(onChain.notice)] : undefined,
    query: { enabled: BOARD_IS_OPEN && onChain !== null },
  });

  const found = notice.data as Notice | undefined;
  const agrees = Boolean(found && onChain && found.token.toLowerCase() === onChain.token.toLowerCase());

  const key = agrees && hook && found ? toollpadPoolKey(found.token, hook, found.tickSpacing) : null;

  const slot = useReadContract({
    address: POOL_MANAGER,
    abi: extsloadAbi,
    chainId: ROBINHOOD_CHAIN_ID,
    functionName: "extsload",
    args: key ? [poolStateSlot(poolId(key))] : undefined,
    query: { enabled: key !== null },
  });

  const state = slot.data ? decodeSlot0(slot.data as `0x${string}`) : null;
  const priced = state?.initialized ?? false;

  const eth = priced && found ? ethInPosition(found.liquidity, state!.sqrtPriceX96, found.tickLower, found.tickUpper) : null;
  const unsold =
    priced && found ? tokensInPosition(found.liquidity, state!.sqrtPriceX96, found.tickLower, found.tickUpper) : null;
  const price = priced ? ethPerToken(state!.sqrtPriceX96) : null;
  const bought = unsold !== null && found && found.supply > 0n ? Math.max(0, 1 - Number(unsold) / Number(found.supply)) : null;

  const status = !onChain ? "unlaunched" : !BOARD_IS_OPEN ? "closed" : notice.isLoading ? "loading" : agrees ? "live" : "mismatch";

  return (
    <Panel
      label={copy.onChain}
      aside={
        <Badge tone={status === "live" && priced ? "live" : "idle"}>
          {status === "live" ? (priced ? "live" : "no price") : copy.notLaunched.toLowerCase()}
        </Badge>
      }
    >
      {status === "unlaunched" && <p className="text-sm leading-relaxed text-lane-soft">{copy.notLaunchedBody}</p>}
      {status === "closed" && <p className="text-sm leading-relaxed text-lane-soft">{copy.boardClosed}</p>}
      {status === "loading" && <p className="text-sm text-lane-faint">{copy.reading}</p>}
      {status === "mismatch" && <p className="text-sm leading-relaxed text-rust">{copy.mismatch}</p>}

      {status === "live" && found && (
        <>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <StatTile label={copy.price} value={price === null ? copy.none : `${price.toExponential(2)} ETH`} />
            <StatTile label={copy.inThePool} value={formatEth(eth) ?? copy.none} />
            <StatTile label={copy.unsold} value={unsold === null ? copy.none : formatTokenAmount(unsold)} />
          </div>

          {bought !== null && (
            <div className="mt-4">
              <div className="h-1.5 w-full bg-ground-lift">
                <div className="h-full bg-signal" style={{ width: `${Math.round(bought * 100)}%` }} />
              </div>
              <p className="micro mt-1 text-lane-faint">
                {Math.round(bought * 100)}% {copy.bought}
              </p>
            </div>
          )}

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="micro text-lane-faint">{copy.contract}</dt>
              <dd>
                <a
                  className="text-lane-soft underline decoration-signal/40 underline-offset-4 hover:text-signal"
                  href={explorerAddress(found.token)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortAddress(found.token)} ↗
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="micro text-lane-faint">{copy.notice}</dt>
              <dd className="text-lane-soft">
                #{String(found.id)}
                {onChain?.launchTx && (
                  <>
                    {" · "}
                    <a
                      className="underline decoration-signal/40 underline-offset-4 hover:text-signal"
                      href={explorerTx(onChain.launchTx)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      tx ↗
                    </a>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </>
      )}
    </Panel>
  );
}
