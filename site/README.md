# Toollpad — the web app

Next.js 15, wagmi and viem. Five routes, no database, no API: every figure on
every page is read from the factory or straight out of the Uniswap v4 pool
manager's storage.

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

## Where the factory address comes from

`DEPLOYED_FACTORY` in `src/lib/contracts.ts` holds it, and it is filled in: the
site reads the launchpad at `0xA5d97e5E…03aee5F9A`, the one whose treasury is
`0xE2300F8B…59105FCC`. Two earlier deployments are named in `SUPERSEDED` and on
`/learn`, because both are still on chain and one of them holds a token.

It lives in the source rather than only in a dashboard variable because a build
that forgets a variable does not fail — it quietly serves a page telling visitors
the launchpad does not exist.

`NEXT_PUBLIC_FACTORY_ADDRESS` still overrides it, which is how a preview build
points at a different deployment without a commit:

```bash
cp .env.example .env.local
```

With neither set, the site still builds and runs, and says on every page that
nothing is deployed rather than rendering a board of zeros — which looks exactly
like a board nobody has used, and the difference matters.

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

Live at **https://toollpad.vercel.app**, from `main`.

| | |
| --- | --- |
| Vercel project | `toollpad`, in `zmilhakim-4557` |
| Root directory | `site` |
| Production branch | `main` — every push deploys |
| Domain | `toollpad.vercel.app` |
| Protection | Vercel Authentication on previews only; production is public |

**`toollpad.fun` is registered and does not point here.** It is attached to an
older Vercel project — `tollpad`, one `o`, built from the `Hood-asset`
repository, from before this one was split out — so the domain serves that
project's build and not this one. Moving it is two clicks in the Vercel
dashboard: remove it there, add it here. Until that happens, the address above is
the site's real address, and nothing in this repository should claim otherwise.

What is still unset, on purpose: `NEXT_PUBLIC_FACTORY_ADDRESS`. There are no
contracts on Robinhood Chain yet, so the live site says so on every page. Deploy
them with `npm run deploy` in `../contracts`, set the variable in the project's
environment, and redeploy — the pages turn on with no code change.

Set `NEXT_PUBLIC_RPC_URL` before this sees any real traffic. The default endpoint
is Robinhood's public one and is rate-limited for wallets, not for a site.

`SITE_URL` follows `VERCEL_PROJECT_PRODUCTION_URL`, which is whatever this
project's production hostname is — `toollpad.vercel.app` today, and the custom
domain by itself on the day one is attached here. Set `NEXT_PUBLIC_SITE_URL` only
if it ever needs to differ from that.
