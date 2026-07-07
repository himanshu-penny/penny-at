import { Page, Locator, Request, Response, expect } from "@playwright/test";
import { TIMEOUTS } from "../../core/constants/timeouts";

/**
 * WaitHelper — common wait strategies for stable, non-flaky tests.
 *
 * IMPORTANT: Prefer Playwright's built-in auto-waiting over explicit waits.
 * Only use these helpers when you genuinely need to wait for a specific state
 * that Playwright's auto-wait doesn't cover.
 */
export class WaitHelper {
  constructor(private readonly page: Page) {}

  /** Wait for element to become visible */
  async forVisible(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_VISIBLE): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  /** Wait for element to become hidden */
  async forHidden(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_HIDDEN): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout });
  }

  /** Wait for element to be attached to the DOM */
  async forAttached(locator: Locator, timeout: number = TIMEOUTS.DEFAULT): Promise<void> {
    await locator.waitFor({ state: "attached", timeout });
  }

  /** Wait for element to be detached from DOM */
  async forDetached(locator: Locator, timeout: number = TIMEOUTS.DEFAULT): Promise<void> {
    await locator.waitFor({ state: "detached", timeout });
  }

  /** Wait for page load event — use instead of networkidle for reliability */
  async forLoad(timeout: number = TIMEOUTS.PAGE_LOAD): Promise<void> {
    await this.page.waitForLoadState("load", { timeout });
  }

  /** Wait for DOMContentLoaded */
  async forDOMContentLoaded(timeout: number = TIMEOUTS.PAGE_LOAD): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded", { timeout });
  }

  /**
   * Wait for network to be idle (no pending requests for 500 ms).
   * Use sparingly — prefer forLoad for navigation; networkidle can be flaky on busy pages.
   */
  async forNetworkIdle(timeout: number = TIMEOUTS.PAGE_LOAD): Promise<void> {
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /** Wait for a specific URL pattern */
  async forURL(url: string | RegExp, timeout: number = TIMEOUTS.PAGE_LOAD): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  /** Wait for element to contain specific text */
  async forText(
    locator: Locator,
    text: string | RegExp,
    timeout: number = TIMEOUTS.DEFAULT,
  ): Promise<void> {
    await expect(locator).toHaveText(text, { timeout });
  }

  /** Wait for element to reach a specific count */
  async forCount(
    locator: Locator,
    expectedCount: number,
    timeout: number = TIMEOUTS.DEFAULT,
  ): Promise<void> {
    await expect(locator).toHaveCount(expectedCount, { timeout });
  }

  /** Wait for a custom condition to become true */
  async forCondition(
    condition: () => Promise<boolean>,
    timeout: number = TIMEOUTS.DEFAULT,
    pollInterval = 300,
  ): Promise<void> {
    await expect.poll(condition, { timeout, intervals: [pollInterval] }).toBe(true);
  }

  /**
   * Wait for a network request matching the URL pattern and return it.
   * Useful for asserting request payloads in interceptor patterns.
   */
  async forRequest(
    urlPattern: string | RegExp,
    timeout: number = TIMEOUTS.API_RESPONSE,
  ): Promise<Request> {
    return this.page.waitForRequest(urlPattern, { timeout });
  }

  /**
   * Wait for a network response matching the URL pattern and return it.
   * Useful for asserting response status/body after triggering an action.
   */
  async forResponse(
    urlPattern: string | RegExp,
    timeout: number = TIMEOUTS.API_RESPONSE,
  ): Promise<Response> {
    return this.page.waitForResponse(urlPattern, { timeout });
  }
}
