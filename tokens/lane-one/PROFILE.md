# Lane One — akunnya

Semua yang dibutuhkan buat nyetel `$LANE`, dalam kolom-kolom yang diminta X.
Jumlah karakternya dihitung, bukan dikira-kira; X menghitung code point Unicode,
dan em dash dihitung satu.

Launch-nya sendiri ada di [`token.json`](token.json) — file itu yang dikirim
`npm run launch`, dan file ini yang ada di sekelilingnya.

**Akun ini berbahasa Indonesia dan tetap begitu.** Bio Inggris di atas feed
Indonesia kebacanya seperti bio yang ditulis orang lain, jadi bahasanya satu:
`profile.language` di `token.json` adalah `id`, dan art-nya ikut bahasa itu.

## Namanya

**Lane One.** Token pertama yang diluncurkan lewat Toollpad, dan semuanya soal
jalan: launchpad-nya palang, ini lajur yang lewat di bawahnya.

Sengaja **tidak** dinamai seperti palangnya. Token bernama `$GATE` atau `$TOLL`,
memakai mark milik launchpad-nya sendiri, persis berbentuk seperti Toollpad
palsu — dan yang menanggung ruginya adalah pembaca yang tidak bisa membedakan.
Mark di sini lajur jalan: dua garis tepi penuh dan satu garis tengah putus-putus,
digambar di grid dua belas kali dua belas yang sama dengan palangnya, dan tidak
berbagi apa pun selain itu.

## Ticker

**`$LANE`**. Bukan `$TOLL`, itu ticker milik launchpad-nya sendiri, dan bukan
`$HOOD`, itu ticker Robinhood di NASDAQ — siapa pun yang baca sekilas akan
mengiranya aset resmi Robinhood.

## Display name — maks 50

**Pakai ini** (16 karakter):

```
Lane One | $LANE
```

Alternatif: `Lane One` (8) · `Lane One — toll 4%, 80% buat kamu` (33)

## Handle

**`@laneone` masih usulan, belum didaftarkan.** Tidak ada yang mengklaimnya dari
repo ini, jadi tidak ada satu pun gambar di sini yang mencetaknya — bukan banner,
bukan avatar, bukan link preview — dan renderer-nya menolak render kalau ketemu,
bukan sekadar mengandalkan ingatan.

Daftarkan dulu, baru isi `profile.handle` dan `link` di `token.json` lalu render
ulang. Kalau sudah diambil orang: `@lane_one`, lalu `@onelanetoken`. Yang
didaftarkan cuma satu, dan cuma yang itu yang ditulis di sini — handle dengan dua
ejaan yang beredar adalah handle yang bisa jadi milik orang lain.

## Bio — maks 160

**Pakai ini** (141 karakter):

```
Satu lajur, satu toll. 4% tiap swap di Uniswap v4, 80% buat yang nge-launch. Supply 1 miliar, semua masuk pool. Likuiditas dikunci selamanya.
```

### Sisanya

| Jumlah | Teks |
| --- | --- |
| 138 | `Token di Uniswap v4: toll 4% tiap swap, dua arah, 80% buat creator. Supply 1 miliar masuk pool semua dan likuiditasnya nggak bisa ditarik.` |
| 142 | `Nggak ada presale, nggak ada jatah tim. Supply 1 miliar langsung masuk pool dan dikunci. Tiap swap kena toll 4%, 80%-nya buat yang nge-launch.` |
| 121 | `Lajur pertama lewat palang. 4% tiap swap, 80% buat yang nge-launch, sisanya masuk pool yang nggak bisa dikuras siapa pun.` |
| 113 | `4% tiap swap. 80%-nya punya yang nge-launch. Sisanya masuk pool yang nggak bisa dikuras siapa pun, termasuk kami.` |

Kalau suatu saat akunnya pindah ke bahasa Inggris, ganti `profile.language` jadi
`en` dan render ulang — art-nya ikut. Bio Inggrisnya sudah siap (147 karakter):

| Jumlah | Teks |
| --- | --- |
| 147 | `One lane, one toll. 4% of every swap on Uniswap v4, 80% of it to whoever launched it. A billion supply, all in the pool. Liquidity locked for good.` |
| 140 | `The first lane through the gate. 4% of every swap, 80% of it to whoever launched it. A billion supply, all of it in a pool nobody can drain.` |
| 141 | `One fee, both directions: 4% of everything paid in. The whole billion went into the pool, the pool is locked, and the pool's own fee is zero.` |

### Yang sengaja tidak ada di semuanya

**Harga, market cap, atau jumlah holder.** Ketiganya bergerak, bio tidak. Tick
pembukaannya 1,7 ETH untuk seluruh supply — itu fakta tentang satu transaksi dan
benar selamanya — tapi ditulis di bio, bacanya jadi "segini nilainya sekarang",
padahal sudah tidak begitu sejak trade kedua.

Yang **ada** di semuanya adalah konstanta di kontrak: `TOLL_BPS` 400,
`CREATOR_BPS` 8000, `FIXED_SUPPLY` satu miliar — semuanya di `contracts/src/`,
tidak ada setter-nya. Ubah salah satunya dan file ini jadi salah, jadi ubah file
ini juga.

## Blurb di notice (112 karakter)

Satu kalimat yang ikut masuk on-chain di notice-nya, dan tidak bisa diedit
sesudahnya:

```
Lajur pertama lewat palang. Supply semua masuk pool, likuiditas dikunci, toll 4% — 80%-nya buat yang nge-launch.
```

## Website

Halamannya sendiri, begitu situsnya ter-deploy:

```
https://toollpad.fun/t/lane-one
```

Isinya dua bagian: launch-nya seperti yang ditulis di `token.json`, dan apa kata
chain — dibaca live, dan kosong selama belum diluncurkan. Setelah launch,
alamat kontraknya tercatat di `token.json` dan halaman itu membacanya dari sana,
bukan menebak dari ticker.

Bukan halaman explorer. Kelihatannya seperti website, padahal bukan, dan basi
begitu ada yang di-redeploy. Alamat kontraknya tempatnya di post — supaya bisa
dicek ke chain — dan di halaman itu, yang membacanya langsung dari chain.

## Gambar

| Kolom | File | Ukuran |
| --- | --- | --- |
| Foto profil | `out/avatar-1000.png` | 1000 × 1000 |
| Header | `out/banner-1500x500.png` | 1500 × 500 |
| Link preview | `out/og-1200x630.png` | 1200 × 630 |

Avatarnya full-bleed: garis-garis lajurnya keluar dari keempat sisi, jadi crop
bulat ala X memotong jalan, bukan memotong sudut gambar jalan.

Render ulang dengan `node token.mjs lane-one` di `../../brand`.

## Launch-nya, seperti yang akan dikirim

| | |
| --- | --- |
| Tick pembukaan | 201800 — 1,7234 ETH untuk seluruh supply |
| Range | 1,7 ETH di floor, 170 ETH di ceiling |
| Supply | 1.000.000.000 — semuanya masuk pool |
| Toll | 4% dari semua yang dibayarkan masuk, dua arah |
| Bagian | 80% creator, 20% treasury |
| Fee pool | Nol |
| Venue | Uniswap v4, ETH asli, Robinhood Chain 4663 |
| Likuiditas | Terkunci di locker, permanen |
| Ditahan | Tidak ada |

Tick pembukaan adalah ujung atas range: spot mulai di titik token paling murah,
jadi beli pertama langsung terisi dan pool tidak pernah minta ETH ke locker yang
memang tidak punya. Perlu kira-kira `sqrt(1,7 × 170)` ≈ 17 ETH pembelian untuk
menghabiskan seluruh supply.

**1,7234, bukan 1,7.** Tick itu grid selebar 200 dan 1,7 ETH tidak jatuh pas di
salah satunya, jadi launch-nya buka di tick terdekat — dan kedua ujung range
dibulatkan ke arah yang sama, ke arah token lebih mahal, supaya penjualan tidak
pernah mulai di bawah floor yang diminta. Art-nya mencetak 1,7234 karena itu yang
akan benar-benar terjadi di pool; 1,7 itu yang diminta, dan cuma satu dari
keduanya yang fakta tentang transaksinya. `TOKEN=lane-one npm run launch`
mencetak keduanya dulu, dan tidak mengirim apa pun tanpa `CONFIRM=launch`.

## Post

**Launch:**

> Lane One ($LANE) sudah ada di board Toollpad. Uniswap v4, pair ETH asli.
>
> Supply 1 miliar, semuanya masuk pool. Nggak ada presale, nggak ada jatah tim,
> nggak ada yang ditahan — nggak ada tempat buat nyimpennya.
>
> Tiap swap kena toll 4%, dua arah. 80%-nya buat yang nge-launch.
>
> Likuiditasnya dikunci. Bukan dijanjikan, bukan timelock: locker-nya memang
> nggak punya fungsi buat narik.
>
> Contract: 0x…

**Kenapa tarifnya nggak bisa diubah belakangan:**

> Tarifnya ada di hook Uniswap v4, dan hook itu bagian dari pool key.
>
> Artinya sudah terkunci sejak pool-nya dibuka. Bukan governance, bukan
> timelock, bukan "belum ada rencana naikin" — hook beda itu pool beda. Tarif di
> hari terakhir sama dengan tarif di hari pertama.

**Yang sebenarnya dipunya creator:**

> Habis launch, yang nge-launch pegang nol token. Itu bukan jebakan, itu memang
> intinya: supply-nya nggak pernah lewat tangan siapa-siapa, jadi nggak ada yang
> bisa di-dump.
>
> Yang dipunya itu 80% dari toll, selama masih ada yang trading.

*Gambar: `out/banner-1500x500.png` atau `out/og-1200x630.png`. Isi baris contract
dari receipt launch-nya dan cek dulu ke chain — `npm run status` di
`../../contracts` mencetak apa yang benar-benar ada di pool manager. Alamat
kontrak di dalam post adalah satu-satunya hal yang nggak bisa diverifikasi
pembaca cuma dengan membaca post-nya.*
