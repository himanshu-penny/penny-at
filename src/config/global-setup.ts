import { FullConfig } from "@playwright/test";
import { getEnvironmentConfig } from "./environments";
import { Logger } from "../core/logger";
import fs from "fs";
import path from "path";
import os from "os";

const logger = new Logger("GlobalSetup");

async function globalSetup(config: FullConfig): Promise<void> {
  try {
    await runSetup(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Global setup failed: ${message}`);
    throw error;
  }
}

async function runSetup(config: FullConfig): Promise<void> {
  // 1. Resolve environment config
  const envConfig = getEnvironmentConfig();
  logger.info(`Running tests against: ${envConfig.name} (${envConfig.webUrl})`);

  // 2. Ensure artifact directories exist (clean generated report data on every run)
  const allureResultsPath = path.resolve("artifacts/reports/allure-results");
  const allureHistoryPath = path.resolve("artifacts/reports/allure-html/history");
  const reportMetaPath = path.resolve("artifacts/reports/meta");

  // Preserve history trend before wiping results
  let savedHistory: { name: string; content: Buffer }[] = [];
  if (fs.existsSync(allureHistoryPath)) {
    savedHistory = fs
      .readdirSync(allureHistoryPath)
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        name: f,
        content: fs.readFileSync(path.join(allureHistoryPath, f)),
      }));
    logger.info(`Preserved ${savedHistory.length} Allure history file(s) for trend tracking.`);
  }

  // Always wipe allure-results so old runs don't pollute the report
  if (fs.existsSync(allureResultsPath)) {
    fs.rmSync(allureResultsPath, { recursive: true, force: true });
  }
  if (fs.existsSync(reportMetaPath)) {
    fs.rmSync(reportMetaPath, { recursive: true, force: true });
  }

  const dirs = [
    "artifacts/reports/html",
    "artifacts/reports/allure-results",
    "artifacts/reports/meta",
    "artifacts/screenshots",
    "artifacts/videos",
    "artifacts/traces",
  ];

  for (const dir of dirs) {
    try {
      fs.mkdirSync(path.resolve(dir), { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory "${dir}": ${(error as Error).message}`);
    }
  }

  // 3. Restore Allure history into new results dir (enables trend graphs)
  const allureResultsDir = path.resolve("artifacts/reports/allure-results");
  if (savedHistory.length > 0) {
    const historyDestDir = path.join(allureResultsDir, "history");
    fs.mkdirSync(historyDestDir, { recursive: true });
    for (const file of savedHistory) {
      fs.writeFileSync(path.join(historyDestDir, file.name), file.content);
    }
    logger.info("Allure history restored — trends will be visible in report.");
  }

  // 4. Write Allure environment, executor, and failure categories.
  writeAllureEnvironment(allureResultsDir, envConfig, config);
  writeAllureExecutor(allureResultsDir, envConfig);
  writeAllureCategories(allureResultsDir);

  logger.info("Global setup complete.");

  // 5. Ensure storage-state placeholder files exist
  //    Real content is written by auth-setup-web / auth-setup-api projects.
  const storageStates: Array<{ file: string; label: string }> = [
    { file: ".auth/user-web.json", label: "auth-setup-web" },
    { file: ".auth/user-api.json", label: "auth-setup-api" },
  ];

  for (const { file, label } of storageStates) {
    const p = path.resolve(file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify({ cookies: [], origins: [] }));
      logger.warn(`${file} not found — placeholder created. Run ${label} project first.`);
    }
  }
}

function writeAllureEnvironment(
  allureResultsDir: string,
  envConfig: ReturnType<typeof getEnvironmentConfig>,
  config: FullConfig,
): void {
  const envProps = {
    Project: "Penny AT",
    Client: envConfig.client ?? "unknown",
    "Test Environment": process.env.TEST_ENV ?? "test",
    "Resolved Environment": envConfig.name,
    "Web URL": envConfig.webUrl,
    "API URL": envConfig.apiUrl,
    CI: process.env.CI ? "true" : "false",
    Branch: process.env.GITHUB_REF_NAME ?? process.env.BRANCH_NAME ?? "local",
    Commit: process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? "local",
    "Node Version": `v${process.versions.node}`,
    OS: `${os.type()} ${os.release()} (${os.arch()})`,
    Workers: String(config.workers),
    Projects: config.projects.map((project) => project.name).join(", "),
    Timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(allureResultsDir, "environment.properties"),
    Object.entries(envProps)
      .map(([key, value]) => `${escapeProperty(key)}=${escapeProperty(value)}`)
      .join("\n"),
  );
}

function writeAllureExecutor(
  allureResultsDir: string,
  envConfig: ReturnType<typeof getEnvironmentConfig>,
): void {
  const workflowUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined;

  const executor = {
    name: process.env.GITHUB_ACTIONS ? "GitHub Actions" : "Local",
    type: process.env.GITHUB_ACTIONS ? "github" : "local",
    url: process.env.GITHUB_SERVER_URL,
    buildName: process.env.GITHUB_RUN_NUMBER
      ? `Run #${process.env.GITHUB_RUN_NUMBER}`
      : `${envConfig.name} local run`,
    buildUrl: workflowUrl,
    reportName: `Penny AT — ${envConfig.name}`,
    reportUrl: process.env.ALLURE_REPORT_URL,
  };

  fs.writeFileSync(
    path.join(allureResultsDir, "executor.json"),
    JSON.stringify(removeUndefinedValues(executor), null, 2),
  );
}

function writeAllureCategories(allureResultsDir: string): void {
  const categories = [
    {
      name: "Authentication / Session Failures",
      matchedStatuses: ["failed", "broken"],
      messageRegex: ".*AuthenticationError.*|.*Login failed.*|.*auth/login.*|.*E1001.*",
    },
    {
      name: "Locator / UI Contract Failures",
      matchedStatuses: ["failed"],
      messageRegex:
        ".*element\\(s\\) not found.*|.*locator.*not found.*|.*toBeVisible.*|.*strict mode violation.*|.*Target page.*closed.*",
    },
    {
      name: "API Response / Contract Failures",
      matchedStatuses: ["failed"],
      messageRegex:
        ".*expected status.*got.*|.*Expected status code.*|.*statusCode.*|.*HTTP.*[45][0-9]{2}.*|.*status.*40[0-9].*|.*status.*50[0-9].*|.*ApiError.*",
    },
    {
      name: "Schema Validation Failures",
      matchedStatuses: ["failed"],
      messageRegex: ".*SchemaValidationError.*|.*Schema validation failed.*|.*AJV.*",
    },
    {
      name: "Assertion Failures",
      matchedStatuses: ["failed"],
      messageRegex:
        ".*AssertionError.*|.*expect\\(.*\\)\\..*|.*toBeVisible.*|.*toHaveText.*|.*toHaveURL.*|.*toBe\\(.*\\).*|.*toEqual.*|.*toContain.*|.*toHaveLength.*",
    },
    {
      name: "Timeout Failures",
      matchedStatuses: ["failed", "broken"],
      messageRegex:
        ".*TimeoutError.*|.*Timeout.*exceeded.*|.*waiting for.*|.*navigation.*timeout.*|.*locator.*timeout.*",
    },
    {
      name: "Network / Infrastructure Errors",
      matchedStatuses: ["failed", "broken"],
      messageRegex:
        ".*ECONNREFUSED.*|.*ERR_CONNECTION.*|.*net::ERR.*|.*ETIMEDOUT.*|.*ENOTFOUND.*|.*fetch.*failed.*|.*DNS.*|.*ECONNRESET.*",
    },
    {
      name: "Test / Framework Errors",
      matchedStatuses: ["broken"],
    },
    {
      name: "Skipped Tests",
      matchedStatuses: ["skipped"],
    },
  ];

  fs.writeFileSync(
    path.join(allureResultsDir, "categories.json"),
    JSON.stringify(categories, null, 2),
  );
}

function escapeProperty(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/=/g, "\\=");
}

function removeUndefinedValues<T extends Record<string, unknown>>(
  value: T,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
}

export default globalSetup;
