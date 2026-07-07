import { test, expect } from "@fixtures";
import { PennyLoginPage } from "@pages/web/penny-login.page";
import { PENNY_ROUTE_PATTERNS } from "@core/constants";

/**
 * TC_WEB_PENNY_LOGIN — Penny Login Smoke Tests
 *
 * PURPOSE:
 *   Verify the Penny login page renders correctly and all critical login
 *   flows work: valid credentials, invalid credentials, empty form,
 *   password masking/unmasking, SSO buttons, and forgot password link.
 *
 * ENDPOINTS UNDER TEST:
 *   GET  /login
 *   POST /api/auth/login (triggered via UI)
 *
 * HOW TO RUN:
 *   npx playwright test penny-login.spec.ts --project=smoke
 *   TEST_ENV=test npx playwright test penny-login.spec.ts --project=smoke
 *
 * TAGS: @smoke @ui @critical
 */
test.describe("TC_WEB_PENNY_LOGIN — Penny Login", { tag: ["@smoke", "@ui", "@critical"] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: PennyLoginPage;

  test.beforeEach(async ({ page, envConfig }) => {
    loginPage = new PennyLoginPage(page);
    await loginPage.navigateToLogin(envConfig.webUrl);
  });

  // ── TC_001: Page renders ───────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_001 — Login page renders all required elements
   * Verifies logo, email input, password input, login button, and
   * forgot password link are all visible before any interaction.
   */
  test("TC_WEB_PENNY_LOGIN_001 — login page renders all required elements", async () => {
    await loginPage.verifyPageIsLoaded();
  });

  // ── TC_002: SSO buttons ────────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_002 — SSO login buttons are visible
   * Verifies Google, Microsoft, and Foodics SSO buttons are rendered.
   */
  test("TC_WEB_PENNY_LOGIN_002 — SSO buttons (Google, Microsoft, Foodics) are visible", async () => {
    await loginPage.verifySsoButtonsVisible();
  });

  // ── TC_003: Happy path ─────────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_003 — Successful login redirects away from /login
   * Core happy-path: valid credentials should authenticate and redirect.
   */
  test("TC_WEB_PENNY_LOGIN_003 — successful login with valid credentials redirects away from login", async ({
    page,
    envConfig,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const { email, password } = envConfig.credentials.user;

    // ── Act ───────────────────────────────────────────────────────────
    await loginPage.login(email, password);

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page, "Should redirect away from /login after successful login").not.toHaveURL(
      PENNY_ROUTE_PATTERNS.LOGIN,
    );
  });

  // ── TC_004: Wrong password ─────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_004 — Login fails with incorrect password
   * Negative test: wrong password must not authenticate the user.
   */
  test("TC_WEB_PENNY_LOGIN_004 — login fails with incorrect password stays on login page", async ({
    page,
    envConfig,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const { email } = envConfig.credentials.user;

    // ── Act ───────────────────────────────────────────────────────────
    await loginPage.login(email, "wrong-password-XYZ!");

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page, "Should stay on /login after failed login attempt").toHaveURL(
      PENNY_ROUTE_PATTERNS.LOGIN,
    );
  });

  // ── TC_005: Unknown email ──────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_005 — Login fails with non-existent email
   * Negative test: unknown user must not be authenticated.
   */
  test("TC_WEB_PENNY_LOGIN_005 — login fails with unknown email stays on login page", async ({
    page,
    testData,
  }) => {
    // ── Arrange ──────────────────────────────────────────────────────
    const fakeUser = testData.user();

    // ── Act ───────────────────────────────────────────────────────────
    await loginPage.login(fakeUser.email, fakeUser.password);

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page, "Should stay on /login after login with unknown email").toHaveURL(
      PENNY_ROUTE_PATTERNS.LOGIN,
    );
  });

  // ── TC_006: Empty form ─────────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_006 — Submitting empty form does not navigate away
   * Negative test: clicking login with no credentials must not redirect.
   */
  test("TC_WEB_PENNY_LOGIN_006 — submitting empty form does not navigate away", async ({
    page,
  }) => {
    // ── Act ───────────────────────────────────────────────────────────
    await loginPage.clickLogin();

    // ── Assert ────────────────────────────────────────────────────────
    await expect(page, "Should remain on /login after empty form submit").toHaveURL(
      PENNY_ROUTE_PATTERNS.LOGIN,
    );
  });

  // ── TC_007: Password masking ───────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_007 — Password field is masked by default
   * Security check: password must be obscured before toggle is clicked.
   */
  test("TC_WEB_PENNY_LOGIN_007 — password field is masked by default", async () => {
    await loginPage.verifyPasswordIsMasked();
  });

  // ── TC_008: Password toggle ────────────────────────────────────────────────

  /**
   * TC_WEB_PENNY_LOGIN_008 — Password visibility toggle unmasks the field
   * Clicking the eye icon should change the input type from password to text.
   */
  test("TC_WEB_PENNY_LOGIN_008 — password visibility toggle reveals the password", async () => {
    // ── Arrange ──────────────────────────────────────────────────────
    await loginPage.verifyPasswordIsMasked();

    // ── Act ───────────────────────────────────────────────────────────
    await loginPage.togglePasswordVisibility();

    // ── Assert ────────────────────────────────────────────────────────
    await loginPage.verifyPasswordIsUnmasked();
  });
});
