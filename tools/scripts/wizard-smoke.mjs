/**
 * Guide wizard smoke: landing → step 1 → next → next … and screenshots.
 */
import { chromium } from '@playwright/test';

const OUT = process.env.OUT ?? '/tmp/shots';
const base = process.env.BASE ?? 'http://localhost:8901';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 } });
const page = await ctx.newPage();
page.on('pageerror', (err) => console.log('[pageerror]', String(err).slice(0, 200)));

await page.goto(`${base}/en/guides/pid-tuning/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/wizard-landing.png`, fullPage: true });

await page.getByRole('link', { name: /start the guide/i }).click();
await page.waitForURL('**/p-and-i-gains-setup-betaflight');
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/wizard-step1.png`, fullPage: true });
console.log('step 1:', page.url());

for (let i = 2; i <= 4; i++) {
  await page.getByRole('link', { name: /next/i }).click();
  await page.waitForTimeout(700);
  console.log(`step ${i}:`, page.url());
}
await page.screenshot({ path: `${OUT}/wizard-step4.png`, fullPage: true });

// step 4 embeds the analyzer download gate
const gate = await page.getByRole('button', { name: /download 90 MB/i }).count();
console.log('analyzer gate on step 4:', gate > 0 ? 'present' : 'MISSING');

// localized wizard spot check
await page.goto(`${base}/pl/guides/filter-tuning/`, { waitUntil: 'networkidle' });
const plTitle = await page.locator('h1').first().textContent();
console.log('pl filter guide title:', plTitle);

await browser.close();
console.log('wizard smoke OK');
