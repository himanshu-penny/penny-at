import { Page } from "@playwright/test";
import { Logger } from "../core/logger";
import { ScreenshotHelper } from "../utils/helpers/screenshot.helper";

const logger = new Logger("ErrorHandler");

/**
 * Centralised error handling utilities.
 *
 * Usage:
 *   try {
 *     await loginPage.login(user, pass);
 *   } catch (error) {
 *     await ErrorHandler.handle(error as Error, "login flow", page);
 *     throw error; // re-throw so the test still fails
 *   }
 */
export class ErrorHandler {
  /**
   * Log error details and capture a screenshot if a page is available.
   */
  static async handle(error: Error, context: string, page?: Page): Promise<void> {
    logger.error(`Error in "${context}": ${error.message}`, {
      stack: error.stack,
      name: error.name,
    });

    if (page) {
      try {
        const screenshotHelper = new ScreenshotHelper(page);
        await screenshotHelper.takeFullPageScreenshot(`ERROR_${context}`);
      } catch (ssError) {
        logger.warn(`Could not capture error screenshot: ${ssError}`);
      }
    }
  }

  /**
   * Wrap an async function with automatic error handling.
   * The error is still re-thrown after logging + screenshot.
   */
  static wrapAsync<T>(fn: () => Promise<T>, context: string, page?: Page): Promise<T> {
    return fn().catch(async (error: Error) => {
      await ErrorHandler.handle(error, context, page);
      throw error;
    });
  }
}
