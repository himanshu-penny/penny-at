import { Page } from "@playwright/test";
import { ActionHelper } from "../../utils/helpers/action.helper";
import { WaitHelper } from "../../utils/helpers/wait.helper";
import { ScreenshotHelper } from "../../utils/helpers/screenshot.helper";
import { Logger } from "../../core/logger";
import { Step } from "../../core/steps";

const BASE_LOCATORS = {
  LOADING_SPINNER: '[data-test-id="loading-spinner"]',
  TOAST_MESSAGE: '[data-test-id="toast-message"]',
  NOTIFICATION_DISMISS: '[data-test-id="dismiss-dialog-button"]',
} as const;

/**
 * BasePage — parent class for all Web page objects.
 *
 * Provides shared utilities (logging, waits, actions) and enforces
 * a consistent pattern for navigating to pages and checking readiness.
 *
 * Usage:
 *   export class LoginPage extends BasePage {
 *     constructor(page: Page) { super(page); }
 *     get url() { return "/login"; }
 *     async isReady() { return this.emailInput.isVisible(); }
 *   }
 */
export abstract class BasePage {
  protected readonly action: ActionHelper;
  protected readonly wait: WaitHelper;
  protected readonly screenshot: ScreenshotHelper;
  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.action = new ActionHelper(page);
    this.wait = new WaitHelper(page);
    this.screenshot = new ScreenshotHelper(page);
    this.logger = new Logger(this.constructor.name);
  }

  /** Navigate to this page's URL (relative to baseURL) */
  @Step("Navigate to page")
  async navigate(path = ""): Promise<void> {
    this.logger.info(`Navigating to: ${path}`);
    await this.page.goto(path);
    await this.wait.forDOMContentLoaded();
  }

  /** Get the current page title */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Get the current URL */
  getCurrentURL(): string {
    return this.page.url();
  }

  /** Reload the page */
  async reload(): Promise<void> {
    this.logger.info("Reloading page");
    await this.page.reload();
    await this.wait.forDOMContentLoaded();
  }

  /** Go back in browser history */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /** Wait for page to be fully loaded */
  async waitForLoad(): Promise<void> {
    await this.wait.forLoad();
  }

  /** Check if a loading spinner is present */
  async isLoading(): Promise<boolean> {
    const spinner = this.page.locator(BASE_LOCATORS.LOADING_SPINNER);
    return spinner.isVisible();
  }

  /** Wait for loading spinner to disappear */
  async waitForLoadingToFinish(): Promise<void> {
    const spinner = this.page.locator(BASE_LOCATORS.LOADING_SPINNER);
    if (await spinner.isVisible()) {
      await this.wait.forHidden(spinner);
    }
  }

  /** Get toast/notification message text */
  async getToastMessage(): Promise<string> {
    const toast = this.page.locator(BASE_LOCATORS.TOAST_MESSAGE);
    await this.wait.forVisible(toast);
    return this.action.getText(toast);
  }

  /**
   * Dismiss the "Enable Notifications" dialog if it appears.
   * This dialog shows after login when browser notifications are disabled.
   * Safe to call always — does nothing if the dialog is not present.
   */
  async dismissNotificationDialogIfPresent(): Promise<void> {
    const dismissBtn = this.page.locator(BASE_LOCATORS.NOTIFICATION_DISMISS);
    try {
      await dismissBtn.waitFor({ state: "visible", timeout: 5_000 });
      this.logger.info("Dismissing 'Enable Notifications' dialog");
      await dismissBtn.click();
      await dismissBtn.waitFor({ state: "hidden", timeout: 5_000 });
    } catch {
      // Dialog not present — nothing to do
    }
  }
}
