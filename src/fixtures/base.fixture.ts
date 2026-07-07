import { test as base } from "@playwright/test";
import { getEnvironmentConfig } from "../config/environments";
import type { EnvironmentConfig } from "../types/interfaces/config.interface";
import { ActionHelper } from "../utils/helpers/action.helper";
import { ScreenshotHelper } from "../utils/helpers/screenshot.helper";
import { TestDataFactory } from "../factories/test-data.factory";
import { Logger } from "../core/logger";
import {
  ManualTestHelper,
  registerManualGuide,
  runWithManualGuide,
  unregisterManualGuide,
} from "../utils/helpers/manual-test.helper";
import {
  description,
  epic,
  feature,
  label,
  layer,
  link,
  owner,
  parameter,
  parentSuite,
  severity,
  story,
  subSuite,
  suite,
  tag,
} from "allure-js-commons";
import {
  cleanDescribeName,
  extractPrNumber,
  extractTestCaseId,
  mapFeature,
  mapLayer,
  mapParentSuite,
  mapSeverity,
  mapSubSuite,
} from "../utils/helpers/allure.helper";
import { isAllureRuntimeMetadataEnabled } from "../utils/helpers/allure-metadata.helper";

export type BaseFixtures = {
  /** Resolved environment configuration (urls, credentials, timeouts) */
  envConfig: EnvironmentConfig;
  /** UI action helper instance */
  actionHelper: ActionHelper;
  /** Screenshot helper instance */
  screenshotHelper: ScreenshotHelper;
  /** Test data factory for generating users, vendors, and API payload data */
  testData: TestDataFactory;
  /** Framework logger */
  logger: Logger;
  /** Human-readable guide for manual testers reviewing automated runs */
  manualGuide: ManualTestHelper;
  /** Auto fixture — enriches every test with Allure labels */
  _allureEnrich: void;
};

/**
 * Base test fixture — extended by web and API fixtures.
 *
 * Available in ALL tests:
 *   envConfig, actionHelper, screenshotHelper, testData, logger
 */
export const test = base.extend<BaseFixtures>({
  envConfig: async ({}, use) => {
    await use(getEnvironmentConfig());
  },

  actionHelper: async ({ page }, use) => {
    await use(new ActionHelper(page));
  },

  screenshotHelper: async ({ page }, use) => {
    await use(new ScreenshotHelper(page));
  },

  testData: async ({}, use) => {
    await use(new TestDataFactory());
  },

  logger: async ({}, use) => {
    await use(new Logger("Test"));
  },

  manualGuide: [
    async ({}, use, testInfo) => {
      const helper = new ManualTestHelper(testInfo);
      registerManualGuide(testInfo, helper);

      try {
        await runWithManualGuide(helper, async () => {
          await use(helper);
        });
      } finally {
        await helper.flush();
        unregisterManualGuide(testInfo);
      }
    },
    { auto: true, scope: "test" },
  ],

  _allureEnrich: [
    async ({}, use, testInfo) => {
      const featureName = mapFeature(testInfo.file);
      const describeBlock = cleanDescribeName(testInfo.titlePath);
      const testTitle = testInfo.title.replace(/\s@\w+/g, "").trim();
      const tcId = extractTestCaseId(testTitle);

      if (isAllureRuntimeMetadataEnabled()) {
        // ── Hierarchy ─────────────────────────────────────────────────
        await epic("Penny App");
        await feature(featureName);
        await story(describeBlock);
        await parentSuite(mapParentSuite(testInfo.tags));
        await suite(featureName);
        await subSuite(mapSubSuite(testInfo.tags));

        // ── Classification ────────────────────────────────────────────
        await severity(mapSeverity(testInfo.tags));
        await layer(mapLayer(testInfo.tags));
        await owner("QA Automation Team");

        // ── Tags — one label per tag for Allure filtering ─────────────
        for (const t of testInfo.tags) {
          await tag(t.replace(/^@/, ""));
        }

        // ── Test Case ID ──────────────────────────────────────────────
        if (tcId) {
          await label("testId", tcId);
        }

        // ── PR link — extracted from file path ────────────────────────
        const prNum = extractPrNumber(testInfo.file);
        if (prNum) {
          await link(`https://github.com/penny-co/penny/pull/${prNum}`, `PR #${prNum}`, "issue");
        }

        // ── Description ───────────────────────────────────────────────
        // Format: "TC_ID — describe block › clean test title"
        const descLine = describeBlock ? `${describeBlock} › ${testTitle}` : testTitle;
        const fullDesc = tcId ? `**${tcId}**\n\n${descLine}` : descLine;
        await description(fullDesc);

        // ── Parameters ────────────────────────────────────────────────
        await parameter("Environment", process.env.TEST_ENV ?? "dev");
        await parameter("Project", testInfo.project.name);
        if (tcId) {
          await parameter("Test Case ID", tcId);
        }
      }

      await use();
    },
    { auto: true, scope: "test" },
  ],
});

export { expect } from "@playwright/test";
