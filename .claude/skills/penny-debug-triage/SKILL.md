---
name: penny-debug-triage
description: Debug and triage failing Penny automation runs. Use when a spec fails locally or in CI, when a test is intermittently red, when a trace or Allure attachment needs interpreting, when deciding flake vs real bug, or when picking the smallest reproducible command.
---

# Penny Debug & Triage

Turn a red run into an actionable diagnosis. This skill is for _reading failures_,
not for writing tests — for that use `/penny-create-api-script` or
`/penny-create-web-script`.

## When To Use

- A single spec is failing and you need root cause.
- A test is flaky — sometimes red, sometimes green.
- CI is red but local is green (or vice versa).
- You need to interpret a Playwright trace, HAR file, or Allure attachment.
- You need the smallest reproducible command before opening a bug.

## Required Inputs

Ask only if unclear:

- The failing spec file(s) or `--grep` pattern.
- Local, CI, or both — and which env / client.
- Whether the failure is deterministic or intermittent.
- Latest report location (`artifacts/reports/html`, `artifacts/reports/allure`,
  or a CI artifact URL).

## Repository Review Before Action

Before recommending anything, know where evidence lives:

- `artifacts/reports/html/index.html` — Playwright HTML report.
- `artifacts/traces/` — trace zips (if enabled in `playwright.config.ts`).
- `artifacts/reports/allure/` — Allure results / report.
- `artifacts/screenshots/`, `artifacts/videos/` — captured on failure.
- `playwright.config.ts` — retries, timeouts, trace/screenshot policies.
- `src/middleware/retry.middleware.ts` — API retry policy (2xx/3xx are NOT retried).
- `src/core/logger.ts` + `src/core/redaction.ts` — what shows in logs.

## Step-By-Step Workflow

1. **Reproduce first.** Get the smallest command that fails:
   ```bash
   CLIENT=<c> TEST_ENV=<e> npx playwright test <spec> --project=<p> \
     --grep "<TC_ID>" --repeat-each=1
   ```
2. **Confirm scope.** Does it fail every time (`--repeat-each=5`), or only sometimes?
   - Every time → real bug.
   - Sometimes → flake candidate.
3. **Open the trace.** For web: `npx playwright show-trace <path>`. For API: read
   the Allure attachment ("Request / Response" panel — already redacted).
4. **Read the error line by line.**
   - `expected status X, got Y` from `ApiError` → contract mismatch or auth issue.
   - `Timeout ... waiting for locator` → selector drift or missing precondition.
   - `Network error` → env / DNS / VPN.
5. **Bisect.** If a change broke it, `git log --oneline <spec>` and check
   recent framework files (`src/api/support/`, `src/fixtures/`, `src/middleware/`).
6. **Classify.**
   - **Real bug** → file/link to the product team with the reproducer.
   - **Flake** → tag with `test.fixme` + issue link, do not merge silently.
   - **Test bug** → fix in `/penny-create-*-script` skill.
   - **Env bug** → surface via `/penny-setup` or `/penny-ci`.
7. **Prevent recurrence.** If the fix belongs in the framework, escalate to
   `/penny-review-framework-change` or `/penny-framework-health-check`.

## Framework-Specific Signals

- Retry middleware retries 5xx/408/429/network + Penny write-conflict 409, but
  **not** 2xx/3xx status mismatches. A 3× `Retry N/2` log = 5xx or network,
  not "test expected the wrong status".
- Sabil negatives use `.retry(false)`. If a Sabil negative shows retry logs,
  someone removed the guard — treat as a framework regression.
- `parseBody` returns raw text on non-JSON responses (`api-transport.ts`).
  If assertions on `response.data.<field>` throw "cannot read property of
  undefined", the backend likely served HTML/text (WAF or 500 page).
- Auth-setup projects (`auth-setup-web`, `auth-setup-api`) write `.auth/*.json`.
  If they fail, every downstream project skips — always check auth-setup output
  first when the whole suite goes red.

## Common Failures & First Move

| Symptom                              | First move                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Whole project skipped                | Check `auth-setup-*` project output — usually a bad `.env` or expired token.                 |
| `ApiError: expected 200, got 401`    | Token expired / role wrong — re-run `auth-setup-api`.                                        |
| `ApiError: expected 200, got 500`    | Backend error — grab the redacted body from the Allure attachment.                           |
| `Timeout waiting for locator` on web | Trace it (`show-trace`), check the frame + preceding step.                                   |
| Flaky only in CI                     | Compare CI env vars to local `.env` — usually a missing var.                                 |
| "Cannot find module '@X'"            | Path alias — see `/penny-create-standard-code` for the `@types/*` caveat.                    |
| Sabil test skipped                   | `SABIL_BASE_URL` unset — outbound tests skip by design unless `SABIL_REQUIRE_OUTBOUND=true`. |
| Same test passes with `--retries=1`  | Real flake. Do not merge — fix locator or add web-first assertion.                           |

## Output Format

1. **Diagnosis** — one sentence: real bug / test bug / flake / env bug.
2. **Reproducer** — the smallest command that fails.
3. **Evidence** — file paths + line numbers + trace / attachment references.
4. **Root cause hypothesis** — the most likely why.
5. **Fix location** — spec / page object / fixture / framework / env.
6. **Skill hand-off** — which `/penny-*` skill takes it from here.
7. **Prevention note** — what would have caught this earlier (added assertion,
   `--repeat-each` in CI, schema validation, etc.).

## Quality Checklist

- Every diagnosis names a real file + line.
- No "it's flaky" without evidence from at least two runs.
- No fix recommendation without pointing at the specific skill that owns it.
- No suggestion to add `waitForTimeout` or a bare `sleep`.
- No suggestion to increase retries as a first response — retries hide bugs.

## Do Not Do

- Do not open a bug against product code without a reproducer.
- Do not `test.skip` a failing test unless you file a follow-up.
- Do not `--retries=5` locally to make CI look green.
- Do not attach traces / screenshots containing PII or tokens to shared channels
  — the framework redacts Allure, not raw traces.

## Related Skills

- `/penny-setup`, `/playwright-cli` — targeted-run commands.
- `/penny-create-api-script`, `/penny-create-web-script` — for fixes to specs.
- `/penny-review-framework-change` — when the fix is framework-wide.
- `/penny-framework-health-check` — when the failure signals a broader gap.
