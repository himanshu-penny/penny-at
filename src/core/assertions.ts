import { expect, Locator, Page, APIResponse } from "@playwright/test";
import { step } from "./steps";
import { Logger } from "./logger";
import type { ApiResponse } from "../types/interfaces/api-response.interface";

const logger = new Logger("Assertions");

/**
 * Accepts either Playwright's raw APIResponse or the framework's custom ApiResponse<T>.
 * - APIResponse  → status comes from .status() method
 * - ApiResponse  → status comes from .statusCode property
 */
type StatusCheckable = APIResponse | ApiResponse<unknown>;

function resolveStatusCode(response: StatusCheckable): number {
  return typeof (response as APIResponse).status === "function"
    ? (response as APIResponse).status()
    : (response as ApiResponse<unknown>).statusCode;
}

/**
 * Enhanced assertions with step wrapping and better error messages.
 * These compose on top of Playwright's built-in expect() for maximum flexibility.
 */
export const assert = {
  // ── Element assertions ─────────────────────────────────────────
  async isVisible(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: element is visible", async () => {
      await expect(locator, message).toBeVisible();
    });
  },

  async isHidden(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: element is hidden", async () => {
      await expect(locator, message).toBeHidden();
    });
  },

  async isEnabled(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: element is enabled", async () => {
      await expect(locator, message).toBeEnabled();
    });
  },

  async isDisabled(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: element is disabled", async () => {
      await expect(locator, message).toBeDisabled();
    });
  },

  async isChecked(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: checkbox is checked", async () => {
      await expect(locator, message).toBeChecked();
    });
  },

  async isNotChecked(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: checkbox is not checked", async () => {
      await expect(locator, message).not.toBeChecked();
    });
  },

  async isFocused(locator: Locator, message?: string): Promise<void> {
    await step(message ?? "Assert: element is focused", async () => {
      await expect(locator, message).toBeFocused();
    });
  },

  async hasText(locator: Locator, text: string | RegExp, message?: string): Promise<void> {
    await step(message ?? `Assert: element has text "${String(text)}"`, async () => {
      await expect(locator, message).toHaveText(text);
    });
  },

  async containsText(locator: Locator, text: string, message?: string): Promise<void> {
    await step(message ?? `Assert: element contains text "${text}"`, async () => {
      await expect(locator, message).toContainText(text);
    });
  },

  async hasValue(locator: Locator, value: string, message?: string): Promise<void> {
    await step(message ?? `Assert: input has value "${value}"`, async () => {
      await expect(locator, message).toHaveValue(value);
    });
  },

  async hasAttribute(
    locator: Locator,
    name: string,
    value: string,
    message?: string,
  ): Promise<void> {
    await step(message ?? `Assert: element has attribute "${name}" = "${value}"`, async () => {
      await expect(locator, message).toHaveAttribute(name, value);
    });
  },

  async hasClass(locator: Locator, className: string | RegExp, message?: string): Promise<void> {
    await step(message ?? `Assert: element has class "${String(className)}"`, async () => {
      await expect(locator, message).toHaveClass(className);
    });
  },

  async hasCount(locator: Locator, count: number, message?: string): Promise<void> {
    await step(message ?? `Assert: element count is ${count}`, async () => {
      await expect(locator, message).toHaveCount(count);
    });
  },

  // ── Page/URL assertions ────────────────────────────────────────
  async urlContains(page: Page, part: string, message?: string): Promise<void> {
    await step(message ?? `Assert: URL contains "${part}"`, async () => {
      await expect(page, message).toHaveURL(
        new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      );
    });
  },

  async urlEquals(page: Page, url: string | RegExp, message?: string): Promise<void> {
    await step(message ?? `Assert: URL equals "${String(url)}"`, async () => {
      await expect(page, message).toHaveURL(url);
    });
  },

  async pageTitle(page: Page, title: string | RegExp, message?: string): Promise<void> {
    await step(message ?? `Assert: page title is "${String(title)}"`, async () => {
      await expect(page, message).toHaveTitle(title);
    });
  },

  // ── API assertions ─────────────────────────────────────────────
  /**
   * Assert the HTTP status code.
   * Accepts both Playwright's raw APIResponse and the framework's custom ApiResponse<T>.
   */
  async statusCode(response: StatusCheckable, expected: number, message?: string): Promise<void> {
    const actual = resolveStatusCode(response);
    logger.info(`Response status: ${actual} (expected: ${expected})`);
    await step(message ?? `Assert: status code is ${expected}`, async () => {
      expect(actual, message ?? `Expected status ${expected}, got ${actual}`).toBe(expected);
    });
  },

  async responseBodyContains(response: APIResponse, key: string, message?: string): Promise<void> {
    await step(message ?? `Assert: response body contains key "${key}"`, async () => {
      const body = await response.json();
      expect(body, message).toHaveProperty(key);
    });
  },
};
