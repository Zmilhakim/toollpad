# Toollpad — brand kit

Everything here is generated. Edit the source, re-run, commit the output.

```bash
npm install          # sharp + playwright
npm run render         # the launchpad's own kit, into out/
npm run render:token   # the art for every token in ../tokens
node token.mjs lane-one   # just that one
```

Playwright needs its Chromium: `npx playwright install chromium`, unless the
environment already provides one (this repo's web sessions do, and `render.mjs`
finds it).

| File | Use |
| --- | --- |
| `logo-mark.svg` | The gate on its own |
| `logo-wordmark.svg` | TOOLLPAD, no mark |
| `logo-lockup.svg` | Mark + wordmark, for a light background |
| `logo-lockup-dark.svg` | The same, for a dark one |
| `logo-mark-{256,512,1024}.png` | Raster fallbacks |
| `avatar-1000.png` | Profile picture (crops to a circle safely) |
| `banner-1500x500.png` | X / Twitter header |
| `og-1200x630.png` | Link previews |
| `toll-1600x900.png` | The fee schedule, as one card |
| `deployed-1600x900.png` | Where Toollpad is on chain — only exists while it is deployed |

## The tokens launched through it

`token.mjs` renders a mark, an avatar, a banner and a link preview for each
folder in [`../tokens`](../tokens), from that token's own `token.json` and
`art.mjs`. The pieces both renderers share live in `lib/`: `pixels.mjs` turns a
grid into an SVG, `rates.mjs` reads the figures out of the contracts, and
`sheets.mjs` inlines the webfonts and drives the browser that screenshots a
layout — including the two checks that keep a bad picture from shipping quietly,
that every face applied and that nothing overflowed the canvas.

A token's art follows the same rule as this kit: no handle and no domain on any
image. `token.mjs` checks each sheet for both and throws, which is the difference
between a rule and a preference.

## The X account

Display name, handle, bio and what not to print on an image live in
[`X-PROFILE.md`](X-PROFILE.md), with the character counts already measured
against X's limits. Post copy is in [`X-POSTS.md`](X-POSTS.md).

## The ticker

**`$TOLL`**.

Not `$HOOD` — that is Robinhood's NASDAQ ticker, and a token called `$HOOD`
launching on Robinhood Chain reads as an official Robinhood asset to anyone
skimming. Not `$PAD` either, which is every launchpad on every chain.

## The mark is a barrier

A boom gate is the one object that means *you are paying to go through this*
without a word written on it, and at sixteen pixels it is still a barrier —
which is the only test a profile picture has to pass.

`lib/marks.mjs` draws it, and every letter of TOOLLPAD, as rectangles. A logo set
in a webfont breaks wherever that font is not loaded — an email signature, a
print sheet, someone else's deck. These render anywhere an SVG renders, with no
font to ship.

The stripes on the arm are generated rather than hand-drawn, because a diagonal
is the thing a typed-out pixel grid always gets slightly wrong. The arm's top and
bottom rows are left solid: they are the rails that hold it together, and without
them the stripes cut the arm into loose blocks that read as anything but a
barrier.

## The numbers on the cards are checked against the contracts

`lib/rates.mjs` reads `TOLL_BPS`, `CREATOR_BPS`, `LP_FEE` and `FIXED_SUPPLY` out
of `../contracts/src/` and throws if they are not what the copy says — for this
kit and for every token's art, which is the point of it being one file. It also
greps `TollLocker.sol` for a `withdraw`, a `collect`, a `rescue` or a negative
liquidity delta, and throws if it finds one.

A card printing *4%* and *locked permanently* is a claim about deployed code.
Change the code and the render fails until the copy is rewritten — which is the
order those two things should happen in.

The card that prints the contract addresses is rendered only while there are
addresses to print: `deployed` in `toollpad.config.json` is empty between a
change to the contracts and the redeploy that follows it, and the render deletes
the stale card rather than leaving one in `out/` looking current.

## No domain on the art

Nothing here prints a domain or a handle, on purpose. See
[`X-PROFILE.md`](X-PROFILE.md#what-the-art-deliberately-does-not-say) for why
that is a rule in this repository rather than a preference.
