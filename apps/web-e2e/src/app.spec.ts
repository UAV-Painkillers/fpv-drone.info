import { expect, test } from '@playwright/test';

test.describe('app shell', () => {
  test('home renders per locale with correct lang attribute', async ({ page }) => {
    await page.goto('/de/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('h1')).toContainText('Werkzeugkasten');

    await page.goto('/pl/');
    await expect(page.locator('h1')).toContainText('skrzynka');
  });

  test('language menu switches locale keeping the route', async ({ page }) => {
    await page.goto('/en/tools/');
    await page.getByRole('button', { name: 'Language' }).click();
    await page.getByRole('menuitem', { name: 'Deutsch' }).click();
    await expect(page).toHaveURL(/\/de\/tools/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('theme toggle flips dark class and persists', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: /toggle dark mode/i }).click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test('unknown page returns the 404 raccoon', async ({ page }) => {
    const response = await page.goto('/en/definitely-not-a-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('alert')).toContainText('404');
  });

  test('head carries canonical + hreflang alternates', async ({ page }) => {
    await page.goto('/en/tools/blackbox-analyzer/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://fpv-drone.info/en/tools/blackbox-analyzer',
    );
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(6);
  });
});

test.describe('tools', () => {
  test('dynamic idle calculator computes 5" props', async ({ page }) => {
    await page.goto('/en/tools/dynamic-idle-calculator/');
    const input = page.locator('#prop-size');
    await input.fill('5');
    await expect(page.locator('p.text-gradient')).toHaveText('30');
    await input.fill('3');
    await expect(page.locator('p.text-gradient')).toHaveText('50');
  });

  test('analyzer renders plots from mock data', async ({ page }) => {
    await page.goto('/en/tools/blackbox-analyzer/?mock-data');
    await page.waitForSelector('canvas', { timeout: 30_000 });
    expect(await page.locator('canvas').count()).toBeGreaterThanOrEqual(5);
    // axis switch re-plots without errors
    await page.getByRole('button', { name: 'Yaw' }).click();
    await expect(page.locator('canvas').first()).toBeVisible();
  });
});

test.describe('guide wizard', () => {
  test('walks from landing through the first steps', async ({ page }) => {
    await page.goto('/en/guides/pid-tuning/');
    await expect(page.locator('h1')).toContainText('PID Tuning Guide');
    await page.getByRole('link', { name: /start the guide/i }).click();
    await expect(page).toHaveURL(/p-and-i-gains-setup-betaflight/);
    await expect(page.getByText('Step 1 of 13')).toBeVisible();
    await page.getByRole('link', { name: /next/i }).click();
    await expect(page.getByText('Step 2 of 13')).toBeVisible();
    await page.getByRole('link', { name: /previous/i }).click();
    await expect(page.getByText('Step 1 of 13')).toBeVisible();
  });

  test('localized wizard steps resolve', async ({ page }) => {
    await page.goto('/de/guides/pid-tuning/');
    await page.getByRole('link', { name: /guide starten/i }).click();
    await expect(page.getByText('Schritt 1 von 13')).toBeVisible();
  });
});
