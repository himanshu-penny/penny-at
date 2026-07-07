---
name: penny-review-framework-change
description: Review a change to the penny-at framework core — fixtures, API transport, retry middleware, redaction, page-object base, config, or constants — that affects every client. Use when a PR modifies files outside src/tests, when a change lands in src/api/**, src/fixtures/**, src/middleware/**, src/core/**, src/pages/web/base.page.ts, playwright.config.ts, or tsconfig.json.
---

# Penny Review Framework Change

Review as a lead SDET who owns cross-cutting reliability. A framework change
touches every client, every spec, every CI pipeline — the bar is higher than a
single-spec review. For spec-only reviews, use `/penny-review-api-script` or
`/penny-review-web-script`. For architecture-wide audits, use
`/penny-framework-health-check`.

## When To Use

- PR touches `src/api/**`, `src/fixtures/**`, `src/middleware/**`,
  `src/core/**`, `src/pages/web/base.page.ts`, `playwright.config.ts`, or
  `tsconfig.json`.
- Change modifies retry, redaction, auth, storage state, or path aliases.
- Change adds or removes an npm script that specs / CI depend on.
- Change touches `src/api/support/api-transport.ts` — always high-blast-radius.

## Do Not Use For

- Spec-only changes → `/penny-review-api-script`, `/penny-review-web-script`.
- Utility scripts under `scripts/` → `/penny-create-utility-script` review path.
- Business knowledge under `.claude/skills/penny-business/knowledge/` →
  `/penny-knowledge-audit`.

## Required Inputs

- The diff (or "review the current diff").
- Which client(s) exercise the changed code most heavily.
- Any live-run evidence already gathered.
- The originating problem (bug, review finding, upstream request) — knowing
  _why_ the change exists prevents overreach reviews.

## Repository Review Before Action

```bash
git status --short
git diff --name-only
git diff <base>..HEAD -- src/api src/fixtures src/middleware src/core src/pages/web/base.page.ts playwright.config.ts tsconfig.json
```

Read the current implementation of every touched file before reviewing the
diff — reviewers who read only the patch miss context.

Also check the "blast radius" — which specs consume the changed file:

```bash
rg "<changed-symbol>" src/tests
```

## Step-By-Step Workflow

1. **Root cause fit.** Does the change match the problem it claims to solve, or
   is it a broader refactor riding along? Flag scope creep.
2. **Cross-client impact.** Grep for consumers. If the change alters behavior
   any consumer depends on, list them.
3. **Retry / auth / redaction invariants.** Check the four rules below.
4. **Type safety.** No new `any`; new fixtures typed on both `ApiFixtures` and
   `WorkerFixtures` as needed.
5. **Backwards compatibility.** If a fixture / helper is renamed, are existing
   specs updated in the same PR?
6. **Config / alias changes.** Verify `tsconfig.json` paths are consistent with
   `CLAUDE.md` and don't collide with reserved namespaces (e.g., `@types/*`).
7. **Discovery.**
   ```bash
   npm run validate
   CLIENT=<c> TEST_ENV=<e> npm run test:api:list
   CLIENT=<c> TEST_ENV=<e> npx playwright test --project=smoke --list
   ```
   Both must pass and test counts must match expectations.
8. **Blast-radius validation.** For a change to `retry.middleware.ts`,
   `api-transport.ts`, or `redaction.ts`, run at least one live API spec if
   credentials are available (e.g., `TC_API_SABIL_NEG_005` for transport /
   retry proofing).

## The Four Framework Invariants

Report a violation as HIGH regardless of severity elsewhere.

**I1 — Retry is safe on writes.** Retries must not re-issue writes whose
observed response is 2xx/3xx (would duplicate side effects). Current policy in
`src/middleware/retry.middleware.ts`.

**I2 — Redaction is transitive.** Any new code that logs or attaches request /
response data must route through `src/core/redaction.ts` (`redactUrl`,
`redactHeaders`, `redactSensitiveData`, `safeJson`). No new `console.log(body)`
or `attach(rawResponse)`.

**I3 — Auth is per-call.** `BaseApiClient` and `RequestHandler` accept `token`
per call. No new code that mutates shared auth headers on the fixture.

**I4 — `RequestHandler.reset()` is complete.** Any new stateful field on
`RequestHandler` must be reset between calls, or the state must be explicitly
sticky (like `_baseUrl` today) with a matching comment and a snapshot on
construction.

## Output Format

1. **Change summary** — one sentence: what the diff does and why.
2. **Blast radius** — files, specs, clients, or CI paths affected.
3. **Findings** — highest severity first:
   - **Issue:** what is wrong
   - **Why it matters:** cross-cutting impact (which specs / clients break)
   - **Recommended fix:** minimal correct change
   - **Files affected:** paths + lines
   - **Invariant violated:** I1 / I2 / I3 / I4 / N/A
   - **Priority:** High / Medium / Low
4. **Invariant table** — one row per invariant, "held" / "violated" / "N/A".
5. **Backwards compatibility** — list every renamed/removed symbol + its updated
   consumers.
6. **Checks run** — `npm run validate`, `--list`, and any live runs.
7. **Assumptions / blockers** — usually "live run not performed on X".

## Quality Checklist

- Every finding names the file and the line.
- Each of the four invariants is explicitly evaluated in the invariant table
  (not just "looks fine").
- Blast radius names actual specs, not "many tests".
- No finding under HIGH that isn't backed by a specific consumer that breaks.
- Recommend delegating spec-level cleanup to the matching create/review skill.

## Do Not Do

- Do not silently rewrite framework code. Findings first; code changes only via
  the matching creator skill (`/penny-create-api-client` etc.).
- Do not review style that lint / Prettier catches.
- Do not accept "we'll fix it later" for an invariant violation — either fix in
  this PR or block the merge.
- Do not run live tests that mutate remote Penny data without user approval.

## Related Skills

- `/penny-review-api-script`, `/penny-review-web-script` — spec-level review.
- `/penny-framework-health-check` — repo-wide audit.
- `/penny-create-api-client` — for restructuring proposals from the review.
- `/penny-debug-triage` — for reproducers of framework-level regressions.
- `/penny-ci` — for CI-side follow-ups after a framework change.
