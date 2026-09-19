# Tokens

One folder per token launched through Toollpad. A folder is the launch, written
down before it is sent:

```
lane-one/
  token.json    the launch itself — what goes on chain, and what the scripts read
  PROFILE.md    the account: display name, handle, bio, and what not to print
  art.mjs       the mark, drawn as pixels
  out/          the rendered art — avatar, banner, link preview
```

## Why a folder and not a prompt

A launch is one transaction and nothing about it can be edited afterwards. The
name, the ticker, the sentence on the notice and the two valuations the supply
opens between are all permanent from the moment it confirms, so they are better
reviewed in a diff than typed at a prompt at the moment of sending.

It is the same argument `toollpad.config.json` makes for addresses, and it has
the same rule: **nothing secret goes in a token folder.** Everything here is
public the second it is launched anyway.

```bash
cd ../contracts
TOKEN=lane-one npm run launch                 # prints the plan, sends nothing
TOKEN=lane-one CONFIRM=launch npm run launch  # sends it
```

`profile.language` picks the language the account — and the art — is in: `id` or
`en`, one of them, all the way through. A banner in one language over a feed in
the other reads like a banner somebody else made.

Anything in the file can still be overridden for one run — `NAME`, `SYMBOL`,
`IMAGE`, `BLURB`, `LINK`, `FLOOR_ETH`, `CEIL_ETH` — and the plan prints what it
is about to send either way.

## The art

```bash
cd ../brand
node token.mjs            # every token here
node token.mjs lane-one   # just that one
```

It writes `out/` in the token's folder and copies the pictures into
`site/public/tokens/<slug>/`, which is where `imageURI` in `token.json` points —
so the notice on chain points at a file this repository actually ships.

The figures on the art are **not** typed into the art. `brand/lib/rates.mjs`
reads `TOLL_BPS`, `CREATOR_BPS`, `LP_FEE` and `FIXED_SUPPLY` out of
`contracts/src/` and throws if they are not what the copy says, and it greps
`TollLocker.sol` for a `withdraw`, a `collect`, a `rescue` or a negative
liquidity delta and throws if it finds one. A banner that says *4% toll* and
*liquidity locked* is a claim about deployed code; change the code and nothing
renders until the copy is rewritten.

**No handle and no domain on any image.** The renderer checks each sheet and
refuses rather than trusting anyone to remember — see
[`../brand/X-PROFILE.md`](../brand/X-PROFILE.md#what-the-art-deliberately-does-not-say)
for why that is a rule in this repository rather than a preference.

## What is the same for every token here

Not a style guide — the contracts. Supply of 1,000,000,000, all of it into the
pool; an LP fee of zero; the toll and its split; liquidity locked permanently.
None of those is a field in `token.json`, because none of them is a choice a
launch gets to make.

What a folder chooses is the name, the ticker, the picture, the sentence, and
the two valuations. That is the whole list.
