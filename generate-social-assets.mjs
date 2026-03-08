import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/laura.rodriguez/AppData/Roaming/npm/node_modules/puppeteer');
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './brand_assets/social';

// Read the SVG logo (white background version for profile pics)
const logoSvg = fs.readFileSync('./brand_assets/logos/concept-1-el-sello-bg-white.svg', 'utf-8');

// Profile image sizes per platform
const profileSizes = [
  { name: 'profile-720', size: 720, label: 'Google Business (720x720)' },
  { name: 'profile-400', size: 400, label: 'X/Twitter (400x400)' },
  { name: 'profile-320', size: 320, label: 'Instagram (320x320)' },
  { name: 'profile-300', size: 300, label: 'LinkedIn (300x300)' },
  { name: 'profile-170', size: 170, label: 'Facebook (170x170)' },
];

// Banner/cover sizes per platform
const bannerSizes = [
  { name: 'cover-facebook', width: 820, height: 312, label: 'Facebook Cover' },
  { name: 'cover-twitter', width: 1500, height: 500, label: 'X/Twitter Header' },
  { name: 'cover-linkedin', width: 2100, height: 350, dpr: 2, label: 'LinkedIn Banner' },
];

function buildProfileHTML(size) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; background: #fff; }
  svg { width: ${Math.round(size * 0.85)}px; height: ${Math.round(size * 0.85)}px; }
</style></head><body>${logoSvg}</body></html>`;
}

function buildBannerHTML(width, height) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px; height: ${height}px;
    background: linear-gradient(135deg, #0F2341 0%, #1B3566 40%, #243F6B 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }
  /* Subtle grain texture */
  body::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
  }
  /* Gold corner accents */
  .corner { position: absolute; width: 30px; height: 30px; border-color: #C9A84C; opacity: 0.4; }
  .corner.tl { top: 12px; left: 12px; border-top: 2px solid; border-left: 2px solid; }
  .corner.tr { top: 12px; right: 12px; border-top: 2px solid; border-right: 2px solid; }
  .corner.bl { bottom: 12px; left: 12px; border-bottom: 2px solid; border-left: 2px solid; }
  .corner.br { bottom: 12px; right: 12px; border-bottom: 2px solid; border-right: 2px solid; }
  /* Gold line separators */
  .line-left, .line-right { position: absolute; top: 50%; width: ${Math.round(width * 0.15)}px; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C55, transparent); }
  .line-left { left: ${Math.round(width * 0.05)}px; }
  .line-right { right: ${Math.round(width * 0.05)}px; }
  .content {
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; text-align: center;
  }
  .text { color: white; }
  .text h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: ${Math.round(height * 0.22)}px;
    font-weight: 700; letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .text h1 span { color: #C9A84C; }
  .text p {
    font-size: ${Math.round(height * 0.09)}px;
    color: rgba(255,255,255,0.6);
    margin-top: ${Math.round(height * 0.04)}px;
    font-weight: 400; letter-spacing: 0.08em;
  }
  .url {
    position: absolute; bottom: ${Math.round(height * 0.08)}px; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.35); font-size: ${Math.round(height * 0.06)}px;
    letter-spacing: 0.05em; z-index: 1;
  }
</style></head><body>
  <div class="corner tl"></div><div class="corner tr"></div>
  <div class="corner bl"></div><div class="corner br"></div>
  <div class="line-left"></div><div class="line-right"></div>
  <div class="content">
    <div class="text">
      <h1>Carta de Invitación<br><span>México</span></h1>
      <p>DOCUMENTO PARA MIGRACIÓN</p>
    </div>
  </div>
  <div class="url">cartadeinvitacionmexico.com</div>
</body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // Generate profile images
  for (const { name, size, label } of profileSizes) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(buildProfileHTML(size), { waitUntil: 'load' });
    const outPath = path.join(OUTPUT_DIR, `${name}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    await page.close();
    console.log(`✓ ${label} → ${outPath}`);
  }

  // Generate banner/cover images
  for (const { name, width, height, dpr, label } of bannerSizes) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: dpr || 1 });
    await page.setContent(buildBannerHTML(width, height), { waitUntil: 'networkidle0', timeout: 10000 });
    const isLinkedIn = name.includes('linkedin');
    const ext = isLinkedIn ? 'jpg' : 'png';
    const outPath = path.join(OUTPUT_DIR, `${name}.${ext}`);
    await page.screenshot({ path: outPath, type: isLinkedIn ? 'jpeg' : 'png', ...(isLinkedIn && { quality: 95 }) });
    await page.close();
    console.log(`✓ ${label} → ${outPath}`);
  }

  await browser.close();
  console.log('\nAll social media assets generated in brand_assets/social/');
})();
