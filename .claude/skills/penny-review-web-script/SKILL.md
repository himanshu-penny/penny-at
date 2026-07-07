---
name: penny-review-web-script
description: Review skill for Penny web Playwright specs and page objects in penny-at. Use when the user asks Claude to review a UI test, page object, fixture, locator strategy, storage state setup, or web workflow spec — for reliability, readability, business value, and framework alignment.
---

# Penny Review Web Script

Review as a senior SDET who owns UI reliability. Lead with reliability risks
(flaky locators, unmanaged waits, missing test isolation), then move to
business value, readability, and framework alignment. Pair with
`/penny-create-standard-code` for baseline standards and `/penny-business` for
domain vocabulary.

## When To Use

- User asks to review a web `.spec.ts` file or a page object.
- User asks to review a proposed UI test before merging.
- User asks whether a scenario should be UI, API, or both.

## Required Inputs

- The spec / page object file (or "review the current diff").
- Client + env if not obvious from the path.
- Any known flakiness history (helpful, not required).

## Repository Review Before Action

If in a git repo:

```bash
git status --short
git diff --name-only
```

Otherwise, review the files the user named. Relevant paths:

- `src/tests/{client}/web/**/*.spec.ts`
- `src/tests/shared/web/**/*.spec.ts`
- `src/pages/web/**/*.ts`
- `src/fixtures/**/*.ts`
- `src/config/auth.setup.web.ts`
- `src/core/constants/routes.ts`
- `src/factories/**/*.ts`
- `playwright.config.ts` (projects, retries, timeouts)

## Required Checks

```bash
npm run validate
```

For a targeted discovery + run when credentials are available:

```bash
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec> --project=smoke --list
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec> --project=smoke
```

Live runs only when the user asks and credentials are on the machine.

## Review Checklist

Report findings with file + line. Group by severity.

### Reliability

- No `waitForTimeout` or arbitrary sleeps.
- No `Promise` chains that dodge Playwright's auto-wait.
- No brittle XPath when role/label/data-test-id is available.
- No selectors tied to CSS classes that look layout-driven.
- Locators live in a `const` object at the top of the page object — never
  inline in methods.
- Tests are isolated — no reliance on order or shared mutable state.
- Fixtures / storage state used instead of inlined logins.

### Business value

- Test title reads as an acceptance criterion, not a click log.
- Assertions verify a business outcome (record created, status changed,
  notification shown), not just "element visible".
- Tags include tier (`@smoke` / `@regression`) and layer (`@ui`).
- No `@mobile`, no `TC_MOB` IDs.
- The scenario belongs on the UI at all — if pure data, delegate to API.

### Page-object design

- Extends `BasePage`.
- Uses `this.action.*` and `this.wait.*`, not raw `this.page.*` in methods.
- Action methods use `@Step` and are named as business verbs.
- Query methods return locators / data — no assertions inside.
- Assertion methods wrap `expect` and use `@Step`.
- Reused instead of duplicated — one page object per page / panel.

### Data + auth

- API-set / UI-assert used when the API can seed prerequisites.
- Cleanup happens in `afterEach` / `afterAll` even on failure, when the
  underlying data would otherwise leak.
- Unique test data via `TestDataFactory` or `vendor.factory` — no reused
  business identifiers.
- No hard-coded users, org codes, URLs, or IDs — everything client/env-driven.
- No plaintext passwords, tokens, or cookies in the spec.

### Framework alignment

- Folder placement matches `/penny-create-standard-code`:
  `src/tests/{client}/web/<domain>/<feature>.spec.ts`.
- Imports use `@fixtures`, `@pages/web/**`, `@utils/**`, `@core/**` aliases.
- No `import` from `../../../..` when an alias exists.

## Output Format

1. **Findings** — highest severity first, each formatted as:
   - **Issue:** what is wrong
   - **Why it matters:** flake risk, business risk, or reader confusion
   - **Recommended fix:** minimal correct change
   - **Example correction:** short code snippet where useful
   - **Priority:** High / Medium / Low
2. **Open questions / assumptions.**
3. **Checks run.**
4. **Framework or skill improvement feedback** — surface anything that would
   benefit `/penny-framework-health-check` follow-up.

If no issues, say so clearly and name residual risk (usually "live UI run not
performed").

## Quality Checklist

- Every finding references a specific file + line.
- Findings are ordered High → Medium → Low.
- Reliability findings include a concrete locator or wait-strategy suggestion.
- Business-value findings quote the actual test title where relevant.
- Recommend delegating to `/penny-create-web-script` for actual code fixes.

## Do Not Do

- Do not review code style that `npm run lint` / Prettier already enforces.
- Do not silently rewrite a spec — findings first; code changes only when the
  user asks or when using `/penny-create-web-script`.
- Do not run headed / debug modes automatically; recommend them when useful.
- Do not attach screenshots or traces containing PII / credentials.
