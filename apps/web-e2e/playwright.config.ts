import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;

// Local containers may provide a pre-installed Chromium.
const executablePath = process.env['CHROMIUM_EXECUTABLE'];

export default defineConfig({
  testDir: './src',
  outputDir: './test-output',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `node ../../tools/scripts/serve-static.mjs ${PORT} ../../apps/web/dist/client`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
});
