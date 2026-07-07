import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { Step } from "../../core/steps";
import { PENNY_ROUTES } from "../../core/constants";

const PENNY_LOGIN_LOCATORS = {
  EMAIL_INPUT: '[data-test-id="email-address-input"]',
  PASSWORD_INPUT: '[data-test-id="password-input"]',
  PASSWORD_TOGGLE: '[data-test-id="password-input"] ~ button',
  FORGOT_PASSWORD_LINK: '[data-test-id="forgot-password-link"]',
  LOGIN_BUTTON: '[data-test-id="login-button"]',
  GOOGLE_SSO_BUTTON: '[ptooltip="Sign In with Google"]',
  MICROSOFT_SSO_BUTTON: '[ptooltip="Sign In with Microsoft"]',
  FOODICS_SSO_BUTTON: '[ptooltip="Sign In with Foodics"]',
  PENNY_LOGO: 'img[src*="penny_secondary_logo"]',
  ERROR_TOAST: "p-toast .p-toast-message, .p-message-error, .p-inline-message",
} as const;

/**
 * PennyLoginPage — page object for the Penny login screen.
 *
 * ─── RULE ─────────────────────────────────────────────────────────────────────
 * Every interaction with the Penny login page MUST go through this class.
 * Test specs must NEVER contain raw locator strings — use the methods below.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * LOCATOR STRATEGY (from outer HTML):
 *   - Inputs:  data-test-id attributes (most stable)
 *   - Buttons: data-test-id + ptooltip attributes for SSO buttons
 *   - Logo:    src partial match
 */
export class PennyLoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordToggle: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly loginButton: Locator;
  private readonly googleSsoButton: Locator;
  private readonly microsoftSsoButton: Locator;
  private readonly foodicsSsoButton: Locator;
  private readonly pennyLogo: Locator;
  private readonly errorToast: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator(PENNY_LOGIN_LOCATORS.EMAIL_INPUT);
    this.passwordInput = page.locator(PENNY_LOGIN_LOCATORS.PASSWORD_INPUT);
    this.passwordToggle = page.locator(PENNY_LOGIN_LOCATORS.PASSWORD_TOGGLE);
    this.forgotPasswordLink = page.locator(PENNY_LOGIN_LOCATORS.FORGOT_PASSWORD_LINK);
    this.loginButton = page.locator(PENNY_LOGIN_LOCATORS.LOGIN_BUTTON);
    this.googleSsoButton = page.locator(PENNY_LOGIN_LOCATORS.GOOGLE_SSO_BUTTON);
    this.microsoftSsoButton = page.locator(PENNY_LOGIN_LOCATORS.MICROSOFT_SSO_BUTTON);
    this.foodicsSsoButton = page.locator(PENNY_LOGIN_LOCATORS.FOODICS_SSO_BUTTON);
    this.pennyLogo = page.locator(PENNY_LOGIN_LOCATORS.PENNY_LOGO);
    this.errorToast = page.locator(PENNY_LOGIN_LOCATORS.ERROR_TOAST);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  @Step("Navigate to Penny login page")
  async navigateToLogin(baseUrl: string): Promise<void> {
    await this.navigate(`${baseUrl}${PENNY_ROUTES.LOGIN}`);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  @Step("Enter email")
  async enterEmail(email: string): Promise<void> {
    this.logger.info(`Entering email: ${email}`);
    await this.action.fill(this.emailInput, email);
  }

  @Step("Enter password")
  async enterPassword(password: string): Promise<void> {
    this.logger.info("Entering password");
    await this.action.fill(this.passwordInput, password);
  }

  @Step("Click login button")
  async clickLogin(): Promise<void> {
    await this.action.click(this.loginButton);
  }

  @Step("Login with credentials")
  async login(email: string, password: string): Promise<void> {
    this.logger.info(`Logging in as: ${email}`);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  @Step("Click password visibility toggle")
  async togglePasswordVisibility(): Promise<void> {
    await this.action.click(this.passwordToggle);
  }

  @Step("Click forgot password link")
  async clickForgotPassword(): Promise<void> {
    await this.action.click(this.forgotPasswordLink);
  }

  // ── Queries ──────────────────────────────────────────────────────────────────

  async getPasswordInputType(): Promise<string | null> {
    return this.action.getAttribute(this.passwordInput, "type");
  }

  async hasErrorToast(): Promise<boolean> {
    try {
      await this.errorToast.first().waitFor({ state: "visible", timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async isEmailInputVisible(): Promise<boolean> {
    return this.emailInput.isVisible();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  @Step("Verify Penny login page is fully loaded")
  async verifyPageIsLoaded(): Promise<void> {
    await expect(this.pennyLogo, "Penny logo should be visible").toBeVisible();
    await expect(this.emailInput, "Email input should be visible").toBeVisible();
    await expect(this.passwordInput, "Password input should be visible").toBeVisible();
    await expect(this.loginButton, "Login button should be visible").toBeVisible();
    await expect(this.forgotPasswordLink, "Forgot password link should be visible").toBeVisible();
  }

  @Step("Verify SSO buttons are visible")
  async verifySsoButtonsVisible(): Promise<void> {
    await expect(this.googleSsoButton, "Google SSO button should be visible").toBeVisible();
    await expect(this.microsoftSsoButton, "Microsoft SSO button should be visible").toBeVisible();
  }

  @Step("Verify password field is masked")
  async verifyPasswordIsMasked(): Promise<void> {
    await expect(this.passwordInput, "Password input type should be 'password'").toHaveAttribute(
      "type",
      "password",
    );
  }

  @Step("Verify password field is unmasked")
  async verifyPasswordIsUnmasked(): Promise<void> {
    await expect(
      this.passwordInput,
      "Password input type should be 'text' after toggle",
    ).toHaveAttribute("type", "text");
  }
}
