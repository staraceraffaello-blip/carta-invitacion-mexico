import { createRequire } from 'module';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Use globally installed puppeteer
const puppeteerPath = 'C:/Users/laura.rodriguez/AppData/Roaming/npm/node_modules/puppeteer';
const puppeteer = require(puppeteerPath);

const args = process.argv.slice(2);
const url    = args[0] || 'http://localhost:3000';
const flag   = args[1] || '';
const label  = args[2] || '';

const isMobile = flag === 'mobile';
const extraLabel = isMobile ? (label ? `-${label}` : '-mobile') : (label ? `-${label}` : '');

// Ensure output dir exists
const outDir = join(__dirname, 'temporary screenshots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Auto-increment filename
const existing = readdirSync(outDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean);
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = `screenshot-${next}${extraLabel}.png`;
const outPath  = join(outDir, filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: undefined, // use bundled chromium
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  if (isMobile) {
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  } else {
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  }

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800)); // let fonts/animations settle

  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();

  console.log(`Screenshot saved: temporary screenshots/${filename}`);
})();
