#!/usr/bin/env node
/**
 * generate-schema.js — Schema Generator Utility
 * ================================================
 * Calls a live API endpoint, captures the response body, uses genson-js to
 * infer a JSON Schema, then writes it to test-data/response-schemas/.
 *
 * Usage:
 *   node scripts/generate-schema.js <URL> <outputFile>
 *
 * Examples:
 *   # Generate schema for a public endpoint
 *   node scripts/generate-schema.js \
 *     https://example.penny.co/api/health \
 *     health/GET_health_schema.json
 *
 *   # Generate schema for an authenticated endpoint
 *   PENNY_ACCESS_TOKEN="eyJhbGci..." \
 *   node scripts/generate-schema.js \
 *     https://example.penny.co/api/request \
 *     requests/GET_request_schema.json
 *
 * npm shortcut:
 *   npm run generate:schema -- <URL> <outputFile>
 * ================================================
 */

const fs = require("fs");
const path = require("path");

const SCHEMA_DIR = path.resolve("test-data/response-schemas");
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_ERROR_BODY_CHARS = 1_000;
const SENSITIVE_KEY_PATTERN =
  /^(authorization|cookie|set-cookie|password|token|accessToken|refreshToken|secret|apiKey|x-api-key)$/i;

function exitWithUsage() {
  console.error("\nUsage: node scripts/generate-schema.js <URL> <outputFile>");
  console.error("\nExample:");
  console.error(
    "  PENNY_ACCESS_TOKEN=... npm run generate:schema -- https://example.penny.co/api/request requests/GET_request_schema.json\n",
  );
  process.exit(1);
}

function redactValue(value) {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redactValue(nestedValue),
      ]),
    );
  }

  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/\bBearer\s+[\w.-]+/gi, "Bearer [REDACTED]")
    .replace(/\bToken\s+[\w.-]+/gi, "Token [REDACTED]")
    .replace(/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[JWT]");
}

function sanitizeBodyForLog(body) {
  try {
    return JSON.stringify(redactValue(JSON.parse(body)));
  } catch {
    return redactValue(body);
  }
}

function truncate(value, maxLength = MAX_ERROR_BODY_CHARS) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}... [truncated]` : value;
}

function resolveOutputPath(outputFile) {
  const outputPath = path.resolve(SCHEMA_DIR, outputFile);
  const relative = path.relative(SCHEMA_DIR, outputPath);

  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Output file must stay inside ${SCHEMA_DIR}: ${outputFile}`);
  }

  if (path.extname(outputPath).toLowerCase() !== ".json") {
    throw new Error(`Output file must be a .json file: ${outputFile}`);
  }

  return outputPath;
}

async function main() {
  // ── Parse args ─────────────────────────────────────────────────────────────
  const [, , url, outputFile, unsafeTokenArg] = process.argv;

  if (!url || !outputFile) {
    exitWithUsage();
  }

  if (unsafeTokenArg) {
    console.error(
      "\n[ERROR] Do not pass auth tokens as command arguments. Use PENNY_ACCESS_TOKEN or API_AUTH_TOKEN instead.",
    );
    process.exit(1);
  }

  // ── Validate dependencies and inputs ──────────────────────────────────────
  let createSchema;
  try {
    ({ createSchema } = require("genson-js"));
  } catch {
    console.error("\n[ERROR] genson-js is not installed. Run: npm install");
    process.exit(1);
  }

  const targetUrl = new URL(url);
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    throw new Error(`Only http and https URLs are supported: ${url}`);
  }

  const outputPath = resolveOutputPath(outputFile);
  const timeoutMs = Number(process.env.SCHEMA_REQUEST_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const authToken = process.env.PENNY_ACCESS_TOKEN ?? process.env.API_AUTH_TOKEN;
  const authScheme = process.env.API_AUTH_SCHEME ?? "Bearer";
  const headers = { Accept: "application/json" };

  if (authToken) {
    headers.Authorization =
      authToken.startsWith("Bearer ") || authToken.startsWith("Token ")
        ? authToken
        : `${authScheme} ${authToken}`;
  }

  // ── Fetch the URL ─────────────────────────────────────────────────────────
  console.log(`\nFetching: ${targetUrl.toString()}`);
  if (authToken) {
    console.log("Using auth token from environment");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  let body;
  try {
    response = await fetch(targetUrl, { headers, signal: controller.signal });
    body = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const safeBody = truncate(sanitizeBodyForLog(body));
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${safeBody}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`Response is not valid JSON: ${truncate(body, 200)}`);
  }

  // Generate schema using genson-js.
  const schema = createSchema(parsed);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), "utf-8");

  console.log(`[OK]    Schema generated from HTTP ${response.status} response`);
  console.log(`[OK]    Written to: ${outputPath}`);
  console.log(
    "\nTip: Review the schema and add required fields and tighter constraints as needed.\n",
  );
}

main().catch((err) => {
  const message = err.name === "AbortError" ? "Request timed out" : err.message;
  console.error(`[ERROR] ${message}`);
  process.exit(1);
});
