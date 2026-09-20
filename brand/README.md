# Toollpad — brand kit

Everything here is generated. Edit the source, re-run, commit the output.

```bash
npm install          # sharp + playwright
npm run render       # into out/
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

## A token's own art is not here

A token launched through Toollpad is not part of Toollpad, so its mark, its
banner and its link preview live in its repository rather than this one — the
first is [lane-one](https://github.com/Zmilhakim/lane-one), which carries a copy
of `lib/pixels.mjs` and `lib/sheets.mjs` and draws its own lane.

What this kit keeps is the launchpad's own: `lib/pixels.mjs` turns a grid into an
SVG, `lib/rates.mjs` reads the figures out of the contracts, and `lib/sheets.mjs`
inlines the webfonts, drives the browser that screenshots a layout, and refuses a
sheet that prints a handle or a domain.

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
of `../contracts/src/` and throws if they are not what the copy says. It also
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

Nothing here prints a domain or a handle, and that is checked rather than
remembered: `refuseIdentityOnArt` in `lib/sheets.mjs` scans every sheet before it
is screenshotted and throws if it finds either. The rule had already been broken
once by a card printing `TOOLLPAD.FUN` in its footer — which is exactly the kind
of thing a rule nobody checks is for. See
[`X-PROFILE.md`](X-PROFILE.md#what-the-art-deliberately-does-not-say) for why it
is a rule here rather than a preference.

A domain is the worse of the two. A handle can at least be registered; a domain
survives a move between hosts, so a card printing one goes on pointing wherever
that name points long after the project has left it.
