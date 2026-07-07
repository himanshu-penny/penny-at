import { Page, Locator } from "@playwright/test";
import path from "path";
import fs from "fs";
import { Logger } from "../../core/logger";
import { FileHelper } from "./file.helper";

export class ScreenshotHelper {
  private readonly logger: Logger;

  constructor(private readonly page: Page) {
    this.logger = new Logger("ScreenshotHelper");
  }

  private getFilePath(name: string): string {
    const dir = path.resolve("artifacts/screenshots");
    fs.mkdirSync(dir, { recursive: true });
    const safeName = FileHelper.safeFileName(name, "screenshot");
    const timestamp = FileHelper.timestampForFile();
    return path.join(dir, `${safeName}_${timestamp}.png`);
  }

  /** Capture a viewport screenshot */
  async take(name: string): Promise<string> {
    const filePath = this.getFilePath(name);
    await this.page.screenshot({ path: filePath });
    this.logger.info(`Screenshot saved: ${filePath}`);
    return filePath;
  }

  /** Capture a full-page screenshot (scrolls entire page) */
  async takeFullPageScreenshot(name: string): Promise<string> {
    const filePath = this.getFilePath(name);
    await this.page.screenshot({ path: filePath, fullPage: true });
    this.logger.info(`Full-page screenshot saved: ${filePath}`);
    return filePath;
  }

  /** Capture a screenshot of a specific element only */
  async takeElementScreenshot(name: string, locator: Locator): Promise<string> {
    const filePath = this.getFilePath(name);
    await locator.screenshot({ path: filePath });
    this.logger.info(`Element screenshot saved: ${filePath}`);
    return filePath;
  }
}
