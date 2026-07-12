/**
 * Visual smoke: screenshots key pages of the built static output.
 * Usage: serve apps/web/dist/client on :8901, then
 *   OUT=/tmp/shots node tools/scripts/screenshots.mjs
 */
import { chromium } from '@playwright/test';

const OUT = process.env.OUT ?? '/tmp/shots';
const base = process.env.BASE ?? 'http://localhost:8901';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
});

const shots = [
  { name: 'home-desktop-light', url: '/en/', width: 1280, height: 900 },
  { name: 'home-desktop-dark', url: '/en/', width: 1280, height: 900, dark: true },
  { name: 'home-mobile-light', url: '/en/', width: 390, height: 844 },
  { name: 'guides-mobile-dark', url: '/en/guides/', width: 390, height: 844, dark: true },
  { name: 'calc-desktop-light', url: '/en/tools/dynamic-idle-calculator/', width: 1280, height: 900 },
  { name: 'root-chooser', url: '/', width: 800, height: 700, noJs: true },
  { name: 'imprint', url: '/de/imprint/', width: 1280, height: 900, fullPage: true },
  { name: 'analyzer-page', url: '/en/tools/blackbox-analyzer/', width: 1280, height: 1200, fullPage: true },
];

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    colorScheme: s.dark ? 'dark' : 'light',
    javaScriptEnabled: !s.noJs,
  });
  const page = await ctx.newPage();
  await page.goto(base + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.fullPage ?? false });
  await ctx.close();
  console.log('shot', s.name);
}
await browser.close();
