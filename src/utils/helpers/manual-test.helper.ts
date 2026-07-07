/* eslint-disable no-console */
import { test, type TestInfo } from "@playwright/test";
import { AsyncLocalStorage } from "async_hooks";
import { redactSensitiveData, redactUrl, safeJson } from "../../core/redaction";
import {
  expectedHttpStatusText,
  explainHttpStatus,
  formatHttpStatus,
  getHttpStatusGuide,
  httpStatusFailureHints,
} from "../../core/http-status-guide";

const MANUAL_GUIDE_ATTACHMENT_TYPE = "application/vnd.penny.manual-guide+json";
const MARKDOWN_CONTENT_TYPE = "text/markdown";

export type ManualTestGuide = {
  purpose: string;
  preconditions?: string[];
  expectedResult: string | string[];
  failureHints?: string[];
  testData?: Record<string, unknown>;
  relatedLinks?: string[];
};

export type ManualStepGuide = {
  action: string;
  expected: string;
  failureHints?: string[];
  evidence?: Record<string, unknown>;
};

export type ManualApiCallGuide = {
  method: string;
  url: string;
  expectedStatus?: number;
  actualStatus: number;
  requestBody?: unknown;
  responseBody?: unknown;
};

export type ManualGuideReport = {
  purpose: string;
  preconditions: string[];
  expectedResult: string[];
  failureHints: string[];
  testData?: Record<string, unknown>;
  relatedLinks: string[];
  steps: ManualStepGuide[];
};

type ManualApiCallEvidence = {
  action: string;
  expected: string;
  outcome: "passed" | "failed";
  method: string;
  path: string;
  expectedStatus: string;
  actualStatus: number;
  actualStatusMeaning: string;
  actualStatusExplanation: string;
  testerAction: string;
  responseSummary: string;
  failureHints: string[];
};

const manualGuideStore = new AsyncLocalStorage<ManualTestHelper>();
const manualGuidesByTestId = new Map<string, ManualTestHelper>();

function isManualModeEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes((process.env.MANUAL_TEST_REPORT ?? "").toLowerCase());
}

function list(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function markdownList(items: string[]): string[] {
  return items.length ? items.map((item) => `- ${item}`) : ["- Not specified"];
}

function sanitizeGuide(guide: ManualTestGuide): ManualGuideReport {
  return {
    purpose: guide.purpose,
    preconditions: guide.preconditions ?? [],
    expectedResult: list(guide.expectedResult),
    failureHints: guide.failureHints ?? [],
    testData: guide.testData ? redactSensitiveData(guide.testData) : undefined,
    relatedLinks: guide.relatedLinks ?? [],
    steps: [],
  };
}

function sanitizeStep(step: ManualStepGuide): ManualStepGuide {
  return {
    ...step,
    evidence: step.evidence ? redactSensitiveData(step.evidence) : undefined,
  };
}

function defaultGuide(testInfo: TestInfo): ManualGuideReport {
  return sanitizeGuide({
    purpose: `Verify this API scenario: ${businessTitle(testInfo.title)}.`,
    preconditions: [
      "The selected client and environment are reachable.",
      "Required credentials and test data are configured for this run.",
      "Any record identifiers shown in the report belong to the selected environment.",
    ],
    expectedResult: [
      "Each system interaction returns the expected result for this scenario.",
      "The response evidence does not show an unexpected business or system error.",
    ],
    failureHints: [
      "Read the failed business step first, then open the Request / Response evidence.",
      "If the response is 401, check credentials or sign-in token setup.",
      "If the response is 403, check user role, organisation code, or feature access.",
      "If the response is 404, check whether the referenced record exists in this environment.",
      "If the response is 409, check whether the same data already exists or the workflow state is not ready.",
      "If the response is 500 or higher, check API logs and dependent services.",
    ],
  });
}

function businessTitle(title: string): string {
  return title
    .replace(/^(TC_[A-Z0-9_]+)\s*[—-]\s*/, "")
    .replace(/\s@\w+/g, "")
    .trim()
    .replace(/\.$/, "");
}

function buildApiEvidence(call: ManualApiCallGuide): ManualApiCallEvidence {
  const path = pathFromUrl(call.url);
  const action = `${methodVerb(call.method)} ${humanizePath(path)}`;
  const expected = expectedStatusText(call.expectedStatus);
  const responseSummary = summarizeResponse(call.responseBody);
  const outcome = isExpectedStatus(call.expectedStatus, call.actualStatus) ? "passed" : "failed";
  const failureHints = failureHintsFor(call.expectedStatus, call.actualStatus);

  return {
    action,
    expected,
    outcome,
    method: call.method,
    path: redactUrl(path),
    expectedStatus:
      call.expectedStatus === undefined
        ? "Any successful 2xx response"
        : formatHttpStatus(call.expectedStatus),
    actualStatus: call.actualStatus,
    actualStatusMeaning: formatHttpStatus(call.actualStatus),
    actualStatusExplanation: explainHttpStatus(call.actualStatus),
    testerAction:
      getHttpStatusGuide(call.actualStatus)?.testerAction ??
      "Check API logs, gateway behavior, or network failure details.",
    responseSummary,
    failureHints,
  };
}

function pathFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const query = parsed.search ? parsed.search : "";
    return `${parsed.pathname}${query}`;
  } catch {
    return url;
  }
}

function methodVerb(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "Check";
    case "POST":
      return "Send";
    case "PUT":
    case "PATCH":
      return "Update";
    case "DELETE":
      return "Remove";
    default:
      return "Call";
  }
}

function humanizePath(path: string): string {
  const normalized = path.split("?")[0].toLowerCase();
  const tokens = normalized
    .split(/[/-]/)
    .filter(Boolean)
    .filter((token) => !["api", "v1", "v2", "v3", "integrations"].includes(token));

  if (tokens.includes("health")) return "that the service is ready";
  if (tokens.includes("vendor") && tokens.includes("sync")) return "supplier confirmation";
  if (tokens.includes("vendor")) return "supplier information";
  if (tokens.includes("po") && tokens.includes("sync")) return "purchase order status";
  if (tokens.includes("po")) return "purchase order information";
  if (tokens.includes("pr")) return "purchase request information";
  if (tokens.includes("grn")) return "goods receipt information";
  if (tokens.includes("bill") && tokens.includes("sync")) return "bill confirmation";
  if (tokens.includes("invoice") && tokens.includes("sync")) return "invoice confirmation";
  if (tokens.includes("invoice")) return "invoice information";
  if (tokens.includes("payment")) return "payment confirmation";
  if (tokens.includes("rfqs")) return "RFQ information";
  if (tokens.includes("request") || tokens.includes("requests")) return "request information";
  if (!tokens.length) return "the API scenario";

  return tokens.map((token) => tokenLabel(token)).join(" ");
}

function tokenLabel(token: string): string {
  const labels: Record<string, string> = {
    rfq: "RFQ",
    rfqs: "RFQs",
    pr: "purchase request",
    po: "purchase order",
    grn: "goods receipt",
    sync: "confirmation",
  };
  return labels[token] ?? token.replace(/_/g, " ");
}

function expectedStatusText(expectedStatus?: number): string {
  return expectedHttpStatusText(expectedStatus);
}

function isExpectedStatus(expectedStatus: number | undefined, actualStatus: number): boolean {
  if (expectedStatus !== undefined) return actualStatus === expectedStatus;
  return actualStatus >= 200 && actualStatus < 300;
}

function summarizeResponse(responseBody: unknown): string {
  if (Array.isArray(responseBody)) return `Returned ${responseBody.length} item(s).`;
  if (!responseBody || typeof responseBody !== "object") {
    return responseBody === undefined || responseBody === null
      ? "No response body returned."
      : String(responseBody).slice(0, 200);
  }

  const record = responseBody as Record<string, unknown>;
  const fields = ["message", "error", "status", "statusCode", "operation", "externalId"];
  const details = fields
    .filter((field) => record[field] !== undefined)
    .map((field) => `${field}: ${String(record[field])}`);

  return details.length ? details.join(", ") : "Response body was returned.";
}

function failureHintsFor(expectedStatus: number | undefined, actualStatus: number): string[] {
  if (isExpectedStatus(expectedStatus, actualStatus)) return [];
  return httpStatusFailureHints(expectedStatus, actualStatus);
}

function appendApiEvidence(step: ManualStepGuide, apiCall: ManualApiCallEvidence): void {
  const evidence = step.evidence ?? {};
  const existingCalls = Array.isArray(evidence.apiCalls) ? evidence.apiCalls : [];
  step.evidence = {
    ...evidence,
    apiCalls: [...existingCalls, apiCall],
  };
}

function addUnique(target: string[], items: string[], position: "start" | "end" = "end"): void {
  const next = items.filter((item) => !target.includes(item));
  if (position === "start") {
    target.unshift(...next);
    return;
  }
  target.push(...next);
}

function buildMarkdown(report: ManualGuideReport): string {
  const lines = [
    "# Manual Tester Guide",
    "",
    "## Purpose",
    report.purpose,
    "",
    "## Preconditions",
    ...markdownList(report.preconditions),
    "",
    "## Expected Result",
    ...markdownList(report.expectedResult),
  ];

  if (report.testData) {
    lines.push("", "## Test Data", "```json", safeJson(report.testData), "```");
  }

  if (report.steps.length) {
    lines.push("", "## What Happens During The Test");
    report.steps.forEach((step, index) => {
      lines.push("", `### ${index + 1}. ${step.action}`);
      lines.push(`Expected: ${step.expected}`);
      if (step.failureHints?.length) {
        lines.push("", "If this fails:");
        lines.push(...markdownList(step.failureHints));
      }
      if (step.evidence) {
        lines.push("", "Evidence:", "```json", safeJson(step.evidence), "```");
      }
    });
  }

  if (report.failureHints.length) {
    lines.push("", "## What To Check If It Fails", ...markdownList(report.failureHints));
  }

  if (report.relatedLinks.length) {
    lines.push("", "## Related Links", ...markdownList(report.relatedLinks));
  }

  return `${lines.join("\n")}\n`;
}

export class ManualTestHelper {
  private report: ManualGuideReport | undefined;
  private readonly activeSteps: ManualStepGuide[] = [];

  constructor(private readonly testInfo: TestInfo) {}

  case(guide: ManualTestGuide): void {
    const existingSteps = this.report?.steps ?? [];
    this.report = sanitizeGuide(guide);
    this.report.steps.push(...existingSteps);
  }

  async step<T>(details: ManualStepGuide, action: () => Promise<T> | T): Promise<T> {
    const sanitizedStep = sanitizeStep(details);
    this.ensureReport().steps.push(sanitizedStep);
    this.activeSteps.push(sanitizedStep);

    if (isManualModeEnabled()) {
      console.log(`Manual step: ${sanitizedStep.action}`);
      console.log(`  Expected: ${sanitizedStep.expected}`);
    }

    try {
      return await test.step(sanitizedStep.action, action);
    } finally {
      this.activeSteps.pop();
    }
  }

  recordApiCall(call: ManualApiCallGuide): void {
    const report = this.ensureReport();
    const apiCall = buildApiEvidence(call);
    const activeStep = this.activeSteps[this.activeSteps.length - 1];

    if (activeStep) {
      appendApiEvidence(activeStep, apiCall);
      addUnique(activeStep.failureHints ?? (activeStep.failureHints = []), apiCall.failureHints);
    } else {
      report.steps.push({
        action: apiCall.action,
        expected: apiCall.expected,
        failureHints: apiCall.failureHints,
        evidence: { apiCalls: [apiCall] },
      });
    }

    if (apiCall.outcome === "failed") {
      addUnique(report.failureHints, apiCall.failureHints, "start");
    }
  }

  async evidence(name: string, value: unknown): Promise<void> {
    const body = safeJson(value);
    await this.testInfo.attach(name, {
      body,
      contentType: "application/json",
    });
  }

  async flush(): Promise<void> {
    if (!this.report) return;

    const markdown = buildMarkdown(this.report);
    const json = safeJson(this.report);

    await this.testInfo.attach("Manual tester guide", {
      body: markdown,
      contentType: MARKDOWN_CONTENT_TYPE,
    });

    await this.testInfo.attach("Manual tester guide data", {
      body: json,
      contentType: MANUAL_GUIDE_ATTACHMENT_TYPE,
    });

    // Allure receives Playwright testInfo attachments automatically.
  }

  private ensureReport(): ManualGuideReport {
    if (!this.report) {
      this.report = defaultGuide(this.testInfo);
    }
    return this.report;
  }
}

export async function runWithManualGuide<T>(
  helper: ManualTestHelper,
  action: () => Promise<T>,
): Promise<T> {
  return manualGuideStore.run(helper, action);
}

export function registerManualGuide(testInfo: TestInfo, helper: ManualTestHelper): void {
  manualGuidesByTestId.set(testInfo.testId, helper);
}

export function unregisterManualGuide(testInfo: TestInfo): void {
  manualGuidesByTestId.delete(testInfo.testId);
}

export function currentManualGuide(): ManualTestHelper | undefined {
  try {
    return manualGuidesByTestId.get(test.info().testId) ?? manualGuideStore.getStore();
  } catch {
    return manualGuideStore.getStore();
  }
}

export { MANUAL_GUIDE_ATTACHMENT_TYPE };
