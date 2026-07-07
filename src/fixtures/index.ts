/**
 * Unified fixture export.
 *
 * Import from "@fixtures" in all tests — TypeScript path alias handles this.
 * The merged test object includes ALL fixture types (base + web + api).
 *
 * Usage:
 *   import { test, expect } from "@fixtures";
 */
import { mergeTests } from "@playwright/test";
import { test as baseTest, expect } from "./base.fixture";
import { test as webTest } from "./web.fixture";
import { test as apiTest } from "./api.fixture";

// Merge all fixture types into a single test object
const test = mergeTests(baseTest, webTest, apiTest);

export { test, expect };
export type { BaseFixtures } from "./base.fixture";
export type { WebFixtures } from "./web.fixture";
export type { ApiFixtures } from "./api.fixture";
