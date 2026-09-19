# Toollpad — the web app

Next.js 15, wagmi and viem. No database, no API: every figure on every page is
read from the factory, straight out of the Uniswap v4 pool manager's storage, or
out of the same file the launch transaction is sent from.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

| Route | What it is |
| --- | --- |
| `/` | The pitch: what it does, what it costs, what it does not promise |
| `/board` | Every launch, newest first, priced from the chain |
| `/launch` | Launch a token — the whole form is six fields and two prices |
| `/dashboard` | What this address launched, and the toll it is owed |
| `/learn` | The mechanism, and the parts worth being clear-eyed about |
| `/t/<slug>` | One token's page, for each folder in `../tokens` |

## A token's page

`/t/<slug>` is built for every folder in [`../tokens`](../tokens), at build time,
from that folder's `token.json` — the same file `npm run launch` sends. So the
page and the transaction cannot disagree about the name, the ticker or the range:
there is one file, not two. `src/lib/tokens.ts` reads it; nothing is read at
request time, and an unknown slug is a 404 rather than a lookup.

The page is in two halves and they are kept apart on purpose. Above, the launch
**as written down**. Below, **what the chain says** — and the only way it knows
which notice is this token is the address `npm run launch` writes back into
`token.json` after the receipt. It never matches on the ticker: a ticker is not
an identity, and anybody can launch another token calling itself the same thing.
If the recorded notice turns out to hold a different address, the page prints the
mismatch instead of the figures.

Its language comes from `profile.language` in the same file, so a token whose
account is in Indonesian gets a page in Indonesian. The launchpad's own chrome
stays as it is.

## It works before anything is deployed

`NEXT_PUBLIC_FACTORY_ADDRESS` is empty, so the site builds and runs and says on
every page that nothing is deployed yet. That is deliberate: a board of zeros
looks exactly like a board nobody has used, and the difference matters. Set the
address — after `npm run deploy` in `../contracts` — and every page turns on.

```bash
cp .env.example .env.local
```

## The ABIs are generated, not copied

`../contracts/compile.mjs` writes `src/lib/abi/*.ts` on every compile. Do not
edit them by hand: the point is that the frontend cannot drift from the contracts
it is calling. Re-run `npm run compile` in `../contracts` after any change to a
contract and the types follow.

## Reading a v4 pool from a browser

There is no pool contract to call in v4 — one manager holds every pool — so
`src/lib/pool.ts` computes a pool's id from its key and pulls slot0 out of the
manager's storage with `extsload`. The slot number and the bit layout are
Uniswap's, from `PoolIdLibrary` and `StateLibrary`. The same code exists in
`../contracts/lib/pool.mjs`, where a test checks it against a real pool manager.

`src/lib/ticks.ts` is v4's `TickMath`, transliterated rather than approximated.
The board uses it to turn a position's liquidity into the two figures worth
showing — the ETH locked in and the supply still unsold — and the launch form
uses it to price a range before the transaction is sent. The contract does not
compute a price; it checks the one it is given leaves the whole supply on the
token's side of spot, and reverts if it does not.

## What the pages do not do

**There is no trading here.** v4 pools are reached through a router, and Robinhood
Chain has Uniswap's own Universal Router, which handles pools with hooks. Adding
a second one to this repository would mean asking people to approve a contract
that has no reason to exist.

**Nothing is vetted.** The board shows what the chain holds, including names,
pictures and links that whoever launched a token put there. A picture is only
ever rendered as an image and a creator's link carries `nofollow`, which is as
far as a launchpad can honestly go.

## Deployed

Live at **https://toollpad.fun**, from `main`.

| | |
| --- | --- |
| Vercel project | `toollpad`, in `zmilhakim-4557` |
| Root directory | `site` |
| Production branch | `main` — every push deploys |
| Domains | `toollpad.fun`, `www.toollpad.fun` |
| Protection | Vercel Authentication on previews only; production is public |

What is still unset, on purpose: `NEXT_PUBLIC_FACTORY_ADDRESS`. There are no
contracts on Robinhood Chain yet, so the live site says so on every page. Deploy
them with `npm run deploy` in `../contracts`, set the variable in the project's
environment, and redeploy — the pages turn on with no code change.

Set `NEXT_PUBLIC_RPC_URL` before this sees any real traffic. The default endpoint
is Robinhood's public one and is rate-limited for wallets, not for a site.

`SITE_URL` follows `VERCEL_PROJECT_PRODUCTION_URL`, which is the custom domain
once one is attached — so the OG tags point at `toollpad.fun` by themselves. Set
`NEXT_PUBLIC_SITE_URL` only if it ever needs to differ from that.
