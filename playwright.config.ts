import { defineConfig, devices } from "@playwright/test";
import { getEnvironmentConfig } from "./src/config/environments";

const isCI = !!process.env.CI;
const envConfig = getEnvironmentConfig();
const isProd = envConfig.name.endsWith("-prod");

// Desktop Chrome without deviceScaleFactor — required when viewport is null (maximized mode)
const { deviceScaleFactor: _dpi, ...desktopChrome } = devices["Desktop Chrome"];

export default defineConfig({
  // ── Test discovery ───────────────────────────────────────────────
  testDir: "./src/tests",
  testMatch: "**/*.spec.ts",

  // ── Parallelism ──────────────────────────────────────────────────
  fullyParallel: true,
  workers: isCI ? 4 : 2,

  // ── Retries ──────────────────────────────────────────────────────
  retries: isCI ? 2 : 0,

  // ── Timeouts ─────────────────────────────────────────────────────
  timeout: 60_000, // per-test timeout
  expect: { timeout: 10_000 }, // assertion timeout

  // ── Reporting ────────────────────────────────────────────────────
  reporter: [
    ["list", { printSteps: true }],
    ["html", { outputFolder: "artifacts/reports/html", open: "never" }],
    ["json", { outputFile: "artifacts/reports/results.json" }],
    ["junit", { outputFile: "artifacts/reports/junit.xml" }],
    ["./src/reporters/custom-reporter.ts"],
    [
      "allure-playwright",
      {
        resultsDir: "artifacts/reports/allure-results",
        detail: true, // capture fixture/hook steps
        suiteTitle: false, // drop Playwright's own suite title prefix from test names
        links: {
          issue: { urlTemplate: "https://github.com/penny-co/penny/pull/%s" },
          tms: { urlTemplate: "https://testrail.example.com/cases/%s" },
        },
      },
    ],
  ],

  // ── Global settings ──────────────────────────────────────────────
  outputDir: "artifacts/test-results",

  // ── Global setup / teardown ──────────────────────────────────────
  globalSetup: "./src/config/global-setup.ts",
  globalTeardown: "./src/config/global-teardown.ts",

  use: {
    // Screenshot on failure, video on first retry, trace on first retry
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",

    // Reasonable action/navigation timeouts
    actionTimeout: 15_000,
    navigationTimeout: 45_000,

    // Ignore HTTPS errors in non-prod environments
    ignoreHTTPSErrors: !isProd,

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Locale and timezone — set for consistency across CI/local
    locale: "en-US",
    timezoneId: "America/New_York",

    // Base URL from environment config
    baseURL: envConfig.webUrl,
  },

  // ── Projects ─────────────────────────────────────────────────────
  projects: [
    // ── Web auth setup — browser UI login → .auth/user-web.json ──
    // Used by: vendor-invite.spec.ts
    {
      name: "auth-setup-web",
      testDir: "./src/config",
      testMatch: "auth.setup.web.ts",
      use: {
        ...desktopChrome,
        viewport: null,
        launchOptions: { args: ["--start-maximized"] },
      },
    },

    // ── API auth setup — headless REST login → .auth/user-api.json ──
    // Pure API call, no browser opened — builds storage-state JSON directly.
    // Used by: ewcf/web/vendors/registration.spec.ts
    {
      name: "auth-setup-api",
      testDir: "./src/config",
      testMatch: "auth.setup.api.ts",
    },

    // ── API Testing (no browser needed) ──
    {
      name: "api-testing",
      testMatch: "**/api/**/*.spec.ts",
      use: {
        baseURL: envConfig.apiUrl,
      },
    },

    // ── Web tests — tags decide smoke/regression scope ──
    {
      name: "smoke",
      testMatch: "**/web/**/*.spec.ts",
      dependencies: ["auth-setup-web", "auth-setup-api"],
      use: {
        ...desktopChrome,
        viewport: null,
        launchOptions: { args: ["--start-maximized"] },
      },
    },
  ],
});
