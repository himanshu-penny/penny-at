/**
 * strip-ansi-allure.js
 *
 * Post-processes Allure result attachment files to remove ANSI escape codes
 * before the HTML report is generated.
 *
 * Why: Playwright workers capture console output (including chalk ANSI codes)
 * verbatim into allure-results *.txt attachments. Allure's HTML renderer
 * does not interpret ANSI — it displays them as raw garbage characters.
 * This script strips them so logs appear as clean, readable plain text.
 *
 * Usage: node scripts/strip-ansi-allure.js [resultsDir]
 * Default resultsDir: artifacts/reports/allure-results
 */

const fs = require("fs");
const path = require("path");

// Matches all ANSI/VT100 escape sequences (colors, cursor moves, etc.)
const ANSI_REGEX = /\x1B\[[0-?]*[ -/]*[@-~]/g;

const rootDir = path.resolve(__dirname, "..");
const resultsDir = path.resolve(
  process.argv[2] ?? path.join("artifacts", "reports", "allure-results"),
);
const relativeResultsDir = path.relative(rootDir, resultsDir);

if (relativeResultsDir.startsWith("..") || path.isAbsolute(relativeResultsDir)) {
  console.error(`[strip-ansi-allure] Refusing to edit files outside this workspace: ${resultsDir}`);
  process.exit(1);
}

if (!fs.existsSync(resultsDir)) {
  console.log(`[strip-ansi-allure] Directory not found, skipping: ${resultsDir}`);
  process.exit(0);
}

const files = fs
  .readdirSync(resultsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
  .map((entry) => entry.name);

if (files.length === 0) {
  console.log("[strip-ansi-allure] No .txt attachments found.");
  process.exit(0);
}

let cleaned = 0;
for (const file of files) {
  const filePath = path.join(resultsDir, file);
  const original = fs.readFileSync(filePath, "utf-8");
  const stripped = original.replace(ANSI_REGEX, "");

  if (stripped !== original) {
    fs.writeFileSync(filePath, stripped, "utf-8");
    cleaned++;
  }
}

console.log(
  `[strip-ansi-allure] Cleaned ANSI codes from ${cleaned}/${files.length} attachment(s) in ${resultsDir}`,
);
