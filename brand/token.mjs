// Renders the art for a token launched through Toollpad.
//
//   node token.mjs            # every token in ../tokens
//   node token.mjs lane-one   # just that one
//
// A token folder holds two files this reads: `token.json`, which is also what
// `npm run launch` sends, and `art.mjs`, which draws the mark. Everything else
// on the art — the rate, the split, the supply — is read out of the contracts,
// so a token's banner cannot claim a toll the hook does not charge.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

import { ethPerTokenFromSqrtPrice, launchRange, pricePerToken } from "../contracts/lib/ticks.mjs";
import { PALETTE } from "./lib/marks.mjs";
import { readRates } from "./lib/rates.mjs";
import { inlineFonts, shoot } from "./lib/sheets.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const tokensDir = join(root, "tokens");

const RATE = readRates();
const FONTS = await inlineFonts();

const CHAIN = "ROBINHOOD CHAIN 4663";
const VENUE = "UNISWAP V4";

/**
 * The words on the art, in the language the account is in.
 *
 * A token's account is in one language and stays in it — a banner in English
 * over a feed in Indonesian reads like a banner somebody else made. So the
 * language is a field on the token rather than a property of this file, and the
 * figures beside these words come from the contracts either way.
 */
const COPY = {
  en: {
    ticket: "LAUNCH TICKET",
    opening: "Opening tick",
    supply: "Supply",
    intoPool: "Into the pool",
    allOfIt: "All of it",
    toll: "Toll, both ways",
    tollValue: (rate) => `${rate.toll} · ${rate.creator} to the creator`,
    liquidity: "Liquidity",
    locked: "Locked, permanently",
    chips: (rate) => [`${rate.toll} TOLL`, `${rate.creator} TO THE CREATOR`, "LIQUIDITY LOCKED"],
    ogChips: (rate) => [`${rate.toll} TOLL, BOTH WAYS`, `${rate.supply} SUPPLY`, "POOL LOCKED"],
    footer: ["SUPPLY ALL IN THE POOL", "LAUNCHED ON TOOLLPAD"],
    ogFooter: (rate, opening) => [
      `OPENING TICK · ${opening} ETH`,
      `${rate.creator} OF THE TOLL TO THE CREATOR`,
      "LAUNCHED ON TOOLLPAD",
    ],
  },
  id: {
    ticket: "TIKET LAUNCH",
    opening: "Tick pembukaan",
    supply: "Supply",
    intoPool: "Masuk ke pool",
    allOfIt: "Semuanya",
    toll: "Toll, dua arah",
    tollValue: (rate) => `${rate.toll} · ${rate.creator} buat creator`,
    liquidity: "Likuiditas",
    locked: "Dikunci, permanen",
    chips: (rate) => [`TOLL ${rate.toll}`, `${rate.creator} BUAT CREATOR`, "LIKUIDITAS DIKUNCI"],
    ogChips: (rate) => [`TOLL ${rate.toll}, DUA ARAH`, `SUPPLY ${rate.supply}`, "POOL DIKUNCI"],
    footer: ["SUPPLY SEMUA DI POOL", "DILUNCURKAN LEWAT TOOLLPAD"],
    ogFooter: (rate, opening) => [
      `TICK PEMBUKAAN · ${opening} ETH`,
      `${rate.creator} DARI TOLL BUAT CREATOR`,
      "DILUNCURKAN LEWAT TOOLLPAD",
    ],
  },
};

const wordsFor = (token) => {
  const language = token.profile?.language ?? "en";
  const words = COPY[language];
  if (!words) throw new Error(`${token.slug ?? token.symbol}: no art copy written in "${language}"`);
  return words;
};

/**
 * Where the pool actually opens, run through the same tick math the launch runs.
 *
 * A launch asks for a valuation and gets the nearest tick on the grid, which is
 * never quite the number asked for — and rounds towards a dearer token, so the
 * sale never starts below the floor. The card prints what the pool will open at
 * rather than what was typed into `token.json`, because the first is a fact
 * about the transaction and the second is an intention.
 */
function openingValuation(token) {
  const whole = RATE.supplyWei / 10n ** 18n;
  const range = launchRange({
    floorEthPerToken: pricePerToken(token.launch.openingEth, whole),
    ceilEthPerToken: pricePerToken(token.launch.ceilingEth, whole),
    tickSpacing: token.launch.tickSpacing ?? 200,
  });

  const perToken = Number(ethPerTokenFromSqrtPrice(range.sqrtPriceX96)) / 1e18;
  const eth = (perToken * Number(whole)).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return { eth, tick: range.currentTick };
}

/**
 * Nothing that is not yet somebody's goes onto an image.
 *
 * The launchpad's own rule, applied to tokens: no handle and no domain on any
 * art. X shows both in its own chrome, an image repeating them is one more thing
 * that can go stale, and a handle printed before it is registered is an
 * invitation to whoever registers it next. This is checked rather than
 * remembered — see brand/X-PROFILE.md for the incident that made it a rule.
 */
function refuseIdentityOnArt(name, html, handle) {
  const art = html.split(FONTS).join(""); // the inlined fonts are not the picture
  const found = [handle, ...(art.match(/\b[a-z0-9-]+\.(?:fun|com|xyz|io|app|eth)\b/gi) ?? [])].filter(
    (needle) => needle && art.includes(needle),
  );
  if (found.length > 0) {
    throw new Error(`${name}: art must not print a handle or a domain — found ${[...new Set(found)].join(", ")}`);
  }
}

const BASE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "IBM Plex Mono", ui-monospace, monospace; color: ${PALETTE.paper}; }
  .asphalt {
    background-color: ${PALETTE.ground};
    background-image:
      repeating-linear-gradient(135deg, rgb(255 255 255 / .022) 0 2px, transparent 2px 9px),
      radial-gradient(rgb(255 255 255 / .05) .5px, transparent .5px);
    background-size: auto, 13px 13px;
  }
  .hazard { height: 14px; background-image: repeating-linear-gradient(135deg, ${PALETTE.signal} 0 14px, ${PALETTE.ink} 14px 28px); }
  .micro { font-size: 13px; letter-spacing: .18em; text-transform: uppercase; color: ${PALETTE.inkFaint}; }
  .chip {
    display: inline-flex; align-items: center; border: 2px solid ${PALETTE.signal};
    padding: 7px 13px; font-size: 12px; font-weight: 600; letter-spacing: .14em;
    text-transform: uppercase; color: ${PALETTE.signal};
  }
  .chip.solid { background: ${PALETTE.signal}; color: ${PALETTE.ink}; border-color: ${PALETTE.signal}; }
  .ticket { border: 3px solid ${PALETTE.signal}; background: ${PALETTE.groundDeep}; }
  .row { display: flex; justify-content: space-between; gap: 18px; padding: 10px 18px; border-bottom: 1px solid rgb(245 197 24 / .22); font-size: 15px; }
  .row:last-child { border-bottom: 0; }
  .row span { color: ${PALETTE.inkFaint}; }
  .row b { font-weight: 600; color: ${PALETTE.paper}; }
  .display { font-family: "Archivo Black", sans-serif; letter-spacing: -.01em; }
`;

/**
 * The launch, as a ticket.
 *
 * Every line is a fact about the transaction that opens the pool, and every one
 * of them is still true a year later: the opening tick is where the pool was
 * initialised, and the other four are constants in the contracts. Nothing here
 * is a price, a market cap or a holder count — those move, and an image cannot.
 */
const ticket = (token, width) => {
  const words = wordsFor(token);
  return `
  <div class="ticket" style="width:${width}px">
    <div style="display:flex;justify-content:space-between;background:${PALETTE.signal};color:${PALETTE.ink};padding:9px 18px;font-size:12px;font-weight:600;letter-spacing:.18em">
      <span>${words.ticket}</span><span>${VENUE}</span>
    </div>
    <div class="row"><span>${words.opening}</span><b>${openingValuation(token).eth} ETH</b></div>
    <div class="row"><span>${words.supply}</span><b>${RATE.supply}</b></div>
    <div class="row"><span>${words.intoPool}</span><b>${words.allOfIt}</b></div>
    <div class="row"><span>${words.toll}</span><b>${words.tollValue(RATE)}</b></div>
    <div class="row"><span>${words.liquidity}</span><b>${words.locked}</b></div>
  </div>`;
};

const bannerSheet = (token, mark) => {
  const words = wordsFor(token);
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1500px; height: 500px; overflow: hidden; }
  .sheet { width: 1500px; height: 500px; display: flex; flex-direction: column; }
</style></head><body>
  <div class="sheet asphalt">
    <div class="hazard"></div>
    <div style="flex:1;display:flex;align-items:center;gap:48px;padding:0 60px">
      <div style="flex:0 0 auto">${mark(150)}</div>
      <div style="flex:1;min-width:0">
        <h1 class="display" style="font-size:66px;line-height:1;color:${PALETTE.paper}">${token.name}</h1>
        <div class="micro" style="margin-top:14px;color:${PALETTE.signal};font-weight:600">$${token.symbol} &middot; ${VENUE} &middot; ${CHAIN}</div>
        <div style="margin-top:14px;font-size:17px;line-height:1.55;color:${PALETTE.inkFaint};max-width:560px">${token.blurb}</div>
        <div style="margin-top:20px;display:flex;gap:10px">
          ${words.chips(RATE).map((chip, index) => `<span class="chip${index === 0 ? " solid" : ""}">${chip}</span>`).join("")}
        </div>
      </div>
      ${ticket(token, 420)}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:13px 60px;border-top:2px solid rgb(245 197 24 / .3);background:${PALETTE.groundDeep}">
      <span class="micro" style="color:${PALETTE.signal};font-weight:600">$${token.symbol}</span>
      ${words.footer.map((line) => `<span class="micro" style="color:${PALETTE.signal};font-weight:600">${line}</span>`).join("")}
    </div>
  </div>
</body></html>`;
};

const ogSheet = (token, mark) => {
  const words = wordsFor(token);
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1200px; height: 630px; overflow: hidden; background: ${PALETTE.ink}; }
  .frame { width: 1200px; height: 630px; padding: 42px; }
  .panel { width: 100%; height: 100%; border: 3px solid ${PALETTE.signal}; display: flex; flex-direction: column; }
</style></head><body>
  <div class="frame asphalt">
    <div class="panel">
      <div style="display:flex;justify-content:space-between;padding:11px 26px;background:${PALETTE.signal};color:${PALETTE.ink};font-size:12px;font-weight:600;letter-spacing:.18em">
        <span>${VENUE} &middot; ${CHAIN}</span>
        <span>$${token.symbol}</span>
      </div>
      <div style="flex:1;min-height:0;padding:34px 46px;display:flex;align-items:center;gap:44px">
        <div style="flex:0 0 auto">${mark(220)}</div>
        <div style="flex:1;min-width:0">
          <h1 class="display" style="font-size:62px;line-height:1.05;color:${PALETTE.paper}">${token.name}</h1>
          <p style="margin-top:16px;font-size:19px;line-height:1.55;color:${PALETTE.inkFaint}">
            ${token.blurb}
          </p>
          <div style="margin-top:22px;display:flex;flex-wrap:wrap;gap:10px">
            ${words.ogChips(RATE).map((chip, index) => `<span class="chip${index === 0 ? " solid" : ""}">${chip}</span>`).join("")}
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 46px;border-top:3px solid ${PALETTE.signal};background:${PALETTE.groundDeep}">
        ${words
          .ogFooter(RATE, openingValuation(token).eth)
          .map((line) => `<span class="micro" style="color:${PALETTE.signal};font-weight:600">${line}</span>`)
          .join("")}
      </div>
    </div>
  </div>
</body></html>`;
};

const slugs = process.argv.slice(2);
const folders = (slugs.length > 0 ? slugs : readdirSync(tokensDir)).filter((slug) =>
  existsSync(join(tokensDir, slug, "token.json")),
);
if (folders.length === 0) throw new Error(`no token to render in ${tokensDir}`);

for (const slug of folders) {
  const dir = join(tokensDir, slug);
  const token = JSON.parse(readFileSync(join(dir, "token.json"), "utf8"));
  const { markSvg } = await import(pathToFileURL(join(dir, "art.mjs")).href);

  const out = join(dir, "out");
  mkdirSync(out, { recursive: true });

  // The mark, at the size each sheet places it, inline rather than as a file:
  // an <img> pointing at a sibling file is one more thing that can be missing
  // from a screenshot without the screenshot failing.
  const mark = (size) => markSvg({ size });

  // Full-bleed, because X crops a profile picture to a circle. The lines of the
  // lane run off every edge, so the crop takes road rather than corners.
  writeFileSync(join(out, "mark.svg"), markSvg({ size: 512 }));
  await sharp(Buffer.from(markSvg({ size: 1000 }))).png().toFile(join(out, "avatar-1000.png"));

  const sheets = [
    { name: "banner-1500x500", html: bannerSheet(token, mark), size: { width: 1500, height: 500 }, faces: ["Archivo Black", "IBM Plex Mono"] },
    { name: "og-1200x630", html: ogSheet(token, mark), size: { width: 1200, height: 630 }, faces: ["Archivo Black", "IBM Plex Mono"] },
  ];
  for (const sheet of sheets) refuseIdentityOnArt(`${slug}/${sheet.name}`, sheet.html, token.profile?.handle);

  await shoot(sheets, out);

  // The site serves the picture the notice points at, so the file has to be
  // where `imageURI` says it is. Copied rather than symlinked: Vercel ships what
  // is in `public/`.
  const publicDir = join(root, "site", "public", "tokens", slug);
  mkdirSync(publicDir, { recursive: true });
  for (const file of ["avatar-1000.png", "banner-1500x500.png", "og-1200x630.png"]) {
    copyFileSync(join(out, file), join(publicDir, file));
  }

  console.log(`${slug}: art written to tokens/${slug}/out and site/public/tokens/${slug} — toll ${RATE.toll}, checked against the contracts`);
}
