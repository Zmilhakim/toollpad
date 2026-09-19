# Toollpad — posts

Copy for the account, with the image each one goes out with. Nothing here names
an address: fill those in from `toollpad.config.json` after deploying, and check
each one against the chain before posting it. A contract address in a post is
the one thing readers cannot verify by reading the post.

## On chain — the first one to post

*Image: `out/deployed-1600x900.png`. Every line on it is checkable: three
addresses, a transaction, and the address that deployed them. The card is
rendered from `toollpad.config.json`, so it exists after `npm run deploy` and not
before — between a change to the contracts and the redeploy that follows it,
there is nothing for it to print.*

**Indonesian:**

> Toollpad sudah di chain. Robinhood Chain, Uniswap v4.
>
> Satu fee: 4% tiap swap, 80%-nya buat yang nge-launch.
>
> Likuiditas dikunci — bukan dijanjikan, bukan timelock. Locker-nya memang tidak
> punya fungsi untuk menariknya. Source-nya sudah verified, buka sendiri dan
> cari kata `withdraw`. Tidak ada.
>
> Board-nya masih kosong. Siapa pun bisa posting ke situ.

**English:**

> Toollpad is on chain. Robinhood Chain, Uniswap v4.
>
> One fee: 4% of every swap, 80% of it to whoever launched the token.
>
> The liquidity is locked — not promised, not timelocked. The locker has no
> function that takes any out. The source is verified: open it and search for
> `withdraw`. There is nothing there.
>
> The board is empty. Anyone can post to it.

The deployer address is on the card on purpose. It deployed the launchpad and
holds no power over it — no owner, no admin, and `launch` is open to everybody —
which is a claim worth putting next to the address it is about rather than
somewhere it cannot be checked.

## The pinned one

> Toollpad is a launchpad where the fee is the product.
>
> Launch a token: the whole supply goes into a Uniswap v4 pool, the pool is
> locked, and every swap after that pays a 4% toll. 80% of it is yours.
>
> No presale. No allocation. No unlock. Nothing to hold back.

*Image: `out/og-1200x630.png`*

## How the fee works

> One fee, both directions.
>
> Buy: 4% of the ETH you put in. Sell: 4% of the tokens you put in. That is the
> whole schedule — the pool itself charges nothing, so there is no second number
> to read.
>
> 80% to whoever launched the token. 20% to the treasury.

*Image: `out/toll-1600x900.png`*

## Why it cannot be changed later

> The rate lives in a Uniswap v4 hook, and a pool's hook is part of its key.
>
> That means it is fixed when the pool is opened. Not governed, not timelocked,
> not "no plans to change it" — a different hook is a different pool. The rate on
> the last day is the rate on the first.

## What a creator actually owns

> You launch, and you end the transaction holding zero tokens. That is not a
> catch, it is the point: the supply never passes through your hands, so there is
> nothing you could dump if you wanted to.
>
> What you own is 80% of the toll, for as long as anyone trades it.

## The part worth being clear-eyed about

> Locked liquidity means locked. Everything anyone pays for the supply becomes
> liquidity and does not come back out — not for the creator, not for us, not by
> vote.
>
> The toll comes out. The liquidity does not. Those are two different promises
> and we would rather you knew which is which.

## When the first token launches

> First notice on the board: $TICKER.
>
> Supply: 1,000,000,000, all of it in the pool.
> Locked: permanently.
> Toll: 4%, 80% to the creator.
> Contract: 0x…
>
> Read it before you buy it.

*Image: `out/toll-1600x900.png`. Replace the contract line with the real address
and check it against the chain first — `npm run status` prints what the pool
manager actually has.*
