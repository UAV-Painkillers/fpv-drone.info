/**
 * PWA smoke: SW registers, precache fills, offline reload works, offline
 * download card appears on the analyzer page.
 */
import { chromium } from '@playwright/test';

const base = process.env.BASE ?? 'http://localhost:8901';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto(`${base}/en/`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  return reg.active?.state;
});
console.log('service worker: active');

// give precaching a moment, then verify cache contents
await page.waitForTimeout(4000);
const cacheInfo = await page.evaluate(async () => {
  const names = await caches.keys();
  const counts = {};
  for (const name of names) {
    counts[name] = (await (await caches.open(name)).keys()).length;
  }
  return counts;
});
console.log('caches:', JSON.stringify(cacheInfo));

// analyzer page shows the offline download card
await page.goto(`${base}/en/tools/blackbox-analyzer/`, { waitUntil: 'networkidle' });
await page.waitForSelector('text=Download for offline use', { timeout: 10_000 });
console.log('offline download card: present');

// offline navigation works from precache
await ctx.setOffline(true);
await page.goto(`${base}/en/guides/`, { waitUntil: 'load', timeout: 20_000 });
const heading = await page.locator('h1').first().textContent();
console.log('offline /en/guides h1:', heading);
await ctx.setOffline(false);

await browser.close();
if (!heading?.includes('Guides')) {
  console.error('FAIL: offline navigation broken');
  process.exit(1);
}
console.log('pwa smoke OK');
