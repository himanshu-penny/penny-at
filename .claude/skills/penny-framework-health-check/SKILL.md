---
name: penny-framework-health-check
description: End-to-end audit of the penny-at automation framework. Use when a user asks to review the framework as a whole, spot gaps in fixtures, page objects, API clients, factories, test-data strategy, schema validation, CI/reporting, or skill structure, and produce prioritized improvement findings.
---

# Penny Framework Health Check

Audit the framework the way a lead SDET would before a release. Do not review a
single spec — for that use `/penny-review-api-script` or `/penny-review-web-script`.
This skill zooms out to _architecture, conventions, coverage strategy, tooling,
and skill hygiene_.

## When To Use

- Quarterly / pre-release framework audit.
- New senior joining the team who wants a state-of-the-framework picture.
- After a large PR that touches fixtures, transport, retry, or config.
- Deciding what to invest in next sprint.
- Investigating cross-cutting flakiness or hard-to-maintain areas.

## Required Inputs

Ask only if unclear:

- Scope — full framework, or a specific layer (API, web, tooling, skills)?
- Client(s) in focus — all, or just `sabil` / `ewcf` / `rcmc` / `enterprise`?
- Whether to include prioritized fix suggestions or just a raw findings list.
- Whether live-run validation is allowed (credentials available).

If not stated, default to a full audit with prioritized fixes.

## Repository Review Before Action

Read at minimum:

- `package.json`, `playwright.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
  `.env.example` files under `src/config/clients/**`.
- `src/api/support/` — `RequestHandler`, `api-transport.ts`.
- `src/middleware/retry.middleware.ts` and `src/core/redaction.ts`.
- `src/fixtures/**/*.ts` — base, api, web fixtures.
- `src/pages/web/base.page.ts` — helper split (`action`, `wait`).
- `src/core/constants/urls.ts`, `src/core/constants/routes.ts`.
- `src/factories/**/*.ts` — TestDataFactory + domain factories.
- `test-data/response-schemas/**` — schema coverage.
- `src/tests/{client}/{api,web}/` — layout, tags, `_support/` folders.
- `.claude/skills/**/SKILL.md` — skill overlap / gaps.
- `README.md`, `docs/` — documented conventions.

## Step-By-Step Workflow

1. **Inventory** — list projects, fixtures, factories, page objects, API clients,
   utilities, constants, schemas, skills.
2. **Convention pass** — sample 3–5 files from each layer and check they follow
   `/penny-create-standard-code`.
3. **Coverage pass** — for each client, list which flows have API coverage, web
   coverage, and which have neither.
4. **Reliability pass** — retry policy, redaction, fixture scope, storage state,
   flakiness signals (`waitForTimeout`, brittle XPath, `sleep`).
5. **Security pass** — secret handling in logs, allure attachments, `.env` files
   under version control, cookies/tokens in commit candidates.
6. **Tooling pass** — CI scripts, reporters, `npm run validate`, quality gates.
7. **Skill pass** — every `.claude/skills/*/SKILL.md` must have frontmatter,
   clear purpose, no unnecessary overlap.
8. **Priority pass** — for each finding, assign High/Medium/Low based on release
   risk and reader confusion, and decide "fix now" vs "fix later".

## Framework Standards Reference

`/penny-create-standard-code` is the source of truth for naming, folders,
imports, tags, assertions, and validation gates. Report deviations from it as
findings — do not restate the standard in the finding text.

## Output Format

Deliver findings in this order:

1. **Framework summary** — two or three sentences on the framework as it stands today.
2. **Findings, highest severity first**, each with:
   - **Issue:** what is wrong
   - **Impact:** what it costs (release risk, wasted debug time, flakiness)
   - **Recommended fix:** the smallest change that closes the gap
   - **Files affected:** paths + line numbers
   - **Should fix now or later:** now / next sprint / later
   - **Priority:** High / Medium / Low
3. **Coverage matrix** — client × layer × business flow.
4. **Skill hygiene** — one-line note on any `.claude/skills` overlap, missing
   frontmatter, or missing cross-reference.
5. **Checks run** — commands executed (`npm run validate`, `--list`, etc.).
6. **Assumptions / blockers** — anything not verified (usually live runs).

## Quality Checklist

- Every finding names a real file and, where useful, a real line number.
- Every finding is actionable — no vague "code is inconsistent" without a fix.
- High-priority findings are release-risk-shaped (correctness, security,
  flakiness at scale, data safety).
- Medium and Low findings do not dominate the report; keep them under 10.
- The coverage matrix uses the same client names the framework uses (`ewcf`,
  `rcmc`, `enterprise`, `sabil`).
- The skill hygiene section names the file it is talking about.

## Do Not Do

- Do not restate `/penny-create-standard-code` — reference it instead.
- Do not review a single spec here; delegate to the API / web review skills.
- Do not delete or modify files unless the user explicitly asks; findings only.
- Do not make live API calls unless credentials are confirmed and needed for a
  specific finding.
- Do not surface findings that duplicate what `npm run validate` already catches
  (typecheck, lint) unless the tool is misconfigured.
