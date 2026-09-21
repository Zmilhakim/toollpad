# Standing rules for this repository

Read before starting anything. These are the owner's rules, written down here
because a rule that lives in a chat message is a rule that lasts one session.

## Every project starts from nothing

A new project shares **nothing** with one that already exists. Same purpose,
different everything:

| | |
| --- | --- |
| Repository | Its own. Never a folder inside another project's repo |
| Vercel project | Its own, linked to that repository |
| Domain | Its own |
| Contracts | Its **own deployment** — never another project's factory, hook or locker |
| Deployer wallet | Fresh, never one that has deployed before |
| Treasury wallet | Fresh, never one that already receives from something else |
| Name, ticker, mark | Its own |
| Palette, typeface, motif | Its own — see the design rule below |
| Voice | Its own. Post copy that reads like another project's is the same mistake as a banner that looks like it |

**Why the wallets.** An address is public and permanent. Two projects sharing a
treasury means anybody can read one project's earnings off the other, and a
mistake with one key is a mistake with both. The launchpad's contracts make the
treasury an `immutable`, so a shared one cannot be separated later — it is a
redeploy, and by then there is a pool that cannot move.

**Why the contracts.** A deployment carries its own treasury, its own creator
records and its own board. Launching into an existing one puts the new project
inside the old one's accounting forever, and pools cannot be moved between
launchpads: the hook is part of the pool's key.

**Note on what "new contracts" means here.** The rule as written is a new
*deployment* — `npm run mine && npm run deploy` again, its own three addresses.
Writing new contract *source* for each project is a different and much more
expensive thing: every new code path is new risk, and the tested one has already
been read by an explorer. If the intent is genuinely new source each time, that
should be said out loud, because it is not what this file currently promises.

## Nothing borrows another project's look

Toollpad is a boom gate at night: asphalt, signal yellow, hazard stripes,
Archivo Black over IBM Plex Mono, sharp panels with a yellow batten. Lane One is
a highway guide sign: green panel, white inset border, construction orange,
Overpass. A third project takes neither.

A project wearing another's palette looks like an official product of it — a
claim nobody made and nobody can check — and a shelf of projects that look alike
gives a reader nothing to recognise. Keep the palette and the typeface in one
file each, so an identity is one edit rather than a search.

## Keys never touch this machine

`npm run wallets` in `contracts/` refuses to run in a hosted session on purpose:
a key is only secret while it has existed in exactly one place, and a cloud shell
is not that place. Generate wallets on the owner's own machine. Nothing here ever
asks for a private key, prints one, or writes one to a file — `loadConfig`
refuses to run if anything in the committed config is 66 characters of hex.

## Claims are checked, not remembered

Every figure printed on art or a page is read from the contract source, and the
render fails rather than shipping a number the contracts do not agree with. No
handle and no domain on any image, checked by the renderer rather than trusted to
memory. When a rule is worth having, make something fail when it is broken.
