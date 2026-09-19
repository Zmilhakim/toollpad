// Turning HTML into an image, reliably, twice over: the launchpad's cards and
// every token's. Both are typography rather than geometry, so both are laid out
// in a browser and screenshotted, and both fail loudly rather than quietly
// shipping a picture with the wrong face in it.
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const brand = dirname(dirname(fileURLToPath(import.meta.url)));
const fontCache = join(brand, ".fonts");

const CSS_URL = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600&display=swap";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/**
 * Fetches the webfonts in Node and inlines them as data URIs.
 *
 * The headless browser does not inherit this environment's HTTP proxy, so a
 * <link> to Google Fonts silently fetches nothing and every render lands in a
 * fallback face. Node does have the proxy, so it does the fetching; the browser
 * then needs no network at all, which also makes a re-render reproducible.
 */
export async function inlineFonts() {
  mkdirSync(fontCache, { recursive: true });

  const cssPath = join(fontCache, "faces.css");
  let css;
  if (existsSync(cssPath)) {
    css = readFileSync(cssPath, "utf8");
  } else {
    const response = await fetch(CSS_URL, { headers: { "User-Agent": UA } });
    if (!response.ok) throw new Error(`could not fetch font css: ${response.status}`);
    css = await response.text();
    writeFileSync(cssPath, css);
  }

  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
  const inlined = await Promise.all(
    urls.map(async (url) => {
      const file = join(fontCache, url.split("/").pop());
      let bytes;
      if (existsSync(file)) {
        bytes = readFileSync(file);
      } else {
        const response = await fetch(url, { headers: { "User-Agent": UA } });
        if (!response.ok) throw new Error(`could not fetch ${url}: ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
        writeFileSync(file, bytes);
      }
      const type = url.endsWith(".woff2") ? "font/woff2" : "font/ttf";
      return [url, `data:${type};base64,${bytes.toString("base64")}`];
    }),
  );

  let embedded = css;
  for (const [url, dataUri] of inlined) embedded = embedded.split(url).join(dataUri);
  return `<style>${embedded}</style>`;
}

/**
 * Screenshots each sheet into `outDir`, one PNG per entry.
 *
 * Two checks stand between a render and a picture nobody looks at twice: that
 * every face the sheet asks for actually applied, and that nothing spills out of
 * the canvas. Both throw, because an image is the one artefact whose mistakes
 * are invisible in a diff.
 *
 * @param sheets `{ name, html, size: { width, height }, faces }`.
 */
export async function shoot(sheets, outDir) {
  // Playwright insists on the exact Chromium build its version pins, and an
  // environment that ships a different one has a working browser sitting right
  // there. Use it rather than downloading a second copy, but only when the
  // pinned build is genuinely absent.
  const pinned = chromium.executablePath();
  const fallback = process.env.PLAYWRIGHT_BROWSERS_PATH ? join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : null;
  const executablePath = existsSync(pinned) || !fallback || !existsSync(fallback) ? undefined : fallback;

  if (executablePath) console.log(`using the environment's chromium at ${executablePath}`);

  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const tmp = join(outDir, ".render");
  mkdirSync(tmp, { recursive: true });

  for (const { name, html, size, faces } of sheets) {
    // Written to disk and opened over file:// — setContent leaves the base URL
    // at about:blank, where a relative or remote font is never fetched at all.
    const page = join(tmp, `${name}.html`);
    writeFileSync(page, html);

    const tab = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    await tab.goto(pathToFileURL(page).href, { waitUntil: "networkidle" });

    // document.fonts.check() answers true for a family the page never loaded, so
    // it proves nothing. Ask for each face by name first — a face nothing on the
    // page uses is never fetched otherwise — then measure: if it is missing, the
    // text lands on the fallback and matches it exactly.
    const missing = await tab.evaluate(async (families) => {
      await Promise.all(families.map((family) => document.fonts.load(`400 64px '${family}'`)));
      await document.fonts.ready;

      const measure = (stack) => {
        const el = document.createElement("span");
        el.textContent = "Every swap pays a toll";
        el.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:64px;font-family:${stack}`;
        document.body.appendChild(el);
        const width = el.getBoundingClientRect().width;
        el.remove();
        return width;
      };

      const fallbackWidth = measure("serif");
      return families.filter((family) => measure(`'${family}',serif`) === fallbackWidth);
    }, faces);

    if (missing.length > 0) throw new Error(`${name}: webfont did not apply — ${missing.join(", ")} fell back`);

    const overflow = await tab.evaluate(() => ({
      x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      y: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    }));
    if (overflow.x > 0 || overflow.y > 0) {
      throw new Error(`${name}: content overflows the canvas by ${overflow.x}x${overflow.y}px`);
    }

    await tab.screenshot({ path: join(outDir, `${name}.png`) });
    await tab.close();
  }

  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
