import Link from "next/link";

import { Panel } from "@/components/ui/Panel";
import { writtenTokens } from "@/lib/tokens";

/**
 * The launches this repository has written down, whether or not they are on
 * chain yet.
 *
 * The board above is the chain's answer and this is not — it is a list of files
 * in `tokens/`, and it says so. Each one links to its own page, where the
 * difference between "written down" and "launched" is the whole layout.
 */
export function WrittenTokens() {
  const tokens = writtenTokens();
  if (tokens.length === 0) return null;

  return (
    <Panel label="Written down">
      <p className="text-sm leading-relaxed text-lane-soft">
        Launches written down in the repository, in the same file the transaction is sent from. Whether one is on chain
        yet is on its own page, read from the chain — it is not claimed here.
      </p>

      <ul className="mt-4 space-y-2">
        {tokens.map((token) => (
          <li key={token.slug}>
            <Link
              href={`/t/${token.slug}`}
              className="flex items-center gap-3 border-2 border-lane-faint/30 bg-ground-lift p-2.5 transition-colors hover:border-signal/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={token.art.avatar} alt="" width={40} height={40} className="size-10 shrink-0 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lane">{token.name}</span>
                <span className="micro text-lane-faint">
                  ${token.symbol} · {token.launch.openingEth} ETH{" "}
                  {token.onChain ? "· on chain" : "· not launched yet"}
                </span>
              </span>
              <span className="micro shrink-0 text-lane-faint">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
