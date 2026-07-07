import { Logger } from "../core/logger";

const logger = new Logger("GlobalTeardown");

async function globalTeardown(): Promise<void> {
  logger.info("Running global teardown...");
  // Add any cleanup needed after all tests:
  // - Close DB connections
  // - Clean up test data via API
  // - Send Slack notifications
  logger.info("Global teardown complete.");
}

export default globalTeardown;
