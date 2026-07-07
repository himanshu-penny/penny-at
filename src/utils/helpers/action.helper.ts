import { Page, Locator } from "@playwright/test";
import { Logger } from "../../core/logger";
import { TIMEOUTS } from "../../core/constants/timeouts";

type ClickOptions = {
  force?: boolean;
  timeout?: number;
  button?: "left" | "right" | "middle";
};

type InputOptions = {
  timeout?: number;
};

/**
 * ActionHelper — wrapper around common Playwright interactions.
 *
 * Why use this instead of raw Playwright calls?
 * - Consistent logging on every action (with element identity)
 * - Scrolls into view before clicking (avoids out-of-viewport failures)
 * - Uniform options across the codebase
 *
 * Usage (via BasePage):
 *   await this.action.click(this.submitButton);
 */
export class ActionHelper {
  private readonly logger: Logger;

  constructor(private readonly page: Page) {
    this.logger = new Logger("ActionHelper");
  }

  /** Click an element, scrolling into view first */
  async click(locator: Locator, options?: ClickOptions): Promise<void> {
    this.logger.info(`Clicking element: ${String(locator)}`);
    await locator.scrollIntoViewIfNeeded({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
    await locator.click({
      force: options?.force ?? false,
      timeout: options?.timeout ?? TIMEOUTS.CLICK,
      button: options?.button ?? "left",
    });
  }

  /** Double-click an element */
  async doubleClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Double-clicking element: ${String(locator)}`);
    await locator.scrollIntoViewIfNeeded({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
    await locator.dblclick({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
  }

  /** Right-click (context menu) */
  async rightClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Right-clicking element: ${String(locator)}`);
    await locator.scrollIntoViewIfNeeded({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
    await locator.click({ button: "right", timeout: options?.timeout ?? TIMEOUTS.CLICK });
  }

  /** Clear and fill an input field */
  async fill(locator: Locator, text: string, options?: InputOptions): Promise<void> {
    this.logger.info(`Filling input field: ${String(locator)}`);
    await locator.fill(text, { timeout: options?.timeout ?? TIMEOUTS.DEFAULT });
  }

  /** Clear a field without filling it */
  async clearField(locator: Locator, options?: InputOptions): Promise<void> {
    this.logger.info(`Clearing field: ${String(locator)}`);
    await locator.clear({ timeout: options?.timeout ?? TIMEOUTS.DEFAULT });
  }

  /** Type text with a delay (simulates real typing) */
  async type(locator: Locator, text: string, delayMs = 50, options?: InputOptions): Promise<void> {
    this.logger.info(`Typing into field: ${String(locator)}`);
    await locator.pressSequentially(text, {
      delay: delayMs,
      timeout: options?.timeout ?? TIMEOUTS.DEFAULT,
    });
  }

  /** Select a dropdown option by value, label, or index */
  async selectOption(
    locator: Locator,
    value: string | { label?: string; value?: string; index?: number },
  ): Promise<void> {
    this.logger.info(`Selecting option: ${JSON.stringify(value)}`);
    if (typeof value === "string") {
      await locator.selectOption({ value });
    } else {
      await locator.selectOption(value);
    }
  }

  /** Set checkbox to checked */
  async check(locator: Locator, options?: InputOptions): Promise<void> {
    this.logger.info(`Checking checkbox: ${String(locator)}`);
    await locator.check({ timeout: options?.timeout ?? TIMEOUTS.DEFAULT });
  }

  /** Set checkbox to unchecked */
  async uncheck(locator: Locator, options?: InputOptions): Promise<void> {
    this.logger.info(`Unchecking checkbox: ${String(locator)}`);
    await locator.uncheck({ timeout: options?.timeout ?? TIMEOUTS.DEFAULT });
  }

  /** Hover over an element */
  async hover(locator: Locator): Promise<void> {
    this.logger.info(`Hovering over element: ${String(locator)}`);
    await locator.hover();
  }

  /** Move keyboard focus to an element */
  async focus(locator: Locator): Promise<void> {
    this.logger.info(`Focusing element: ${String(locator)}`);
    await locator.focus();
  }

  /** Tap an element on touch-capable contexts */
  async tap(locator: Locator, options?: InputOptions): Promise<void> {
    this.logger.info(`Tapping element: ${String(locator)}`);
    await locator.scrollIntoViewIfNeeded({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
    await locator.tap({ timeout: options?.timeout ?? TIMEOUTS.CLICK });
  }

  /** Get trimmed text content of an element */
  async getText(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    return text?.trim() ?? "";
  }

  /** Get trimmed text from every matched element */
  async getAllTexts(locator: Locator): Promise<string[]> {
    const texts = await locator.allTextContents();
    return texts.map((t) => t.trim());
  }

  /** Get an attribute value */
  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  /** Get value of an input element */
  async getInputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  /** Upload file(s) to a file input */
  async uploadFile(locator: Locator, filePaths: string | string[]): Promise<void> {
    const fileCount = Array.isArray(filePaths) ? filePaths.length : 1;
    this.logger.info(`Uploading ${fileCount} file(s)`);
    await locator.setInputFiles(filePaths);
  }

  /** Press a keyboard key on the currently focused element */
  async pressKey(key: string): Promise<void> {
    this.logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /** Press a keyboard key on a specific element */
  async pressKeyOnElement(locator: Locator, key: string): Promise<void> {
    this.logger.info(`Pressing key "${key}" on element: ${String(locator)}`);
    await locator.press(key);
  }

  /** Press Enter key */
  async pressEnter(): Promise<void> {
    await this.pressKey("Enter");
  }

  /** Press Tab key */
  async pressTab(): Promise<void> {
    await this.pressKey("Tab");
  }

  /** Press Escape key */
  async pressEscape(): Promise<void> {
    await this.pressKey("Escape");
  }

  /** Drag locator to target */
  async dragTo(source: Locator, target: Locator): Promise<void> {
    this.logger.info(`Dragging element to target: ${String(source)} → ${String(target)}`);
    await source.dragTo(target);
  }

  /** Scroll the page to the top */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /** Scroll the page to the bottom */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}
