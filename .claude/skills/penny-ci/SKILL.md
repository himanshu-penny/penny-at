---
name: penny-ci
description: CI integration guide for penny-at Playwright automation. Use when configuring a CI pipeline for these tests, choosing reporters, wiring env variables and secrets, publishing artifacts, deciding which projects run on which triggers, or diagnosing why CI is red while local is green.
---

# Penny CI

Wire `penny-at` into a CI pipeline (GitHub Actions, GitLab CI, Jenkins, etc.).
This skill only covers the CI side — for local runs use `/penny-setup`, for the
CLI itself use `/playwright-cli`, and for reading failures use
`/penny-debug-triage`.

## When To Use

- Adding these tests to a new CI pipeline.
- Debugging a "green locally, red in CI" failure.
- Choosing which projects run on PR vs merge vs nightly.
- Deciding what artifacts to upload (HTML, Allure, traces, JUnit).
- Managing secrets and credential files in CI.

## Required Inputs

- **CI system** — GitHub Actions, GitLab, Jenkins, CircleCI, Buildkite.
- **Trigger scope** — PR-only, merge-to-main, nightly, on-demand.
- **Which projects** — `api-testing`, `smoke` (web), auth-setup, or all.
- **Which clients / envs** — matrix or single.
- **Secret storage** — CI-native (recommended) or an env-file store.
- **Artifact retention policy** — how long HTML / Allure / trace bundles are kept.

## Repository Review Before Action

- `package.json` — the `scripts` block, especially `test:ci`, `test:api:allure`,
  `test:web:allure`, and `report:allure:*`.
- `playwright.config.ts` — projects, retries, timeouts, reporter list, trace
  policy.
- `.gitignore` — confirm `artifacts/**` is ignored (it is).
- `src/config/clients/**/*.env.example` — the shape of the secrets you'll need
  in CI.
- `scripts/setup.sh`, `scripts/strip-ansi-allure.js` — pre-run hooks.

## Step-By-Step Workflow

1. **Install phase.**
   ```bash
   npm ci
   npx playwright install --with-deps
   ```
2. **Env / secret injection.** Write `.env` files at CI runtime from CI-managed
   secrets. Never commit them.
   ```bash
   mkdir -p src/config/clients/$CLIENT
   printf "%s" "$CLIENT_ENV_FILE" > src/config/clients/$CLIENT/$TEST_ENV.env
   ```
   `CLIENT_ENV_FILE` is a CI secret containing the multi-line env contents.
3. **Quality gate first.** Fail fast on typecheck/lint before spending minutes
   on a browser suite:
   ```bash
   npm run validate
   ```
4. **Run the right project.**
   ```bash
   CLIENT=$CLIENT TEST_ENV=$TEST_ENV npm run test:ci   # all projects
   CLIENT=$CLIENT TEST_ENV=$TEST_ENV npm run test:api  # api-testing only
   CLIENT=$CLIENT TEST_ENV=$TEST_ENV npm run test:web  # smoke only
   ```
   Use `--grep @smoke` on PR runs; `--grep @regression` on nightly.
5. **Publish artifacts.**
   - `artifacts/reports/html/**` — Playwright HTML report.
   - `artifacts/reports/allure-results/**` — Allure raw results (feed a shared
     Allure server or generate on the runner via `npm run report:allure:generate`).
   - `artifacts/traces/**`, `artifacts/screenshots/**`, `artifacts/videos/**` —
     failure-only, useful for triage.
6. **Retain traces for `--repeat-each`-flake investigations.** Keep at least
   7 days.

## Framework Standards

### Project / Trigger Matrix

| Trigger       | Projects               | Grep           | Client / Env                             |
| ------------- | ---------------------- | -------------- | ---------------------------------------- |
| PR            | `api-testing`, `smoke` | `@smoke`       | one representative (e.g., `ewcf` / `fb`) |
| Merge to main | `api-testing`, `smoke` | none           | full matrix                              |
| Nightly       | all                    | `@regression`  | full matrix                              |
| On-demand     | user-specified         | user-specified | user-specified                           |

### Reporter Choices

- **HTML** — always enabled via `playwright.config.ts`; upload as an artifact.
- **Allure** — enable via `ALLURE_RUNTIME_METADATA=true` on the run command; use
  `npm run test:api:allure` / `npm run test:web:allure`.
- **JUnit / JSON** — enabled through `test:ci`. Feed into CI test-report widgets.

### Secrets Handling

- Store `*.env` file contents as CI secrets (multi-line) — one secret per
  client/env.
- Never `echo` a secret. Never `printenv` in a script that publishes logs.
- Do not commit any file under `src/config/clients/**/*.env`.
- Do not export tokens or cookies into `env:` blocks that show in CI logs;
  write them to a masked env file instead.

### Sabil-Specific

- Provide `SABIL_ORG_CODE` and `SABIL_PENNY_BASE_URL` as CI secrets.
- Provide `SABIL_BASE_URL` only when the outbound test env is reachable from CI.
- If outbound coverage is mandatory for the run, set `SABIL_REQUIRE_OUTBOUND=true`
  so missing outbound config _fails_ instead of skipping.

## Output Format

1. **Understanding** — pipeline stage + trigger + scope.
2. **Files reviewed** — `package.json`, `playwright.config.ts`, existing CI YAML
   if present.
3. **Framework pattern found** — the `test:ci` / `test:*:allure` scripts, the
   `artifacts/` layout.
4. **Proposed pipeline** — YAML / config snippet + artifact upload lines.
5. **Files to create or update** — CI config + `.gitignore` if needed.
6. **Test data setup** — how secrets flow in.
7. **Cleanup strategy** — `artifacts/` cleanup, retention.
8. **Commands to run** — install → validate → test → publish.
9. **Self-review checklist** — below.
10. **Risks / assumptions** — flaky infra, missing secrets, retention cost.
11. **Framework feedback** — surface missing CI hooks or misaligned scripts.

## Quality Checklist

- CI installs via `npm ci`, not `npm install`.
- `npx playwright install --with-deps` runs on the same runner.
- `npm run validate` gates the run.
- No `.env` file committed; secrets flow via CI-native secret store.
- Artifacts uploaded even on failure (`if: always()` or equivalent).
- `--repeat-each` / `--retries` set intentionally, not to hide flake.
- Distinct trigger → project matrix documented in the CI config.
- Sabil credentials only enabled on the pipelines that need them.

## Do Not Do

- Do not commit any `*.env`, `.auth/`, or trace bundle to source control.
- Do not `echo` secrets into the CI log.
- Do not use `--retries=5` at the CI level to hide flake — retries mask bugs.
- Do not disable `strip-ansi-allure.js` — Allure will render color-code garbage.
- Do not publish traces / screenshots containing PII to public artifact stores
  without a redaction pass.

## Related Skills

- `/penny-setup` — local install/env parity check.
- `/playwright-cli` — the CLI flags CI runs.
- `/penny-debug-triage` — read the CI failure output.
- `/penny-review-framework-change` — when the CI change touches shared
  fixtures / transport.
- `/penny-framework-health-check` — audit CI drift across pipelines.
