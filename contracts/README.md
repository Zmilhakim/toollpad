# Toollpad — contracts

Four contracts on **Uniswap v4**, compiled with solc-js and tested on a local EVM
against Uniswap's own `PoolManager`, deployed as it ships. No Hardhat, no
Foundry, no network access needed to run the tests.

| Contract | Job |
| --- | --- |
| `ToollpadFactory` | The board. Launches a token, opens its pool, locks the supply in — one transaction. |
| `TollHook` | The toll gate. 4% of every swap, 80% to the creator, 20% to the treasury. |
| `TollLocker` | Holds every launch's liquidity, and has no function that gives any back. |
| `TollToken` | Fixed-supply ERC20. No mint, no owner, no pause. |

Compile first, always. `out/` is built rather than committed, so a fresh checkout
has nothing for the scripts to read.

```bash
npm install
npm run compile   # writes out/, PoolManager included, and the site's ABIs
npm test          # compiles, then launches a token and trades against it
npm run wallets   # makes the two keys — on your machine, not a server
npm run whoami    # which address does the key I stored control?
npm run mine      # the salt the hook needs, printed before anything is spent
npm run deploy    # puts the factory, the hook and the locker on chain
npm run launch    # posts one token to the board — prints the plan first
npm run status    # what the pool manager says about the board, right now
npm run collect   # take the toll you are owed
```

## What a launch does

`launch` is a single transaction, and it costs nothing but gas:

1. Deploys the token and mints the entire fixed supply — 1,000,000,000 — straight
   to the locker.
2. Opens a v4 pool of **native ETH against the token**, with `TollHook` in the
   key and an **LP fee of zero**, priced at the top of the launch range.
3. Puts the whole supply in as one position the locker cannot take back.

The creator ends the transaction holding no tokens. The supply never passed
through their hands or the factory's, so *nothing was held back* is not a promise
anybody has to keep — there is no moment at which anyone holds anything to keep.

## The toll

**4% of everything paid into the pool, in either direction.** Buy with ETH and
the toll is 4% of the ETH. Sell the token back and it is 4% of the token. Of
that, 80% goes to whoever launched the token and 20% to the treasury.

There is no second fee. The pool's own LP fee is zero, which is not a setting —
`LP_FEE` is a constant in the factory. That matters for a reason beyond
simplicity: an LP fee would accrue to a position held by a contract with no way
to withdraw, so it would be money paid by traders that nobody can ever collect.

### Why the toll is charged on the way in

It costs a trader the same either way, but it decides what a creator earns.
Charging the input means a buy pays its toll in ETH; charging the output would
pay it in the token being bought, which is the one asset a creator already has
plenty of.

### Exact input and exact output are two different calls

v4 hands a hook a *specified* and an *unspecified* currency, and which one is the
input depends on the direction of the swap:

* **Exact input** (`amountSpecified < 0`) — the specified currency is the input.
  `beforeSwap` returns a positive specified delta, which the pool manager
  subtracts from the amount reaching the curve. The trader pays exactly what they
  asked to pay and 96% of it is swapped.
* **Exact output** (`amountSpecified > 0`) — the specified currency is the
  output, and the input is not known until the curve has run. So the toll is
  charged in `afterSwap`, whose return lands on the unspecified currency — the
  input — at 4/96 of what the swap cost, rounded up. Still 4% of the total.

There is a test for each, and one for a swap so small the toll rounds to zero.

### The toll is banked as a claim, not taken as cash

`take` would move real assets out of the pool manager at a point in the swap
where the trader has not paid yet. On a young pool with no ETH in it, that is a
buy that reverts — the pool manager would be fronting ETH it does not hold.

So the hook `mint`s ERC-6909 claims against the pool manager instead. No asset
moves during the swap, the trader settles as normal, and the claim is redeemed
for the real thing in `withdraw`, in a transaction of its own. One of the tests
asserts the obvious invariant: what the hook's ledger says it owes equals the
claims it holds, after every kind of trade.

### Withdrawing

`withdraw(currency)` and `withdrawMany(currencies)` pay **the caller** — there is
no recipient argument, so no shape of call pays one account out of another's
balance. The ledger is keyed by address rather than by pool, so a creator with
three launches takes their ETH in one transaction.

## The hook's address is not a detail

A v4 pool works out which callbacks to make by reading the **low 14 bits of the
hook's own address**. The permissions *are* the address. So the hook cannot be
deployed wherever it lands: the address has to be mined for.

The factory deploys the hook with CREATE2 in its own constructor, from a salt
passed in. That salt has to be mined against an address the factory does not have
yet — its own — which is an ordinary CREATE address and so can be worked out from
the deployer and its next nonce. `lib/hooks.mjs` does that, `npm run mine` prints
it, and `npm run deploy` does it again for real.

**The way this goes wrong is a failed transaction, not a silent one.** The hook's
constructor checks its own address against the flags it implements and reverts if
they do not match, which takes the whole deployment down with it. A launchpad
whose toll is quietly never charged is the failure mode worth spending a
constructor check on.

```
BEFORE_INITIALIZE | BEFORE_SWAP | AFTER_SWAP
                  | BEFORE_SWAP_RETURNS_DELTA | AFTER_SWAP_RETURNS_DELTA   = 0x20cc
```

`BEFORE_INITIALIZE` is there for a second reason: it is how only the factory can
open a pool with this hook in it. Nobody can point the toll at a pool Toollpad did
not launch, and no pool can exist with a toll and nowhere to send it.

## Two promises, and they are not the same one

**The liquidity never comes out.** Everything anyone pays to buy a token becomes
liquidity, and liquidity leaves a v4 pool through exactly one door: a
`modifyLiquidity` with a negative delta. There is no such call in `TollLocker`.
Search the file — every liquidity delta in it is zero or positive. And because a
v4 position is a row in the pool manager keyed by the address that added it
rather than an NFT, there is nothing to transfer, sell, borrow against or approve
away either.

**The toll does come out**, to two addresses fixed before the token existed: the
creator recorded at launch, and the `immutable` treasury in the hook.

This is the part worth being clear-eyed about. Locked liquidity means the money
people pay for supply is locked — for the creator as much as for anyone.

## What is fixed, and why

| Fixed | Why |
| --- | --- |
| Supply, at 1,000,000,000 | So no launch can quietly print more than another |
| LP fee, at zero | So the toll is the only fee, and no fee accrues where nobody can collect it |
| The hook | It is part of the pool's key, so the rate on the last day is the rate on the first |
| The pairing, native ETH | `address(0)` is always `currency0`, so the token is always `currency1` and its supply always sits below spot. No WETH, no address-ordering puzzle |
| The treasury | An `immutable` in the hook, with no setter under any spelling |

A creator chooses the name, the ticker, the picture and the price range. That is
the whole list. There is no allocation, no vesting and no cliff, because there is
nowhere to put one.

## The two keys

`npm run wallets` prints them once and saves them nowhere. It refuses to run if
stdout is not a terminal, and refuses again if the environment looks like CI or a
hosted workspace — a key is only secret while it has existed in exactly one
place, and a cloud shell is not that place. A phone running Termux is a fine
place; a web IDE is not.

**Deployer.** Sends one transaction and then matters almost not at all: the
launchpad has no owner, `launch` is permissionless, and the salt for the hook is
mined against whoever is deploying, so a different deployer is not a problem —
only a *changed* one between mining and sending is, and `deploy.mjs` mines it
itself to make that impossible.

**Treasury.** Receives 20% of every toll, forever, and is an `immutable` in the
hook. There is no setter under any spelling. `deploy.mjs` reads it back off the
chain after deploying and refuses to go on if it is not the address that was
asked for. It has to be an address that can call `withdraw` — a contract that
cannot make that call can never be paid — and it should be a hardware wallet
rather than a generated key, because it never signs anything else.

```bash
read -rs DEPLOYER_KEY && export DEPLOYER_KEY   # nothing echoes, nothing is logged
npm run whoami                                # prints the address, never the key
```

## The launch, written down

Everything public lives in `toollpad.config.json`, and every script reads it from
there:

```json
{
  "chainId": 4663,
  "poolManager": "0x8366a39CC670B4001A1121B8F6A443A643e40951",
  "treasury": "",          // where the treasury's 20% goes, forever
  "deployer": "",          // the address that deploys — its address, not its key
  "launch": {
    "tickSpacing": 200,
    "floorEth": "1.7",     // the whole supply is worth this much where selling starts
    "ceilEth": "170"       // …and this much at the far end of the range
  },
  "deployed": { }          // deploy.mjs fills this in
}
```

Addresses are public and belong in a file that gets reviewed in a diff rather
than retyped at a prompt — `treasury` in particular, since it is immutable from
`npm run deploy` onwards. **Keys never go in it.** They reach the scripts through
`DEPLOYER_KEY` in your shell, and `loadConfig` refuses to run at all if anything
in the file is 66 characters of hex.

### The venue

Uniswap v4 is live on Robinhood Chain. The address comes from Uniswap's own
deployment record,
[`deployments/4663.md`](https://github.com/Uniswap/contracts/blob/main/deployments/4663.md):

| Contract | Address |
| --- | --- |
| PoolManager | `0x8366a39CC670B4001A1121B8F6A443A643e40951` |

That is the only venue address a launch needs. v4 holds every pool in one
manager, and the other side is native ETH, so there is no factory, no position
manager and no WETH to record — the three things the v3 launchpad in this
repository has to name and cross-check.

## Pricing a launch

Two numbers decide everything: what the whole supply is worth where selling
starts (`floorEth`) and what it is worth at the far end of the range
(`ceilEth`). It takes roughly `sqrt(floor × ceil)` ETH of buying to consume the
whole supply, so the pair sets the capacity. Set it too low and the supply runs
out early; too high and the price barely answers the buying, which on a young
chain reads as a dead chart.

Because the token is `currency1`, a dearer token is a *lower* tick: the floor
price is the top of the range and the ceiling is the bottom. Spot is initialised
at the top, so the first buy fills immediately and the pool never asks the locker
for ETH it does not have. `lib/ticks.mjs` is v4's `TickMath` transliterated
rather than approximated, because a price one tick off the range edge is a launch
the factory refuses.

A launch can be written down before it is sent. `TOKEN` is a path to a
`token.json` — the name, the ticker, the picture, the sentence and both
valuations — so the values that are permanent from the moment the transaction
confirms are reviewed in a diff rather than typed at a prompt.

That file belongs to the token rather than to this repository. A token launched
here is not part of Toollpad: `launch` is open to anybody and nothing gets
special treatment, so its file, its art and its page live in a repository of its
own, cloned beside this one. The first one is
[lane-one](https://github.com/Zmilhakim/lane-one).

```bash
TOKEN=../../lane-one npm run launch                 # prints the plan, sends nothing
TOKEN=../../lane-one CONFIRM=launch npm run launch  # sends it

NAME="Some Token" SYMBOL=SOME npm run launch                 # the same, ad hoc
NAME="Some Token" SYMBOL=SOME CONFIRM=launch npm run launch
```

A bare `TOKEN=lane-one` is tried as a sibling checkout too, so both spellings
find the same file. `NAME`, `SYMBOL`, `IMAGE`, `BLURB`, `LINK`, `FLOOR_ETH` and
`CEIL_ETH` override the file for one run.

After the receipt, the token's address, its notice id and the transaction are
written back into that same `token.json`, under `deployed` — the token's own page
needs to know which notice on the board is its own, and an address recorded by
the transaction that produced it is the only answer that is not a guess. The
alternative is matching on the ticker, and anybody can launch another token
calling itself the same thing. The same record is what makes a second launch of
the same file refuse.

The plan prints the toll the factory being launched into actually charges — read
off the chain, not repeated from this repository — which is the last place a
launch into the wrong launchpad can still be noticed.

**Do not chain these with `&&`.** A dry run is a success, so the first exits 0
without sending anything and the next command in the chain runs against a launch
that never happened.

## Testing against the real thing

`test/contracts.test.mjs` deploys Uniswap's `PoolManager` — the shipped contract,
not a model of it — launches a token into it, buys with ETH, sells back, buys an
exact amount, and then tries to get something out that should not come out. So
the flash accounting, the tick crossing and the ERC-6909 claims are Uniswap's own.
`test/hooks.test.mjs` covers the address arithmetic on its own, because a hook
mined wrong does not fail loudly.

The EVM has to be Cancun or later: v4 keeps its lock and its deltas in transient
storage.

## Deployed once, at 5% — and superseded

Toollpad went on chain on Robinhood Chain (4663) on 19 September 2026, in
transaction
`0x5c267a8abd4b82a3b8c24517c07ebf5800f51635b396e4d9f84f14e0b2970a0d`, charging a
toll of **5%**:

| Contract | Address | Source |
| --- | --- | --- |
| `ToollpadFactory` | [`0x8f61c8d1…7c6A7fd6`](https://robinhoodchain.blockscout.com/address/0x8f61c8d12f7f3135c1202dfDd113F2B37c6A7fd6?tab=contract) | verified |
| `TollHook` | [`0x31302e15…D973a0Cc`](https://robinhoodchain.blockscout.com/address/0x31302e1547AeE110ADf07fe55e6a968AD973a0Cc?tab=contract) | verified |
| `TollLocker` | [`0xB13Be047…089F9C575`](https://robinhoodchain.blockscout.com/address/0xB13Be0475d312dedD2B952c51A43924089F9C575?tab=contract) | verified |

**The toll in this repository is now 4%, so those three are not it.** `TOLL_BPS`
is a `constant` with no setter — that is the whole claim the rate makes — so
lowering it is not a transaction anybody can send. A different rate is a
different hook; a hook is part of a pool's key; and the factory deploys its own
hook in its constructor. 5% to 4% is therefore a redeploy of all three
contracts, which is the mechanism working rather than failing.

Nothing is stranded by that. **The board was never posted to** — the 5% factory
launched no token, so there is no pool, no locked liquidity and no creator owed
anything on it. The contracts stay on chain because nothing can remove them, and
nothing in this repository points at them any more: `deployed` in
`toollpad.config.json` is empty again, and those addresses are kept beside it
under `superseded`, with the rate they charge, so the record of what was deployed
survives rather than being quietly overwritten by the next deploy.

The salt goes with them. `deployed.hookSalt` was mined against the 5% hook's
creation code, and changing a constant changes that code — the old salt now lands
the hook on an address without the flags, which its own constructor rejects. So
it is mined again:

```bash
npm run mine     # the salt for the 4% hook
npm run deploy   # factory, hook and locker, again
npm run verify   # publish the source of the three that now matter
```

The treasury does not change: `0xb1A81E4A729c87560eF12d7652D883e803C5422E` is
passed in again and read back off the new hook before `deploy.mjs` will go on. It
is an `immutable` in the new hook exactly as it was in the old one.

## Publishing the source

```bash
npm run verify
```

Run it straight after deploying, and again after each launch. It spends no gas
and needs no key — verification is a claim about source code, checked by
recompiling it, and the chain is not touched.

**This is not a nicety.** Everything this project says about itself is a
statement about code: the locker has no function that removes liquidity, the
rate is a `constant` with no setter, the treasury is an `immutable`. An explorer
showing only bytecode turns all of that into something people have to take on
trust, at exactly the moment they are deciding whether to.

It publishes the launchpad's three contracts and, reading the board from the
chain, the newest launched tokens — a token's own page is where a buyer lands,
so an unverified token is the one that matters most. `TOKENS=20` widens that.

Two details that make it work:

**The compile input stands on its own.** solc resolves imports by calling back,
so the input `compile.mjs` hands it holds only our own files — an explorer given
that would fail on the first Uniswap import. The callback records what it
answered, `compile.mjs` writes a standalone input with all 60 sources inlined,
and then recompiles it with no callback and checks the bytecode is identical
before saving it. An input that compiles differently is rejected on submission,
which is a slow and confusing way to find out.

**Constructor arguments are supplied rather than guessed.** The hook and the
locker were deployed by the factory, so there is no creation transaction for an
explorer to recover them from. The factory's own third argument is the mined
salt, which is why `deploy.mjs` records it in the config: re-mining it later
means reproducing the exact nonce the deploy was sent at, and that is the one
input that does not survive.

Blockscout's public instance sits behind Cloudflare and rate-limits. A 429 is
the server asking for a pause rather than refusing, so every call goes through
`lib/backoff.mjs`. If Cloudflare answers with a challenge page instead, the
script prints the manual route and the constructor arguments to paste.

## Not audited

None of this is audited. What the scripts do instead is check what can
be checked before spending gas: that the RPC really is the chain the config
names, that the pool manager answers like one, that the key signing is the
address the config expects, and — after deploying — that the hook landed on a
flagged address and holds the treasury that was asked for. `launch.mjs` simulates
the whole transaction against the node before it will broadcast.
