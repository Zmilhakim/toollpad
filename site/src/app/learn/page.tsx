import type { Metadata } from "next";
import Link from "next/link";

import { Panel } from "@/components/ui/Panel";
import { FACTORY_ADDRESS, SUPERSEDED, TOLL_BPS } from "@/lib/contracts";
import { explorerAddress } from "@/lib/chain";
import { shortAddress } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { ROBINHOOD_CHAIN_ID } from "@/lib/chain";

export const metadata: Metadata = {
  title: "How it works",
  description: "The mechanism, the rate, and the things Toollpad does not promise.",
};

const QUESTIONS = [
  {
    q: "What exactly is the 4%?",
    a: "Four percent of everything paid into the pool, in either direction. Buy with ETH and the toll is 4% of the ETH; sell the token back and it is 4% of the token. Of that, 80% goes to whoever launched the token and 20% to the treasury. There is no second fee: the pool's own LP fee is zero, so the toll is the entire fee schedule.",
  },
  {
    q: "Can the rate be changed later?",
    a: "No. The rate lives in a Uniswap v4 hook, and a pool's hook is part of its key — fixed when the pool is opened. Not governed, not timelocked, not “no plans to change it”: a different hook is a different pool. The split is a constant in the same contract, with no setter under any spelling.",
  },
  {
    q: "Where does the liquidity go?",
    a: "Into a contract with no function that takes any out. Liquidity leaves a v4 pool through exactly one door — a modifyLiquidity with a negative delta — and there is no such call in the locker. A v4 position is also a row in the pool manager rather than an NFT, so there is nothing to transfer, sell, borrow against or approve away by mistake.",
  },
  {
    q: "What does the creator hold after launching?",
    a: "No tokens at all. The supply is minted straight to the locker and goes from there into the pool; it never passes through the creator's wallet or the factory. “Nothing was held back” is not a promise anybody has to keep — there is no moment at which anybody holds anything to keep.",
  },
  {
    q: "Why is the toll charged on the way in?",
    a: "It costs a trader the same either way, but it decides what a creator earns. Charging the input means a buy pays its toll in ETH; charging the output would pay it in the token being bought, which is the one asset a creator already has plenty of.",
  },
  {
    q: "Why does collecting need its own transaction?",
    a: "Because the toll is banked as a claim rather than taken as cash. Moving real assets out of the pool manager mid-swap would mean the manager fronting ETH the trader has not paid yet — on a young pool with no ETH in it, that is a buy that reverts. So the hook mints an ERC-6909 claim during the swap and redeems it for the real thing when you collect.",
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-lane">How it works</h1>
        <p className="mt-2 max-w-2xl text-sm text-lane-soft">
          Uniswap v4 on Robinhood Chain ({ROBINHOOD_CHAIN_ID}). One hook, one fee, and a lock with no key.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {QUESTIONS.map(({ q, a }) => (
          <Panel key={q} label="Q">
            <h2 className="font-display text-lg text-lane">{q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-lane-soft">{a}</p>
          </Panel>
        ))}
      </div>

      <Panel label="There is an older Toollpad on chain">
        <p className="text-sm leading-relaxed text-lane-soft">
          An earlier deployment charged {SUPERSEDED.tollBps / 100}% and went on chain on {SUPERSEDED.deployedOn}. Its
          factory is{" "}
          <a
            className="text-lane underline decoration-signal/50 underline-offset-4 hover:text-signal"
            href={explorerAddress(SUPERSEDED.factory)}
            target="_blank"
            rel="noreferrer"
          >
            {shortAddress(SUPERSEDED.factory)}
          </a>
          , and it is not this one.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-lane-soft">
          The rate is a <code className="text-signal">constant</code> with no setter — that is the whole of what the
          rate promises — so changing it to {TOLL_BPS / 100}% was not a transaction anybody could send. It meant
          deploying all three contracts again. Nothing was stranded: the old board was never posted to, so there is no
          token, no pool and no liquidity on it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-lane-soft">
          It is still there, because nothing can remove a contract, and it is still open to anybody — a launch into it
          would work and would charge the old rate.{" "}
          {FACTORY_ADDRESS ? (
            <>
              The factory this site uses is{" "}
              <a
                className="text-lane underline decoration-signal/50 underline-offset-4 hover:text-signal"
                href={explorerAddress(FACTORY_ADDRESS)}
                target="_blank"
                rel="noreferrer"
              >
                {shortAddress(FACTORY_ADDRESS)}
              </a>
              , the same one in the footer of every page. Check the address before you post to a board.
            </>
          ) : (
            <>Check the address in the footer before you post to any board calling itself Toollpad.</>
          )}
        </p>
      </Panel>

      <Panel label="What this does not promise">
        <ul className="space-y-3 text-sm leading-relaxed text-lane-soft">
          <li>
            <strong className="text-lane">Locked liquidity means locked.</strong> Everything anyone pays to buy a token
            becomes liquidity and does not come back out — for the creator as much as for anyone else. The toll comes
            out; the liquidity does not.
          </li>
          <li>
            <strong className="text-lane">A toll is only earned when somebody trades.</strong> A launch nobody buys
            earns nothing. Nothing here makes anybody want a token.
          </li>
          <li>
            <strong className="text-lane">None of it is audited.</strong> The contracts are readable and tested against
            Uniswap&rsquo;s own pool manager, which is not the same thing as audited.
          </li>
          <li>
            <strong className="text-lane">Anyone can launch anything.</strong> The board does not vet names, pictures or
            links, and a picture or a link on a notice was put there by whoever launched it. Read the contract address
            before you buy anything.
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link href="/launch" className={buttonClasses("signal")}>
            Launch a token
          </Link>
          <Link href="/board" className={buttonClasses("quiet")}>
            Read the board
          </Link>
        </div>
      </Panel>
    </div>
  );
}
