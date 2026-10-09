/**
 * Regenerate the static brand rasters in `public/` from the SVG sources.
 *
 *   node scripts/generate-og-image.mjs
 *
 * Produces:
 *   public/og-image.png        1200 × 630 social preview
 *   public/apple-touch-icon.png  180 × 180
 *   public/icon-192.png / icon-512.png   PWA manifest icons
 *   public/favicon.ico         32 × 32 (PNG-encoded ICO)
 *
 * The outputs are committed, so this only needs running when the brand assets
 * or the social-preview layout change.
 *
 * Playwright is used purely as a renderer and is deliberately NOT a dependency
 * of this project — installing it just to redraw four static files would be a
 * poor trade. Install it on demand:
 *
 *   npm i -D playwright && npx playwright install chromium
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const publicDir = path.join(root, 'public');

mkdirSync(publicDir, { recursive: true });

const iconSvg = readFileSync(path.join(publicDir, 'icon.svg'), 'utf8');

/** The mark on a white plate — what iOS and Android expect for an app icon. */
function iconPage(size) {
  return `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;width:${size}px;height:${size}px;background:#fff}
  .wrap{width:${size}px;height:${size}px;display:grid;place-items:center}
  svg{width:${Math.round(size * 0.78)}px;height:${Math.round(size * 0.78)}px}
</style>
<div class="wrap">${iconSvg}</div>`;
}

const browser = await chromium.launch();

try {
  // --- Social preview -------------------------------------------------------
  const ogPage = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await ogPage.goto(`file://${path.join(here, 'og-template.html').replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle',
  });
  await ogPage.evaluate(() => document.fonts.ready);
  await ogPage.screenshot({ path: path.join(publicDir, 'og-image.png') });
  console.log('wrote public/og-image.png');
  await ogPage.close();

  // --- Icons ---------------------------------------------------------------
  const sizes = [
    { size: 180, file: 'apple-touch-icon.png' },
    { size: 192, file: 'icon-192.png' },
    { size: 512, file: 'icon-512.png' },
    { size: 32, file: 'favicon-32.png' },
  ];

  for (const { size, file } of sizes) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(iconPage(size), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(publicDir, file) });
    await page.close();
    console.log(`wrote public/${file}`);
  }

  // --- favicon.ico ----------------------------------------------------------
  // The ICO container accepts a PNG payload directly, so a 32×32 PNG can be
  // wrapped in a 22-byte header rather than pulling in an encoder.
  const png = readFileSync(path.join(publicDir, 'favicon-32.png'));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, entry, png]));
  console.log('wrote public/favicon.ico');
} finally {
  await browser.close();
}
