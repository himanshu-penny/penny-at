/**
 * auth.setup.web.ts — Browser-based UI login.
 *
 * Navigates to the Penny login page, fills credentials, submits, then saves
 * the resulting session (cookies + localStorage) to .auth/user-web.json.
 *
 * Used by: vendor-invite.spec.ts (admin-side tests that need a real browser session)
 *
 * Runs automatically as the "auth-setup-web" project dependency before the smoke project.
 * Manual run:
 *   TEST_ENV=test npx playwright test src/config/auth.setup.web.ts --project=auth-setup-web --headed
 */

import { test as setup, expect } from "@playwright/test";
import { PennyLoginPage } from "../pages/web/penny-login.page";
import { getEnvironmentConfig } from "./environments";
import { PENNY_ROUTE_PATTERNS } from "../core/constants";
import { WEB_STORAGE_STATE } from "./auth-paths";
import path from "path";
import fs from "fs";

export { WEB_STORAGE_STATE } from "./auth-paths";

setup("web-login: authenticate via browser UI", async ({ page }) => {
  const envConfig = getEnvironmentConfig();
  const { email, password } = envConfig.credentials.user;

  fs.mkdirSync(path.dirname(WEB_STORAGE_STATE), { recursive: true });

  // ── Clear any stale browser state ────────────────────────────────
  await page.context().clearCookies();

  // ── Navigate to the explicit login page ──────────────────────────
  await page.goto(`${envConfig.webUrl}/en/auth/login`, {
    waitUntil: "networkidle",
    timeout: envConfig.timeouts.pageLoad,
  });

  // ── Clear localStorage tokens that can bypass the login form ─────
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {
      /* sandboxed */
    }
  });

  // ── Wait for login form or detect auto-redirect ───────────────────
  const loginPage = new PennyLoginPage(page);
  const emailVisible = await page
    .locator('[data-test-id="email-address-input"]')
    .isVisible({ timeout: 5_000 })
    .catch(() => false);

  if (emailVisible) {
    // ── Happy path: login form is shown — fill and submit ─────────
    await loginPage.login(email, password);
    await expect(page, "Should redirect away from /login after successful auth").not.toHaveURL(
      PENNY_ROUTE_PATTERNS.LOGIN,
      { timeout: envConfig.timeouts.pageLoad },
    );
    process.stdout.write(`✅ [web-login] Logged in as ${email}\n`);
  } else {
    // ── Test env auto-redirected (no login form shown) ────────────
    // The app already considers this session authenticated (IP/env-level auth).
    // Save the current state so tests can reuse it.
    process.stdout.write(
      `⚠️  [web-login] Login form not shown — environment auto-authenticated. Saving current session.\n`,
    );
  }

  // ── Persist cookies + localStorage ───────────────────────────────
  await page.context().storageState({ path: WEB_STORAGE_STATE });
  process.stdout.write(`✅ [web-login] Session saved → ${WEB_STORAGE_STATE}\n`);
});
