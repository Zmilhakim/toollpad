import type { TokenLanguage } from "@/lib/language";

/**
 * The page's words, in the language the token's account is in.
 *
 * A token whose feed is in Indonesian gets a page in Indonesian; the chrome
 * around it is the launchpad's and stays as it is. The language is a field on
 * the token rather than a setting here, so a second token can be in the other
 * one without touching this file — only adding to it.
 */
export type TokenCopy = {
  writtenDown: string;
  onChain: string;
  theAccount: string;
  ticket: string;
  opening: string;
  openingHint: (asked: string) => string;
  range: string;
  supply: string;
  intoPool: string;
  allOfIt: string;
  toll: string;
  bothWays: string;
  split: string;
  splitValue: (creator: string, treasury: string) => string;
  poolFee: string;
  zero: string;
  venue: string;
  liquidity: string;
  locked: string;
  heldBack: string;
  nothing: string;
  displayName: string;
  handle: string;
  handleUnregistered: string;
  bio: string;
  notLaunched: string;
  notLaunchedBody: string;
  boardClosed: string;
  reading: string;
  mismatch: string;
  price: string;
  inThePool: string;
  unsold: string;
  bought: string;
  contract: string;
  notice: string;
  none: string;
  readMore: string;
};

const COPY: Record<TokenLanguage, TokenCopy> = {
  id: {
    writtenDown: "Ditulis di repo",
    onChain: "Di chain",
    theAccount: "Akunnya",
    ticket: "Tiket launch",
    opening: "Tick pembukaan",
    openingHint: (asked) => `diminta ${asked} ETH — tick terdekat di grid, dibulatkan ke arah token lebih mahal`,
    range: "Range",
    supply: "Supply",
    intoPool: "Masuk ke pool",
    allOfIt: "Semuanya",
    toll: "Toll",
    bothWays: "dua arah, dari semua yang dibayarkan masuk",
    split: "Bagian",
    splitValue: (creator, treasury) => `${creator} creator, ${treasury} treasury`,
    poolFee: "Fee pool",
    zero: "Nol",
    venue: "Venue",
    liquidity: "Likuiditas",
    locked: "Terkunci di locker, permanen",
    heldBack: "Ditahan",
    nothing: "Tidak ada",
    displayName: "Nama tampilan",
    handle: "Handle",
    handleUnregistered: "belum didaftarkan, jadi belum dicetak di gambar mana pun",
    bio: "Bio",
    notLaunched: "Belum diluncurkan",
    notLaunchedBody:
      "Semua di atas adalah launch yang sudah ditulis, bukan sesuatu yang sudah ada di chain. Begitu transaksinya confirm, alamat kontraknya tercatat di file token ini dan angka-angka di sini dibaca langsung dari pool manager.",
    boardClosed: "Toollpad belum ada di Robinhood Chain, jadi belum ada yang bisa dibaca.",
    reading: "Membaca dari chain…",
    mismatch:
      "Notice yang tercatat tidak cocok dengan alamat token yang tercatat. Tidak ada angka yang ditampilkan sampai keduanya sepakat.",
    price: "Harga",
    inThePool: "Di dalam pool",
    unsold: "Belum terbeli",
    bought: "supply sudah terbeli",
    contract: "Kontrak",
    notice: "Notice",
    none: "—",
    readMore: "Cara kerjanya",
  },
  en: {
    writtenDown: "Written down",
    onChain: "On chain",
    theAccount: "The account",
    ticket: "Launch ticket",
    opening: "Opening tick",
    openingHint: (asked) => `${asked} ETH was asked for — the nearest tick on the grid, rounded towards a dearer token`,
    range: "Range",
    supply: "Supply",
    intoPool: "Into the pool",
    allOfIt: "All of it",
    toll: "Toll",
    bothWays: "both ways, on everything paid in",
    split: "Split",
    splitValue: (creator, treasury) => `${creator} creator, ${treasury} treasury`,
    poolFee: "Pool fee",
    zero: "Zero",
    venue: "Venue",
    liquidity: "Liquidity",
    locked: "Locked in the locker, permanently",
    heldBack: "Held back",
    nothing: "None of it",
    displayName: "Display name",
    handle: "Handle",
    handleUnregistered: "not registered yet, so it is on no image here",
    bio: "Bio",
    notLaunched: "Not launched yet",
    notLaunchedBody:
      "Everything above is a launch that has been written down, not something that is on chain. Once the transaction confirms, the contract address is recorded in this token's file and the figures here are read straight from the pool manager.",
    boardClosed: "Toollpad has no contracts on Robinhood Chain yet, so there is nothing to read.",
    reading: "Reading from the chain…",
    mismatch: "The recorded notice does not match the recorded token address. Nothing is shown until the two agree.",
    price: "Price",
    inThePool: "In the pool",
    unsold: "Unsold",
    bought: "of the supply bought",
    contract: "Contract",
    notice: "Notice",
    none: "—",
    readMore: "How it works",
  },
};

export const copyFor = (language: TokenLanguage) => COPY[language];
