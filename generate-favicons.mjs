import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/laura.rodriguez/AppData/Roaming/npm/node_modules/puppeteer');
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('brand_assets/logos/concept-1-el-sello-bg-white.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');
const outDir = path.resolve('brand_assets/logos');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
];

// Base64-encode the SVG for use as an img src
const svgBase64 = Buffer.from(svgContent).toString('base64');
const svgDataUri = 'data:image/svg+xml;base64,' + svgBase64;

const browser = await puppeteer.launch();

for (const { name, size } of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });

  const html = '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{width:' + size + 'px;height:' + size + 'px;overflow:hidden;display:flex;align-items:center;justify-content:center;}img{width:' + size + 'px;height:' + size + 'px;}</style></head><body><img src="' + svgDataUri + '"/></body></html>';

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, name), type: 'png', clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log('Generated ' + name + ' (' + size + 'x' + size + ')');
}

await browser.close();
console.log('Done!');
