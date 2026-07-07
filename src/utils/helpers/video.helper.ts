import { Page } from "@playwright/test";
import path from "path";
import fs from "fs";
import { Logger } from "../../core/logger";
import { FileHelper } from "./file.helper";

export class VideoHelper {
  private readonly logger: Logger;

  constructor(private readonly page: Page) {
    this.logger = new Logger("VideoHelper");
  }

  /**
   * Get the path to the recorded video for this page.
   * Video recording must be enabled in playwright.config.ts (video: "on" or "retain-on-failure")
   */
  async getVideoPath(): Promise<string | null> {
    const video = this.page.video();
    if (!video) return null;
    return video.path();
  }

  /**
   * Save the recorded video to a custom location.
   * Returns the destination path, or null if recording is not enabled.
   */
  async saveVideo(name: string): Promise<string | null> {
    const video = this.page.video();
    if (!video) return null;

    const dir = path.resolve("artifacts/videos");
    fs.mkdirSync(dir, { recursive: true });

    const safeName = FileHelper.safeFileName(name, "video");
    const timestamp = FileHelper.timestampForFile();
    const destPath = path.join(dir, `${safeName}_${timestamp}.webm`);

    await video.saveAs(destPath);
    this.logger.info(`Video saved: ${destPath}`);
    return destPath;
  }

  /**
   * Delete the recorded video for this page.
   * Useful for cleaning up videos of passed tests when retain-on-failure is configured.
   */
  async deleteVideo(): Promise<void> {
    const video = this.page.video();
    if (!video) return;

    const videoPath = await video.path();
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      this.logger.info(`Video deleted: ${videoPath}`);
    }
  }
}
