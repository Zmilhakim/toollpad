# Toollpad — posts

Copy for the account, with the image each one goes out with. Nothing here names
an address: fill those in from `toollpad.config.json` after deploying, and check
each one against the chain before posting it. A contract address in a post is
the one thing readers cannot verify by reading the post.

Every post here fits in 280 characters, so none of it depends on the account
having a paid tier.

## The first one — a thread, not an announcement

*Image on post 1: `out/deployed-1600x900.png`.*

Every launchpad's first post is the same post: name, chain, fee, "we're live,
anyone can launch." It reads as a claim, so it gets answered like one — with
nothing, or with "proof?". This one does not announce anything. It hands the
reader something to go disprove, and the addresses to do it with.

**Do not post this until `npm run verify` has all three contracts green.** The
whole thread tells people to go read the source. Until Blockscout is showing it,
that instruction leads to a page of bytecode and the thread argues against
itself.

### Post 1 — the claim someone can break

**Indonesian:**

> Jangan percaya gua. Cek aja.
>
> Likuiditas tiap token di Toollpad ditahan satu kontrak. Buka source-nya, cari
> `withdraw`, `collect`, atau liquidity delta negatif.
>
> Nggak ada. Bukan dijanjikan, bukan di-timelock — fungsinya emang nggak
> ditulis.
>
> 4% tiap swap, 80% ke yang nge-launch.

**English:**

> Don't take my word for it. Go look.
>
> Every token on Toollpad has its liquidity held by one contract. Search its
> source for `withdraw`, `collect`, or a negative liquidity delta.
>
> Nothing there. The function was never written.
>
> 4% of every swap, 80% to whoever launched it.

### Post 2 — the first token got no better deal

An earlier draft of this post said the board was empty, which was true until
notice #0 went up on 2026-09-21. Saying it now would be a lie about something
anyone can open the board and check in five seconds, so the claim moved to the
one that survived the launch: the first token took the same terms as the next
one, because the factory cannot offer any other terms.

**Indonesian:**

> Token pertama di board ini punya gua. Dan dia nggak dapet apa-apa yang beda.
>
> Nggak ada presale, nggak ada jatah gua, nggak ada unlock. Semua supply masuk
> pool, likuiditasnya di locker, toll 4% — sama kayak token lu nanti.
>
> Factory-nya emang nggak punya tempat buat naro alokasi.

**English:**

> The first token on this board is mine. It got nothing yours won't.
>
> No presale, no share for me, no unlock. The whole supply went into the pool,
> the liquidity is in the locker, the toll is 4%.
>
> The factory has nowhere to put an allocation.

### Post 3 — why the rate cannot move

**Indonesian:**

> Rate-nya `constant` di dalam hook Uniswap v4, dan di v4 hook itu bagian dari
> identitas pool-nya.
>
> Jadi 4% nggak bisa jadi 10% besok. Ngubah angkanya berarti hook baru, pool
> baru, token baru — bukan tombol yang bisa dipencet. Termasuk sama gua.

**English:**

> The rate is a `constant` inside a Uniswap v4 hook, and in v4 the hook is part
> of the pool's identity.
>
> So 4% cannot become 10% tomorrow. Changing the number means a new hook, a new
> pool and a new token — not a setting anyone can flip. Me included.

### Post 4 — read the address, not the promises

**Indonesian:**

> 14 bit terakhir dari address hook-nya: `0x20cc`.
>
> Itu daftar izin yang dia punya, dan Uniswap v4 ngeceknya dari address-nya
> sendiri. Lu bisa tau kontrak itu boleh ngapain aja tanpa baca satu baris kode
> pun. Address-nya sendiri yang jadi buktinya.

**English:**

> The last 14 bits of the hook's address: `0x20cc`.
>
> That is the list of permissions it holds, and Uniswap v4 checks it off the
> address itself. You can tell what the contract is allowed to do without reading
> a line of its code. The address is the proof.

### Post 5 — the addresses

Post the card again here, or the three addresses as text so they are
copy-pasteable. The deployer address goes last, and on purpose: it deployed the
launchpad and holds no power over it — no owner, no admin, `launch` open to
everybody. That is a claim worth putting directly next to the address it is
about, where it can be checked, rather than somewhere it cannot.

### If you'd rather open on a different note

Two other first posts, same thread underneath. Pick one — don't post two.

**The one that leads with what is missing:**

> Nggak ada presale. Nggak ada alokasi. Nggak ada tim yang lagi nunggu unlock.
> Nggak ada tombol buat naikin fee. Nggak ada fungsi buat narik likuiditas.
>
> Yang ada: 4% tiap swap, 80%-nya ke yang nge-launch.
>
> Toollpad. Notice #0 udah naik.

**The one that leads with the cost, which is the honest thing to lead with:**

> Toollpad ngambil 4% dari tiap swap. Mahal, dan gua nggak bakal bilang enggak.
>
> Gantinya: 80%-nya ke yang nge-launch token itu, tiap swap, selamanya.
> Likuiditasnya di kontrak yang nggak punya fungsi buat ngeluarinnya.
>
> Angkanya nggak bisa diubah, jadi lu tau persis lagi milih apa.

## The CA post

The one post where being wrong costs somebody money. A contract address is 42
characters nobody reads, everybody copies, and a reply can counterfeit — which is
how most people lose money on a launch, not on the chart. So the post's job is
not to show the address. It is to hand over a way of checking it that does not
require trusting the post.

That way exists here and costs nothing to say: the board on toollpad.fun is read
from the factory on chain. An address that is not on it was not launched by this
launchpad, whoever posted it and however confident they sounded.

**Indonesian** (278 characters):

> $TOLL — notice #0 di Toollpad.
>
> CA: 0x3fb9cFA3Ec4D10308B40Bc82F8eBA42cA192E574
>
> Jangan percaya CA dari reply, punya gua termasuk. Buka toollpad.fun, board-nya
> baca langsung dari factory. Yang nggak muncul di situ, bukan ini.
>
> Deployer: 0xF914569f6207Bd87f8568b770eC7166788fD7B72

**English** (269 characters):

> $TOLL — notice #0 on Toollpad.
>
> CA: 0x3fb9cFA3Ec4D10308B40Bc82F8eBA42cA192E574
>
> Don't trust a CA from a reply, mine included. Open toollpad.fun — the board
> reads it off the factory. Anything not on there isn't this.
>
> Deployer: 0xF914569f6207Bd87f8568b770eC7166788fD7B72

> **Before posting either of these again:** they name `$TOLL` and the launchpad
> it launched on, and that launchpad is superseded — the treasury moved, so the
> board this repository describes is a new deployment that is not on chain yet.
> `$TOLL` and its pool stay where they are and nothing about them changes, but
> "open toollpad.fun, the board reads it off the factory" stops being true for
> `$TOLL` the moment the site points at the new factory. Post it as what it is —
> a token on the earlier board — or not at all.

*Image: `out/deployed-1600x900.png`, which carries the launchpad's three
addresses and the deployer. Post it here rather than earlier if this is the
first post on the account: one image, everything checkable.*

### Shorter, if the thread already explained the rest

**Indonesian** (227 characters):

> CA $TOLL:
> 0x3fb9cFA3Ec4D10308B40Bc82F8eBA42cA192E574
>
> Cara mastiin itu bener tanpa percaya postingan ini: buka toollpad.fun.
> Board-nya baca dari factory on chain. Notice #0.
>
> Deployer: 0xF914569f6207Bd87f8568b770eC7166788fD7B72

**English** (228 characters):

> $TOLL CA:
> 0x3fb9cFA3Ec4D10308B40Bc82F8eBA42cA192E574
>
> How to check that without trusting this post: open toollpad.fun. The board
> reads it off the factory on chain. Notice #0.
>
> Deployer: 0xF914569f6207Bd87f8568b770eC7166788fD7B72

### Pin this one

A CA post scrolls away within the hour and the impersonations do not. Pinning it
means the profile answers the question without anyone having to ask, and the
answer is the same one every time somebody checks.

### The reply to every fake CA

Do not argue with it. Post the check, once, and let it be the standing answer:

**Indonesian:**

> Board-nya di toollpad.fun, dibaca langsung dari factory on chain. Kalau sebuah
> CA nggak ada di situ, dia bukan dari Toollpad — siapa pun yang posting.

**English:**

> The board at toollpad.fun reads its addresses off the factory on chain. A CA
> that is not on it was not launched here, whoever posted it.

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

> Locked liquidity means locked. Everything paid for the supply becomes
> liquidity and does not come back out — not for the creator, not for us, not by
> vote.
>
> The toll comes out. The liquidity does not. Two different promises, and you
> should know which is which.

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
