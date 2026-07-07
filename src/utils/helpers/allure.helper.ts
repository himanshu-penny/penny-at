import { Severity } from "allure-js-commons";

export function mapSeverity(tags: string[]): string {
  if (tags.includes("@critical")) return Severity.CRITICAL;
  if (tags.includes("@smoke")) return Severity.NORMAL;
  if (tags.includes("@regression")) return Severity.NORMAL;
  return Severity.MINOR;
}

export function mapLayer(tags: string[]): string {
  if (tags.includes("@api")) return "api";
  return "web";
}

export function mapFeature(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const name = normalizedPath.split("/").pop() ?? "";
  if (normalizedPath.includes("/sabil/api/integrations/negative")) {
    return "Sabil Integration Safeguards";
  }
  if (normalizedPath.includes("/sabil/api/integrations/full-cycle")) return "Sabil Full Cycle";
  if (normalizedPath.includes("/sabil/api/integrations/")) return "Sabil Integration";
  if (normalizedPath.includes("/sabil/web/")) return "Sabil Vendor Registration";
  if (normalizedPath.includes("/ewcf/web/")) return "EWCF Vendor Registration";
  if (normalizedPath.includes("/framework/api/")) return "Framework API Reporting";
  if (name.includes("penny-login")) return "Login";
  if (name.includes("pr23512")) return "Requests — Faceted Filters";
  if (name.includes("auth")) return "Authentication";
  if (name.includes("login")) return "Login";
  if (name.includes("register")) return "Registration";
  if (name.includes("request")) return "Requests";
  if (name.includes("filter")) return "Filters";
  return "General";
}

export function mapParentSuite(tags: string[]): string {
  if (tags.includes("@api")) return "API";
  return "Web";
}

export function mapSubSuite(tags: string[]): string {
  if (tags.includes("@smoke")) return "Smoke";
  if (tags.includes("@regression")) return "Regression";
  return "Other";
}

/**
 * Extracts the TC ID from the test title.
 * e.g. "TC_WEB_PENNY_LOGIN_001 — some description" → "TC_WEB_PENNY_LOGIN_001"
 */
export function extractTestCaseId(title: string): string | null {
  const match = title.match(/^(TC_[A-Z0-9_]+)/);
  return match ? match[1] : null;
}

/**
 * Extracts a PR number from a file path or describe block name.
 * e.g. "penny-pr23512-..." → "23512"
 */
export function extractPrNumber(text: string): string | null {
  const match = text.match(/pr(\d+)/i);
  return match ? match[1] : null;
}

export function cleanStoryName(titlePath: string[]): string {
  const last = titlePath[titlePath.length - 1] ?? "";
  return last
    .replace(/\s@\w+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function cleanDescribeName(titlePath: string[]): string {
  const idx = titlePath.length >= 2 ? titlePath.length - 2 : 0;
  const raw = titlePath[idx] ?? "";
  return raw
    .replace(/\s@\w+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
