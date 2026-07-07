/* eslint-disable no-console */
import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import {
  MANUAL_GUIDE_ATTACHMENT_TYPE,
  type ManualGuideReport,
} from "../utils/helpers/manual-test.helper";

interface TestResultSummary {
  id: string;
  title: string;
  project: string;
  file: string;
  status: string;
  duration: number;
  retries: number;
  tags: string[];
  errors?: string[];
  screenshots?: string[];
  attachments?: { name: string; path?: string; contentType: string }[];
  manualGuide?: ManualGuideReport;
}

const STATUS_ICON: Record<string, string> = {
  passed: "✅",
  failed: "❌",
  skipped: "⏭️",
  timedOut: "⏱️",
  interrupted: "⚠️",
};

const STATUS_COLOR: Record<string, (s: string) => string> = {
  passed: chalk.green,
  failed: chalk.red,
  skipped: chalk.yellow,
  timedOut: chalk.red,
  interrupted: chalk.yellow,
};

function pad(s: string, width: number): string {
  const clean = s.replace(/\x1b\[[0-9;]*m/g, "");
  return clean.length >= width ? s : s + " ".repeat(width - clean.length);
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function extractTcId(title: string): string {
  const m = title.match(/^(TC_[A-Z0-9_]+)/);
  return m ? m[1] : "";
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 120);
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function isInternalAllureMetadataAttachment(
  attachment: TestResult["attachments"][number],
): boolean {
  return (
    attachment.name.startsWith("Allure Metadata") ||
    attachment.contentType === "application/vnd.allure.metadata+json" ||
    attachment.contentType === MANUAL_GUIDE_ATTACHMENT_TYPE
  );
}

function isManualGuideReport(value: unknown): value is ManualGuideReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Partial<ManualGuideReport>;
  return (
    typeof report.purpose === "string" &&
    Array.isArray(report.preconditions) &&
    Array.isArray(report.expectedResult) &&
    Array.isArray(report.failureHints) &&
    Array.isArray(report.relatedLinks) &&
    Array.isArray(report.steps)
  );
}

function extractManualGuide(attachments: TestResult["attachments"]): ManualGuideReport | undefined {
  for (const item of attachments) {
    if (item.contentType !== MANUAL_GUIDE_ATTACHMENT_TYPE || !item.body) continue;

    try {
      const parsed: unknown = JSON.parse(item.body.toString("utf-8"));
      if (isManualGuideReport(parsed)) return parsed;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Custom Reporter — colored console output + JSON + Markdown artefacts.
 *
 * Outputs:
 *   artifacts/reports/meta/summary.json   — full run summary
 *   artifacts/reports/meta/summary.md     — shareable markdown for PRs / Slack
 *   artifacts/reports/meta/<test>.json    — per-test details
 */
export default class CustomReporter implements Reporter {
  private readonly outDir = path.join(process.cwd(), "artifacts", "reports", "meta");
  private results: TestResultSummary[] = [];
  private startTime = Date.now();

  onBegin(_config: FullConfig): void {
    fs.mkdirSync(this.outDir, { recursive: true });
    this.startTime = Date.now();
    const env = (process.env.TEST_ENV ?? "dev").toUpperCase();
    console.log(
      chalk.cyan(`
┌─────────────────────────────────────────────────────────┐
│         🪙  PENNY — Playwright Test Suite               │
│         Environment : ${pad(chalk.bold(env), 33)}│
│         Started     : ${pad(new Date().toLocaleTimeString(), 33)}│
└─────────────────────────────────────────────────────────┘`),
    );
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const errors = result.errors?.map((e) => stripAnsi(e.message ?? String(e)).slice(0, 500)) ?? [];

    const screenshots =
      result.attachments
        ?.filter((a) => a.contentType === "image/png" && a.path)
        .map((a) => a.path!) ?? [];

    const attachments =
      result.attachments
        ?.filter((a) => !isInternalAllureMetadataAttachment(a))
        .map((a) => ({
          name: a.name,
          path: a.path,
          contentType: a.contentType,
        })) ?? [];
    const manualGuide = extractManualGuide(result.attachments);

    const title = test.titlePath().slice(1).join(" › ");
    const tcId = extractTcId(test.title);

    const summary: TestResultSummary = {
      id: tcId || test.id,
      title,
      project: test.parent.project()?.name ?? "unknown",
      file: path.relative(process.cwd(), test.location.file),
      status: result.status,
      duration: result.duration,
      retries: result.retry,
      tags: test.tags,
      errors: errors.length ? errors : undefined,
      screenshots: screenshots.length ? screenshots : undefined,
      attachments: attachments.length ? attachments : undefined,
      manualGuide,
    };

    this.results.push(summary);

    // Write per-test JSON
    const fileName = safeName(test.titlePath().join("_"));
    fs.writeFileSync(
      path.join(this.outDir, `${fileName}.json`),
      JSON.stringify(summary, null, 2),
      "utf-8",
    );

    // Console line
    const icon = STATUS_ICON[result.status] ?? "⚠️";
    const colorFn = STATUS_COLOR[result.status] ?? chalk.white;
    const duration = formatMs(result.duration);
    const label = tcId ? colorFn(`[${tcId}]`) : "";
    const retryTag = result.retry > 0 ? chalk.yellow(` (retry ${result.retry})`) : "";
    const proj = chalk.dim(summary.project);
    console.log(`  ${icon} ${pad(label, 39)} ${chalk.dim(pad(duration, 6))}  ${proj}${retryTag}`);

    // Inline error snippet for failures
    if (result.status === "failed" && errors.length) {
      const snippet = errors[0].split("\n").slice(0, 3).join(" | ");
      console.log(chalk.red(`       └─ ${snippet.slice(0, 120)}`));
      if (manualGuide?.failureHints[0]) {
        console.log(chalk.dim(`       Next check: ${manualGuide.failureHints[0]}`));
      }
    }

    // Screenshot path for failed web tests
    if (result.status === "failed" && screenshots.length) {
      console.log(chalk.dim(`       📸 ${screenshots[0]}`));
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const duration = Date.now() - this.startTime;
    const env = process.env.TEST_ENV ?? "dev";

    const byStatus = {
      passed: this.results.filter((r) => r.status === "passed"),
      failed: this.results.filter((r) => r.status === "failed"),
      skipped: this.results.filter((r) => r.status === "skipped"),
      timedOut: this.results.filter((r) => r.status === "timedOut"),
    };

    // Per-project breakdown
    const byProject: Record<
      string,
      { passed: number; failed: number; skipped: number; duration: number }
    > = {};
    for (const r of this.results) {
      if (!byProject[r.project])
        byProject[r.project] = { passed: 0, failed: 0, skipped: 0, duration: 0 };
      if (r.status === "passed") byProject[r.project].passed++;
      else if (r.status === "failed") byProject[r.project].failed++;
      else if (r.status === "skipped") byProject[r.project].skipped++;
      byProject[r.project].duration += r.duration;
    }

    const total = this.results.length;
    const passRate = total > 0 ? ((byStatus.passed.length / total) * 100).toFixed(1) : "N/A";
    const overallOk = result.status === "passed";

    // Slowest 3 passed tests
    const slowest = [...byStatus.passed].sort((a, b) => b.duration - a.duration).slice(0, 3);

    // ── Console summary ─────────────────────────────────────────────────────────
    const statusStr = overallOk ? chalk.green("✅  PASSED") : chalk.red("❌  FAILED");

    console.log(
      chalk.cyan(`
┌─────────────────────────────────────────────────────────┐
│                   📊  TEST RUN SUMMARY                  │
├─────────────────────────────────────────────────────────┤`) +
        `
${chalk.cyan("│")}  Status      : ${pad(statusStr, 41)}${chalk.cyan("│")}
${chalk.cyan("│")}  Duration    : ${pad(chalk.white(formatMs(duration)), 41)}${chalk.cyan("│")}
${chalk.cyan("│")}  Environment : ${pad(chalk.white(env.toUpperCase()), 41)}${chalk.cyan("│")}` +
        chalk.cyan(`
├──────────────────┬──────────┬──────────┬────────────────┤
│  Project         │  Passed  │  Failed  │  Skipped       │
├──────────────────┼──────────┼──────────┼────────────────┤`),
    );

    for (const [proj, counts] of Object.entries(byProject)) {
      const p =
        counts.failed > 0
          ? chalk.red(pad(String(counts.passed), 8))
          : chalk.green(pad(String(counts.passed), 8));
      const f =
        counts.failed > 0
          ? chalk.red(pad(String(counts.failed), 8))
          : pad(String(counts.failed), 8);
      const s =
        counts.skipped > 0
          ? chalk.yellow(pad(String(counts.skipped), 14))
          : pad(String(counts.skipped), 14);
      console.log(
        `${chalk.cyan("│")}  ${pad(proj, 16)}${chalk.cyan("│")}  ${p}${chalk.cyan("│")}  ${f}${chalk.cyan("│")}  ${s}${chalk.cyan("│")}`,
      );
    }

    console.log(chalk.cyan("├──────────────────┼──────────┼──────────┼────────────────┤"));
    const tp = chalk.green(pad(String(byStatus.passed.length), 8));
    const tf =
      byStatus.failed.length > 0
        ? chalk.red(pad(String(byStatus.failed.length), 8))
        : pad(String(byStatus.failed.length), 8);
    const ts =
      byStatus.skipped.length > 0
        ? chalk.yellow(pad(String(byStatus.skipped.length), 14))
        : pad(String(byStatus.skipped.length), 14);
    console.log(
      `${chalk.cyan("│")}  ${chalk.bold(pad("TOTAL", 16))}${chalk.cyan("│")}  ${tp}${chalk.cyan("│")}  ${tf}${chalk.cyan("│")}  ${ts}${chalk.cyan("│")}`,
    );
    console.log(chalk.cyan("└──────────────────┴──────────┴──────────┴────────────────┘"));

    const rateColor =
      Number(passRate) >= 90 ? chalk.green : Number(passRate) >= 70 ? chalk.yellow : chalk.red;
    console.log(
      `\n  Pass Rate : ${rateColor(`${passRate}%`)}  ${chalk.dim(`(${byStatus.passed.length}/${total})`)}`,
    );

    if (byStatus.failed.length) {
      console.log(chalk.red(`\n  ❌ FAILURES (${byStatus.failed.length}):`));
      for (const r of byStatus.failed) {
        console.log(chalk.red(`     • ${r.id || r.title}`));
        if (r.errors?.[0]) {
          console.log(chalk.dim(`       └─ ${r.errors[0].split("\n")[0].slice(0, 100)}`));
        }
        if (r.screenshots?.[0]) {
          console.log(chalk.dim(`       📸 ${r.screenshots[0]}`));
        }
      }
    }

    if (byStatus.skipped.length) {
      console.log(chalk.yellow(`\n  ⏭️  SKIPPED (${byStatus.skipped.length}):`));
      for (const r of byStatus.skipped) {
        console.log(chalk.yellow(`     • ${r.id || r.title}`));
      }
    }

    if (slowest.length) {
      console.log(chalk.dim(`\n  🐢 Slowest Tests:`));
      for (const r of slowest) {
        console.log(chalk.dim(`     ${formatMs(r.duration).padStart(6)}  ${r.id || r.title}`));
      }
    }

    console.log("");

    // ── Write JSON summary ──────────────────────────────────────────────────────
    const jsonSummary = {
      status: result.status,
      startTime: new Date(this.startTime).toISOString(),
      duration,
      environment: env,
      totals: {
        total,
        passed: byStatus.passed.length,
        failed: byStatus.failed.length,
        skipped: byStatus.skipped.length,
        timedOut: byStatus.timedOut.length,
      },
      passRate: `${passRate}%`,
      byProject,
      failures: byStatus.failed.map((r) => ({
        id: r.id,
        title: r.title,
        project: r.project,
        error: r.errors?.[0]?.split("\n")[0] ?? "",
        screenshot: r.screenshots?.[0],
        nextChecks: r.manualGuide?.failureHints ?? [],
      })),
      results: this.results,
    };

    fs.writeFileSync(
      path.join(this.outDir, "summary.json"),
      JSON.stringify(jsonSummary, null, 2),
      "utf-8",
    );

    // ── Write Markdown summary ──────────────────────────────────────────────────
    const md = this.buildMarkdown(
      jsonSummary,
      byProject,
      byStatus,
      slowest,
      duration,
      passRate,
      env,
    );
    fs.writeFileSync(path.join(this.outDir, "summary.md"), md, "utf-8");
  }

  private buildMarkdown(
    summary: {
      status: string;
      startTime: string;
      totals: { total: number; passed: number; failed: number; skipped: number; timedOut: number };
    },
    byProject: Record<
      string,
      { passed: number; failed: number; skipped: number; duration: number }
    >,
    byStatus: {
      passed: TestResultSummary[];
      failed: TestResultSummary[];
      skipped: TestResultSummary[];
      timedOut: TestResultSummary[];
    },
    slowest: TestResultSummary[],
    duration: number,
    passRate: string,
    env: string,
  ): string {
    const statusBadge =
      summary.status === "passed"
        ? "![passed](https://img.shields.io/badge/status-PASSED-brightgreen)"
        : "![failed](https://img.shields.io/badge/status-FAILED-red)";

    const lines: string[] = [
      `## 🪙 Penny — Test Run Report`,
      ``,
      `${statusBadge}`,
      ``,
      `| | |`,
      `|---|---|`,
      `| **Status** | ${summary.status === "passed" ? "✅ PASSED" : "❌ FAILED"} |`,
      `| **Environment** | \`${env.toUpperCase()}\` |`,
      `| **Duration** | ${formatMs(duration)} |`,
      `| **Date** | ${new Date(this.startTime).toUTCString()} |`,
      `| **Pass Rate** | **${passRate}%** (${byStatus.passed.length}/${summary.totals.total}) |`,
      ``,
      `### Results by Project`,
      ``,
      `| Project | ✅ Passed | ❌ Failed | ⏭️ Skipped | Duration |`,
      `|---|---|---|---|---|`,
    ];

    for (const [proj, counts] of Object.entries(byProject)) {
      lines.push(
        `| \`${proj}\` | ${counts.passed} | ${counts.failed} | ${counts.skipped} | ${formatMs(counts.duration)} |`,
      );
    }

    lines.push(
      `| **Total** | **${byStatus.passed.length}** | **${byStatus.failed.length}** | **${byStatus.skipped.length}** | **${formatMs(duration)}** |`,
    );

    if (byStatus.failed.length) {
      lines.push(``, `### ❌ Failures`, ``);
      for (const r of byStatus.failed) {
        lines.push(`**${r.id || r.title}**`);
        if (r.errors?.[0]) {
          lines.push(`\`\`\``);
          lines.push(r.errors[0].split("\n").slice(0, 5).join("\n"));
          lines.push(`\`\`\``);
        }
        if (r.manualGuide?.failureHints.length) {
          lines.push(`What to check next:`);
          for (const hint of r.manualGuide.failureHints) {
            lines.push(`- ${hint}`);
          }
        }
        lines.push(``);
      }
    }

    if (byStatus.skipped.length) {
      lines.push(`### ⏭️ Skipped (${byStatus.skipped.length})`, ``);
      for (const r of byStatus.skipped) {
        lines.push(`- \`${r.id || r.title}\``);
      }
      lines.push(``);
    }

    if (slowest.length) {
      lines.push(`### 🐢 Slowest Tests`, ``);
      for (const r of slowest) {
        lines.push(`- \`${formatMs(r.duration)}\` — \`${r.id || r.title}\` (\`${r.project}\`)`);
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(`*Generated by [Penny Playwright Framework](https://github.com/penny-co/penny-at)*`);

    return lines.join("\n");
  }
}
