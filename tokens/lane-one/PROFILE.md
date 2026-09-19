# Lane One — the account

Everything needed to set `$LANE` up, in the fields X asks for. Character counts
were measured, not estimated; X counts Unicode code points, and the em dash
counts as one.

The launch itself is in [`token.json`](token.json) — that file is what
`npm run launch` sends, and this one is what goes around it.

## The name

**Lane One.** The first token launched through Toollpad, and a road the whole way
down: the launchpad is a boom gate, and this is the lane that runs through it.

It is deliberately **not** called after the gate. A token named `$GATE` or
`$TOLL`, wearing the launchpad's own mark, is the exact shape of the fake version
of Toollpad — and the reader who cannot tell them apart is the one it would cost.
The mark here is a lane of road: two solid edge lines and a broken centre line,
drawn on the same twelve-by-twelve grid as the gate and sharing nothing else.

## Ticker

**`$LANE`**. Not `$TOLL`, which is the launchpad's own ticker, and not `$HOOD`,
which is Robinhood's NASDAQ ticker and would read as an official Robinhood asset
to anyone skimming.

## Display name — max 50

**Pick this** (16 characters):

```
Lane One | $LANE
```

Alternatives: `Lane One` (8) · `Lane One — $LANE, 4% toll` (25)

## Handle

**`@laneone` is a proposal, not a registration.** Nothing in this repository has
claimed it, so nothing here prints it as if it had — not the banner, not the
avatar, not the link preview, and the renderer refuses rather than trusting
anyone to remember.

Register it first, then fill in `profile.handle` and `link` in `token.json` and
re-render. If it is taken, `@lane_one` and `@onelanetoken` are the fallbacks, in
that order — and whichever one is registered is the only one that ever gets
written down here, because a handle with two spellings in circulation is a handle
someone else can be.

## Bio — max 160

One language, and stay in it: a bio in English over a feed in Indonesian reads
like a bio somebody else wrote.

**English** (147 characters):

```
One lane, one toll. 4% of every swap on Uniswap v4, 80% of it to whoever launched it. A billion supply, all in the pool. Liquidity locked for good.
```

**Indonesian** (141 characters):

```
Satu lajur, satu toll. 4% tiap swap di Uniswap v4, 80% buat yang nge-launch. Supply 1 miliar, semua masuk pool. Likuiditas dikunci selamanya.
```

### The rest of them

English:

| Count | Text |
| --- | --- |
| 140 | `The first lane through the gate. 4% of every swap, 80% of it to whoever launched it. A billion supply, all of it in a pool nobody can drain.` |
| 141 | `One fee, both directions: 4% of everything paid in. The whole billion went into the pool, the pool is locked, and the pool's own fee is zero.` |
| 139 | `Launched through Toollpad on Uniswap v4. 4% toll each way, 80% to the creator. No presale and no allocation — there was nowhere to put one.` |
| 110 | `4% of every swap. 80% of it to the creator. The rest goes into a pool nobody can drain, this account included.` |

Indonesian:

| Count | Text |
| --- | --- |
| 138 | `Token di Uniswap v4: toll 4% tiap swap, dua arah, 80% buat creator. Supply 1 miliar masuk pool semua dan likuiditasnya nggak bisa ditarik.` |
| 142 | `Nggak ada presale, nggak ada jatah tim. Supply 1 miliar langsung masuk pool dan dikunci. Tiap swap kena toll 4%, 80%-nya buat yang nge-launch.` |
| 121 | `Lajur pertama lewat palang. 4% tiap swap, 80% buat yang nge-launch, sisanya masuk pool yang nggak bisa dikuras siapa pun.` |

### What is deliberately not in any of them

**A price, a market cap, or a holder count.** All three move, and a bio does not.
The opening tick is 1.7 ETH for the whole supply, which is a fact about one
transaction and stays true forever — but written in a bio it reads as what the
token is worth today, which it will not be by the second trade.

Everything that *is* in them is a constant in a contract: `TOLL_BPS` is 400,
`CREATOR_BPS` is 8000 and `FIXED_SUPPLY` is a billion, all in `contracts/src/`,
none with a setter. Change one and this file is wrong — so change this file too.

## Website

Leave it empty until the launch confirms, then:

```
https://toollpad.fun
```

Not an explorer page. It looks like a website, it is not one, and it goes stale
the first time anything is redeployed. The token's address belongs in a post
where it can be read against the chain, and on the board, which reads it from the
chain itself.

## Images

| Field | File | Size |
| --- | --- | --- |
| Profile picture | `out/avatar-1000.png` | 1000 × 1000 |
| Header | `out/banner-1500x500.png` | 1500 × 500 |
| Link preview | `out/og-1200x630.png` | 1200 × 630 |

The avatar is full-bleed: the lines of the lane run off all four edges, so X's
circular crop takes road rather than taking the corners off a picture of road.

Re-render them with `node token.mjs lane-one` in `../../brand`.

## The launch, as it will be sent

| | |
| --- | --- |
| Opening tick | 201800 — 1.7234 ETH for the whole supply |
| Range | 1.7 ETH at the floor, 170 ETH at the ceiling |
| Supply | 1,000,000,000 — all of it into the pool |
| Toll | 4% of everything paid in, either direction |
| Split | 80% creator, 20% treasury |
| Pool fee | Zero |
| Venue | Uniswap v4, native ETH, Robinhood Chain 4663 |
| Liquidity | Locked in the locker, permanently |
| Held back | None of it |

The opening tick is the top of the range: spot starts where the token is
cheapest, so the first buy fills immediately and the pool never asks the locker
for ETH it does not have. It takes roughly `sqrt(1.7 × 170)` ≈ 17 ETH of buying
to work through the whole supply.

**1.7234, not 1.7.** Ticks are a grid 200 wide and 1.7 ETH does not land on one,
so the launch opens at the nearest tick — and both edges round the same way, in
the direction of a dearer token, so the sale never starts below the floor that
was asked for. The art prints 1.7234 because that is what the pool will actually
open at; 1.7 is what was asked for, and only one of the two is a fact about the
transaction. `TOKEN=lane-one npm run launch` prints both before it sends
anything, and sends nothing without `CONFIRM=launch`.

## Posts

**Launch — Indonesian:**

> Lane One ($LANE) sudah ada di board Toollpad. Uniswap v4, pair ETH asli.
>
> Supply 1 miliar, semuanya masuk pool. Nggak ada presale, nggak ada jatah tim,
> nggak ada yang dikunci buat siapa-siapa — nggak ada tempat buat nyimpennya.
>
> Tiap swap kena toll 4%, dua arah. 80%-nya buat yang nge-launch.
>
> Likuiditasnya dikunci. Bukan dijanjikan, bukan timelock: locker-nya memang
> nggak punya fungsi buat narik.
>
> Contract: 0x…

**Launch — English:**

> Lane One ($LANE) is on the Toollpad board. Uniswap v4, paired against native
> ETH.
>
> A billion supply, all of it in the pool. No presale, no allocation, nothing
> held back — there is nowhere to hold it.
>
> Every swap pays a 4% toll, both directions. 80% of it goes to whoever launched
> it.
>
> The liquidity is locked. Not promised, not timelocked: the locker has no
> function that takes any out.
>
> Contract: 0x…

*Image: `out/banner-1500x500.png` or `out/og-1200x630.png`. Fill the contract
line in from the launch receipt and check it against the chain first —
`npm run status` in `../../contracts` prints what the pool manager actually has.
A contract address in a post is the one thing readers cannot verify by reading
the post.*
