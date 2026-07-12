/**
 * Analyzer smoke test against the built static output on :8901.
 * 1. ?mock-data → all ECharts canvases render from canned results
 * 2. real init → Pyodide boots from /pid-analyzer-dependencies (IDLE state)
 */
import { chromium } from '@playwright/test';

const OUT = process.env.OUT ?? '/tmp/shots';
const base = process.env.BASE ?? 'http://localhost:8901';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const page = await ctx.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[console.error]', msg.text().slice(0, 300));
});
page.on('response', (res) => {
  if (res.status() >= 400) console.log('[http', res.status() + ']', res.url());
});
page.on('pageerror', (err) => console.log('[pageerror]', String(err).slice(0, 300)));

// --- 1. mock data plots ---
await page.goto(`${base}/en/tools/blackbox-analyzer/?mock-data`, {
  waitUntil: 'networkidle',
});
await page.waitForSelector('canvas', { timeout: 30_000 });
await page.waitForTimeout(1500);
const canvasCount = await page.locator('canvas').count();
console.log('mock-data canvases:', canvasCount);
await page.screenshot({ path: `${OUT}/analyzer-mock.png`, fullPage: true });
if (canvasCount < 5) {
  console.error('FAIL: expected >= 5 chart canvases');
  process.exitCode = 1;
}

// axis switch exercises re-plot
const yaw = page.getByRole('button', { name: 'Yaw' });
if (await yaw.count()) {
  await yaw.first().click();
  await page.waitForTimeout(800);
  console.log('axis switch ok');
}

// --- 2. real Pyodide init ---
await page.goto(`${base}/en/tools/blackbox-analyzer/`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /download 90 MB/i }).click();
console.log('init started (downloading pyodide runtime)…');
await page.waitForSelector('input[type=file]', {
  state: 'attached',
  timeout: 180_000,
});
console.log('pyodide initialized: dropzone visible');
await page.screenshot({ path: `${OUT}/analyzer-idle.png` });

await browser.close();
console.log('analyzer smoke OK');
