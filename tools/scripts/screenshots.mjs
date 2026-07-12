import { chromium } from '@playwright/test';

const OUT = process.env.OUT ?? '/tmp/shots';
const base = 'http://localhost:8901';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
});

const shots = [
  { name: 'home-desktop-light', url: '/en/', width: 1280, height: 900, dark: false },
  { name: 'home-desktop-dark', url: '/en/', width: 1280, height: 900, dark: true },
  { name: 'home-mobile-light', url: '/en/', width: 390, height: 844, dark: false },
  { name: 'guides-mobile-dark', url: '/en/guides/', width: 390, height: 844, dark: true },
  { name: 'calc-desktop-light', url: '/en/tools/dynamic-idle-calculator/', width: 1280, height: 900, dark: false },
  { name: 'root-chooser', url: '/?noredirect', width: 800, height: 700, dark: false },
];

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    colorScheme: s.dark ? 'dark' : 'light',
    javaScriptEnabled: !s.url.includes('noredirect'),
  });
  const page = await ctx.newPage();
  await page.goto(base + s.url.replace('?noredirect', ''), { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  await ctx.close();
  console.log('shot', s.name);
}
await browser.close();
