---
name: penny-create-standard-code
description: End-to-end creation standard for penny-at TypeScript/Playwright code. Use when creating or improving API specs, web specs, page objects, fixtures, helpers, data readers, utility functions, constants, schemas, or any TypeScript file so naming, structure, descriptions, imports, tags, assertions, and validation follow the Penny framework standards.
---

# Penny Create Standard Code

Use this skill before creating or heavily editing any `penny-at` TypeScript test
or framework file. Prefer the current repo patterns over outside repositories.

## Non-Negotiables

- Keep changes local to `penny-at`.
- Use `import { test, expect } from "@fixtures";` in specs.
- Do not create old tier folders like `src/tests/api/<tier>`.
- Do not use mobile folders, `@mobile`, or `TC_MOB`.
- Valid standalone clients: `ewcf`, `rcmc`, `enterprise`, `sabil`.
- Treat `srmg` and `voltalia` as enterprise subfolders only.
- Do not commit or print `.env`, `.auth`, tokens, cookies, passwords, or raw auth responses.
- Do not use `any`; use focused local types or shared types.
- Keep text user-friendly and business-readable.

## Path Alias Caveats

The `tsconfig.json` `paths` block ships these aliases:
`@fixtures`, `@pages/*`, `@utils/*`, `@config/*`, `@core/*`, `@api/*`,
`@factories/*`, `@types/*`, `@test-data/*`.

**`@types/*` collides with TypeScript's `.d.ts` scope.** Using
`import type { X } from "@types/interfaces"` triggers TS6137
("Cannot import type declaration files"). Until the alias is renamed (e.g., to
`@interfaces/*`), import from the concrete file path:

```typescript
// Broken (do not use):
import type { EnvironmentConfig } from "@types/interfaces";

// Correct — use the concrete module path:
import type { EnvironmentConfig } from "../../../../types/interfaces/config.interface";
```

Every other alias resolves normally. If you're editing `tsconfig.json`, prefer
renaming the alias over living with the workaround.

## Folder Decisions

Choose the path by ownership first, then layer:

```text
src/tests/{client}/api/<feature>.spec.ts
src/tests/{client}/web/<domain>/<feature>.spec.ts
src/tests/shared/api/<feature>.spec.ts
src/tests/shared/web/<domain>/<feature>.spec.ts
src/tests/{client}/api/_support/<feature>.helpers.ts
src/pages/web/<domain>/<feature>.page.ts
src/utils/helpers/<name>.helper.ts
src/core/constants/<name>.ts
```

Use `shared` only when the same behavior is genuinely reusable across clients.

## Naming

- Specs: `<domain>-<feature>.spec.ts`
- Page objects: `<feature>.page.ts`
- Helpers: `<feature>.helper.ts` or `<feature>.helpers.ts`
- Types: `<feature>.types.ts` when reused or large
- Constants: UPPER_SNAKE keys in exported `as const` objects
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Test IDs: `TC_{AREA}_{FEATURE}_{###} — business-readable description`
- Areas: `API`, `WEB`

Prefer names that explain user/business behavior, not implementation mechanics.

Good:

```text
TC_API_SABIL_NEG_007 — a purchase request without a PR ID is rejected
TC_WEB_VENDOR_009 — Invite Vendors button opens the sidebar panel
```

Avoid:

```text
should return 400
click button test
validate payload
```

## Tags

Every `test.describe` must include tags:

```typescript
test.describe(
  "TC_API_SABIL — Sabil integration",
  {
    tag: ["@regression", "@api", "@critical"],
  },
  () => {},
);
```

Use:

- Tier: `@smoke`, `@regression`
- Layer: `@api`, `@ui`
- Severity: `@critical` when failure blocks core business flow

## Spec Shape

Use Arrange/Act/Assert comments only when they improve readability. Comments must
be business-language, not code narration.

```typescript
import { test, expect } from "@fixtures";
import { API_PATHS } from "@core/constants/urls";

type RequestListBody = {
  requests: Array<{ id: string; title: string }>;
};

test.describe("TC_API_PENNY — Requests List", { tag: ["@regression", "@api"] }, () => {
  test("TC_API_PENNY_001 — an authenticated admin can view purchase requests", async ({
    adminAccessToken,
    pennyRequestsApi,
  }) => {
    const response = await pennyRequestsApi.listRequests<RequestListBody>(adminAccessToken, {
      page: "0",
      limit: "10",
    });

    expect(response.statusCode).toBe(200);
    expect(response.data.requests.length).toBeGreaterThan(0);
  });
});
```

## API Standards

- Put endpoint strings in `API_PATHS` before using them in tests.
- Prefer existing client fixtures over raw `request`.
- Use `requestHandler` for fine-grained one-off requests.
- Use `BaseApiClient` for reusable domain clients.
- Pass bearer tokens per call; do not store mutable shared auth state.
- Use `optionalEnv`, `requireEnv`, `envNumber`, and `envFlag` for env reads.
- Use `attachment.helper.ts` for generated files/base64 attachment data.
- Negative tests must assert intentional status codes.
- Add schema validation only when the contract is stable and meaningful.

## Web Standards

- Page objects live under `src/pages/web/...`.
- All page objects extend `BasePage`.
- Use `this.action.*` and `this.wait.*`; avoid direct `this.page` actions unless
  the helper does not cover the behavior.
- Define locators as a top-level `const` object.
- Locator priority:
  `data-test-id` > role > label > CSS > XPath.
- Page object methods:
  - Action methods change state and should use `@Step`.
  - Query methods return data and should not assert.
  - Assertion methods wrap `expect` and should use `@Step`.

## Helper And Utility Standards

- Add a helper only when at least one real test needs it.
- Keep helpers deterministic, typed, and side-effect-light.
- Put generated outputs under ignored `artifacts/`.
- Redact secrets in logs and Allure attachments.
- Prefer small pure functions; keep filesystem/network side effects obvious.
- Reuse existing helpers before adding new ones:
  - `ActionHelper`, `WaitHelper`, `FileHelper`
  - `env.helper.ts`
  - `attachment.helper.ts`
  - `allure-metadata.helper.ts`

## Sabil API Readiness

Sabil API coverage currently lives in:

```text
src/tests/sabil/api/sabil-full-cycle.spec.ts
src/tests/sabil/api/sabil-integration-negative.spec.ts
```

Two-file suite; verify the live count with `--list` before making claims.

Use this shape for test-env validation:

```bash
CLIENT=sabil TEST_ENV=fb \
SABIL_ORG_CODE=<enabled-org-code> \
SABIL_PENNY_BASE_URL=https://api-sabil.tst.penny.co/api \
npx playwright test src/tests/sabil/api --project=api-testing
```

Full outbound coverage requires `SABIL_BASE_URL`.

## Before Finishing

Run the smallest meaningful validation:

```bash
npm run typecheck
npm run lint
npm run format:check
```

For API changes, also run discovery:

```bash
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec-or-folder> --project=api-testing --list
```

For web changes, run discovery:

```bash
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec-or-folder> --project=smoke --list
```

Report what was changed, what was validated, and any live-run blockers.

## Related Skills

- `/penny-setup` — install, env, and run commands.
- `/penny-api-sdet` — API framework reference (transport, auth, retry, redaction).
- `/penny-create-api-script` — generate API specs using these standards.
- `/penny-create-web-script` — generate web specs using these standards.
- `/penny-review-api-script`, `/penny-review-web-script` — review flavors.
- `/penny-test-data-setup` — factories, unique IDs, cleanup.
- `/penny-business` — domain vocabulary for titles and helpers.
- `/penny-framework-health-check` — cross-cutting framework audit.
