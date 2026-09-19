// Renders the Toollpad brand kit.
//
//   node render.mjs
//
// Vector marks go straight through sharp; the banner and the cards are laid out
// in HTML and screenshotted, because they are typography, not geometry —
// `lib/sheets.mjs` does that part, for these and for a token's own art.
// Everything here is reproducible — edit the source, re-run, commit the output.
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { gateBodySvg, gateSvg, lockupSvg, wordmarkSvg, PALETTE } from "./lib/marks.mjs";
import { readRates } from "./lib/rates.mjs";
import { inlineFonts, shoot } from "./lib/sheets.mjs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "out");

// --- the things you would change -------------------------------------------
export const BRAND = {
  ticker: "$TOLL",
  chain: "ROBINHOOD CHAIN 4663",
  venue: "UNISWAP V4",
  promise: "4% TOLL · 80% TO THE CREATOR",
  tagline: "LAUNCH A TOKEN. CHARGE A TOLL.",
  line: "One hook, one fee, both directions. The supply is all in the pool and the pool is locked — what a launch earns is the toll.",
};

// No domain and no handle on any of this art. The profile shows both already,
// and an image that repeats them is one more thing that can go stale or turn out
// to belong to somebody else. Nothing gets printed as pixels until it is
// registered — see X-PROFILE.md.

const RATE = readRates();

/**
 * The addresses, read out of the deployment record rather than typed here.
 *
 * A card carrying a contract address is the one thing a reader can check and
 * nobody can alter by quoting it back differently — which only holds if the card
 * cannot print an address the project does not actually have. So these come from
 * the config the deploy script wrote, and a missing one stops the render.
 */
const CHAIN = JSON.parse(readFileSync(join(here, "..", "contracts", "toollpad.config.json"), "utf8"));
const DEPLOYED = CHAIN.deployed ?? {};

const isAddress = (value) => /^0x[0-9a-fA-F]{40}$/.test(value ?? "");
const IS_DEPLOYED =
  ["factory", "hook", "locker"].every((name) => isAddress(DEPLOYED[name])) &&
  isAddress(CHAIN.deployer) &&
  /^0x[0-9a-fA-F]{64}$/.test(DEPLOYED.deployTx ?? "");

// A partly-filled record is worse than an empty one: it is the shape a card
// would print with a blank where an address goes. All of it, or none of it.
if (!IS_DEPLOYED && Object.keys(DEPLOYED).length > 0) {
  throw new Error("toollpad.config.json has a half-filled deployed record — a card cannot print part of an address");
}

// ---------------------------------------------------------------------------

mkdirSync(out, { recursive: true });

const FONTS = await inlineFonts();

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

function tollTicket({ width }) {
  return `
  <div class="ticket" style="width:${width}px">
    <div style="display:flex;justify-content:space-between;background:${PALETTE.signal};color:${PALETTE.ink};padding:9px 18px;font-size:12px;font-weight:600;letter-spacing:.18em">
      <span>TOLL TICKET</span><span>${BRAND.venue}</span>
    </div>
    <div class="row"><span>Every swap</span><b>${RATE.toll}</b></div>
    <div class="row"><span>To the creator</span><b>${RATE.creator} of it</b></div>
    <div class="row"><span>Pool fee</span><b>None</b></div>
    <div class="row"><span>Supply</span><b>${RATE.supply}</b></div>
    <div class="row"><span>Liquidity</span><b>Locked, permanently</b></div>
  </div>`;
}

const banner = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1500px; height: 500px; overflow: hidden; }
  .sheet { width: 1500px; height: 500px; display: flex; flex-direction: column; }
</style></head><body>
  <div class="sheet asphalt">
    <div class="hazard"></div>
    <div style="flex:1;display:flex;align-items:center;gap:54px;padding:0 60px">
      <div style="flex:1">
        ${lockupSvg({ unit: 7, color: PALETTE.paper })}
        <div class="micro" style="margin-top:20px;color:${PALETTE.signal}">${BRAND.tagline}</div>
        <div style="margin-top:14px;font-size:17px;line-height:1.55;color:${PALETTE.inkFaint};max-width:580px">${BRAND.line}</div>
        <div style="margin-top:22px;display:flex;gap:10px">
          <span class="chip solid">${RATE.toll} TOLL</span>
          <span class="chip">${RATE.creator} TO THE CREATOR</span>
          <span class="chip">LIQUIDITY LOCKED</span>
        </div>
      </div>
      ${tollTicket({ width: 440 })}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:13px 60px;border-top:2px solid rgb(245 197 24 / .3);background:${PALETTE.groundDeep}">
      <span class="micro" style="color:${PALETTE.signal};font-weight:600">${BRAND.ticker}</span>
      <span class="micro" style="color:${PALETTE.signal};font-weight:600">${BRAND.venue}</span>
      <span class="micro" style="color:${PALETTE.signal};font-weight:600">${BRAND.chain}</span>
    </div>
  </div>
</body></html>`;

const og = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1200px; height: 630px; overflow: hidden; background: ${PALETTE.ink}; }
  .frame { width: 1200px; height: 630px; padding: 42px; }
  .panel { width: 100%; height: 100%; border: 3px solid ${PALETTE.signal}; display: flex; flex-direction: column; }
</style></head><body>
  <div class="frame asphalt">
    <div class="panel">
      <div style="display:flex;justify-content:space-between;padding:11px 26px;background:${PALETTE.signal};color:${PALETTE.ink};font-size:12px;font-weight:600;letter-spacing:.18em">
        <span>${BRAND.venue} · ${BRAND.chain}</span>
        <span>${BRAND.ticker}</span>
      </div>
      <div style="flex:1;min-height:0;padding:30px 46px;display:flex;flex-direction:column;justify-content:center">
        ${lockupSvg({ unit: 5, color: PALETTE.paper })}
        <h1 class="display" style="font-size:58px;line-height:1.08;margin-top:24px;max-width:15ch;color:${PALETTE.paper}">Every swap pays a toll</h1>
        <p style="margin-top:18px;font-size:19px;line-height:1.55;color:${PALETTE.inkFaint};max-width:60ch">
          ${RATE.toll} of everything paid into the pool, in either direction. ${RATE.creator} of it goes to whoever launched the token, and the rate is in the pool's key — so it is the same on the last day as on the first.
        </p>
        <div style="margin-top:24px;display:flex;gap:10px">
          <span class="chip solid">SUPPLY ALL IN</span>
          <span class="chip">POOL LOCKED</span>
          <span class="chip">NO TEAM BAG</span>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

const tollCard = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1600px; height: 900px; overflow: hidden; background: ${PALETTE.ink}; }
  .frame { width: 1600px; height: 900px; padding: 50px; }
  .panel { width: 100%; height: 100%; border: 4px solid ${PALETTE.signal}; display: flex; flex-direction: column; }
  .split { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding: 17px 0; border-bottom: 1px solid rgb(245 197 24 / .22); }
  .split:last-child { border-bottom: 0; }
  .split span { font-size: 20px; letter-spacing: .1em; text-transform: uppercase; color: ${PALETTE.inkFaint}; }
  .split b { font-size: 29px; font-weight: 600; color: ${PALETTE.paper}; }
</style></head><body>
  <div class="frame asphalt">
    <div class="panel">
      <div style="display:flex;justify-content:space-between;background:${PALETTE.signal};color:${PALETTE.ink};padding:15px 34px;font-size:17px;font-weight:600;letter-spacing:.18em">
        <span>THE WHOLE FEE SCHEDULE</span>
        <span>${BRAND.chain}</span>
      </div>

      <div style="flex:1;min-height:0;display:flex;align-items:center;gap:56px;padding:36px 48px">
        <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:22px">
          ${gateSvg({ size: 240 })}
          <div class="display" style="font-size:78px;line-height:1;color:${PALETTE.signal}">${RATE.toll}</div>
          <div class="micro" style="font-size:16px">OF EVERY SWAP</div>
        </div>
        <div style="flex:1;min-width:0">
          <div class="split"><span>To the creator</span><b>${RATE.creator} of the toll</b></div>
          <div class="split"><span>To the treasury</span><b>${RATE.treasury} of the toll</b></div>
          <div class="split"><span>To liquidity providers</span><b>Nothing — there is no pool fee</b></div>
          <div class="split"><span>To launch</span><b>Nothing but gas</b></div>
          <div class="split"><span>Held back at launch</span><b>None of the supply</b></div>
        </div>
      </div>

      <div style="padding:26px 48px;border-top:3px solid ${PALETTE.signal};background:${PALETTE.groundDeep}">
        <div style="font-size:21px;line-height:1.55;color:${PALETTE.paper};max-width:88ch">
          The rate lives in the hook, and the hook is part of the pool's key — it cannot be swapped, raised or switched off later. The liquidity is in a contract with no function that takes any out.
        </div>
        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
          <span class="micro" style="color:${PALETTE.signal};font-weight:600">${BRAND.ticker}</span>
          <span class="micro" style="color:${PALETTE.signal};font-weight:600">${BRAND.promise}</span>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

// Built only when there is a deployment to build it from — see below. As a
// function, because a template literal is filled the moment it is written, and
// one filled from an empty record would quietly hold the word "undefined" where
// each address goes.
const deployedCard = () => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body { width: 1600px; height: 900px; overflow: hidden; background: ${PALETTE.ink}; }
  .frame { width: 1600px; height: 900px; padding: 50px; }
  .panel { width: 100%; height: 100%; border: 4px solid ${PALETTE.signal}; display: flex; flex-direction: column; }
  .addr { padding: 16px 0; border-bottom: 1px solid rgb(245 197 24 / .2); }
  .addr:last-child { border-bottom: 0; }
  .addr .what { font-size: 17px; letter-spacing: .16em; text-transform: uppercase; color: ${PALETTE.inkFaint}; }
  .addr .hex { margin-top: 5px; font-size: 27px; font-weight: 600; color: ${PALETTE.paper}; letter-spacing: .005em; }
  .seal { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; color: ${PALETTE.signal}; }
</style></head><body>
  <div class="frame asphalt">
    <div class="panel">
      <div style="display:flex;justify-content:space-between;background:${PALETTE.signal};color:${PALETTE.ink};padding:15px 34px;font-size:17px;font-weight:600;letter-spacing:.18em">
        <span>ON CHAIN &mdash; SOURCE VERIFIED</span>
        <span>${BRAND.chain}</span>
      </div>

      <div style="flex:1;min-height:0;display:flex;align-items:center;gap:48px;padding:28px 46px">
        <div style="flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:16px">
          ${gateSvg({ size: 190 })}
          <div class="display" style="font-size:64px;line-height:1;color:${PALETTE.signal}">${RATE.toll}</div>
          <div class="micro" style="font-size:15px">EVERY SWAP</div>
          <div class="micro" style="font-size:15px;color:${PALETTE.signal}">${RATE.creator} YOURS</div>
        </div>

        <div style="flex:1;min-width:0">
          <div class="addr">
            <div class="what">Factory &mdash; the board</div>
            <div class="hex">${DEPLOYED.factory}</div>
          </div>
          <div class="addr">
            <div class="what">Hook &mdash; charges the toll, rate is a constant</div>
            <div class="hex">${DEPLOYED.hook}</div>
          </div>
          <div class="addr">
            <div class="what">Locker &mdash; holds the liquidity, has no way out</div>
            <div class="hex">${DEPLOYED.locker}</div>
          </div>
          <div class="addr">
            <div class="what">Deployment &mdash; one transaction, and the last word on it</div>
            <div class="hex" style="font-size:21px;color:${PALETTE.inkFaint}">${DEPLOYED.deployTx}</div>
          </div>
          <div style="margin-top:18px;font-size:19px;line-height:1.5;color:${PALETTE.inkFaint}">
            Read the locker yourself. Search it for <span style="color:${PALETTE.paper}">withdraw</span>,
            <span style="color:${PALETTE.paper}">collect</span>, or a negative liquidity delta &mdash; there is nothing to find.
          </div>
        </div>
      </div>

      <div style="padding:22px 46px;border-top:3px solid ${PALETTE.signal};background:${PALETTE.groundDeep}">
        <div class="micro" style="font-size:15px">DEPLOYED BY &mdash; NO OWNER, NO ADMIN, NO POWER OVER IT</div>
        <div style="margin-top:7px;font-size:27px;font-weight:600;color:${PALETTE.inkFaint}">${CHAIN.deployer}</div>
        <div style="margin-top:16px;padding-top:14px;border-top:2px solid rgb(245 197 24 / .2);display:flex;justify-content:space-between;align-items:center">
          <span class="micro" style="font-size:15px;color:${PALETTE.signal};font-weight:600">${BRAND.ticker} &middot; TOOLLPAD.FUN</span>
          <span class="micro" style="font-size:15px;color:${PALETTE.signal};font-weight:600">${BRAND.promise}</span>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

// --- vector marks -----------------------------------------------------------
writeFileSync(join(out, "logo-mark.svg"), gateSvg({ size: 512 }));
writeFileSync(join(out, "logo-wordmark.svg"), wordmarkSvg({ unit: 12 }));
writeFileSync(join(out, "logo-lockup.svg"), lockupSvg({ unit: 12 }));
writeFileSync(join(out, "logo-lockup-dark.svg"), lockupSvg({ unit: 12, color: PALETTE.paper }));

for (const size of [256, 512, 1024]) {
  await sharp(Buffer.from(gateSvg({ size }))).png().toFile(join(out, `logo-mark-${size}.png`));
}

// Avatar: full-bleed signal yellow, because X crops a profile picture to a
// circle and a centred mark on a paper square loses its corners to the crop.
// The padding is wider than the logo's: the crop is a circle, and the end of the
// arm is the part of this mark furthest from the middle.
const AVATAR_PAD = 3;
const avatarSpan = 12 + AVATAR_PAD * 2;
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${avatarSpan} ${avatarSpan}" width="1000" height="1000" shape-rendering="crispEdges">
  <rect width="${avatarSpan}" height="${avatarSpan}" fill="${PALETTE.signal}"/>
  ${gateBodySvg({ pad: AVATAR_PAD })}
</svg>`;
await sharp(Buffer.from(avatar)).png().toFile(join(out, "avatar-1000.png"));

// --- typography-heavy pieces ------------------------------------------------
const sheets = [
  { name: "banner-1500x500", html: banner, size: { width: 1500, height: 500 }, faces: ["IBM Plex Mono"] },
  { name: "og-1200x630", html: og, size: { width: 1200, height: 630 }, faces: ["Archivo Black", "IBM Plex Mono"] },
  { name: "toll-1600x900", html: tollCard, size: { width: 1600, height: 900 }, faces: ["Archivo Black", "IBM Plex Mono"] },
];

// The card that prints where Toollpad is only exists while Toollpad is
// somewhere. Between a change to the contracts and the redeploy that follows it
// there is no such place, so the card is not rendered and a stale one — with the
// old addresses and the old rate on it — is removed rather than left lying in
// `out/` looking current.
if (IS_DEPLOYED) {
  sheets.push({
    name: "deployed-1600x900",
    html: deployedCard(),
    size: { width: 1600, height: 900 },
    faces: ["Archivo Black", "IBM Plex Mono"],
  });
} else {
  rmSync(join(out, "deployed-1600x900.png"), { force: true });
  console.log("nothing is deployed in toollpad.config.json, so the card that prints the addresses is not rendered");
}

await shoot(sheets, out);

console.log(`brand kit written to out/ — toll ${RATE.toll}, creator ${RATE.creator}, checked against the contracts`);
