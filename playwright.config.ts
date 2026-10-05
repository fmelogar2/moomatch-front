import { defineConfig, devices } from '@playwright/test';

/**
 * E2E flows exercised here are limited to what's safely automatable without a real Firebase
 * project/backend stack: the login screen's own rendering/validation/error-mapping, and the
 * auth-guard's redirect-to-login behavior. A signed-in flow (dashboard, herd management, etc.)
 * would need either a Firebase Auth emulator or seeded test credentials plus the full backend
 * stack running — see README.md #Testing for how to extend this once that's set up.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
