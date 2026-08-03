const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  /* Fixture setup is spent from this budget, and test.setTimeout() cannot help
     with it: that call lives in the test body, which a slow browser.newContext
     never reaches. Three different tests have died at exactly 30.0s on a loaded
     machine, one of them while declaring a 240s timeout it never got to apply.
     The slowest test here runs 30.1s of real work, so 30s left nothing for
     setup. This is headroom, not patience for a hang — a hang still never ends. */
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  /* One retry, and it is not there to make red go away. The failures that
     prompted it are all fixture setup stalling under memory pressure — the
     clearest was the theme bootstrap contract, which issues a single HTTP GET
     and touches no browser at all, taking 1.5 minutes. A real regression is
     deterministic and fails both attempts; only a stall survives a retry, and
     Playwright reports that as "flaky" rather than "passed". A flaky line in
     the output is a finding, not noise — read it. */
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: 'chrome',
    viewport: { width: 1920, height: 1080 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tests/server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
