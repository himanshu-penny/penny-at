---
name: penny-create-api-script
description: Guided creator for Penny API Playwright test scripts in penny-at. Use when the user asks Claude to create, add, scaffold, or improve an API automation script/spec for a Penny endpoint, PR, bug fix, contract, auth, request list, RFQ, vendor, order, bill, or other API behavior.
---

# Penny Create API Script

Create API-focused Playwright specs for this `penny-at` framework. Always use
`penny-create-standard-code` first for naming, structure, descriptions, and
TypeScript conventions, then use `penny-api-sdet` for API architecture details.

## Step 1 - Collect Context

If missing, ask for these in one message:

- endpoint or feature area
- scenario objective, including happy/negative/edge expectations
- auth role: user, admin, unauthenticated, or custom token
- client/environment if relevant
- expected response shape or contract source
- whether live execution is allowed

Proceed without asking only when the request or code already makes the answer clear.

## Step 2 - Check Coverage

Before writing code:

```bash
find src/tests -type f -name "*.spec.ts" | sort
rg "<endpoint|feature|ticket|field>" src/tests src/api src/core/constants
```

If fully covered, report the file and stop. If partially covered, explain the gap
and add only the missing focused spec.

## Step 3 - Plan Before Editing

State a short plan covering:

- spec path
- tags and test case naming
- auth flow and token source
- existing client fixture versus `requestHandler` versus typed `BaseApiClient`
- constants/schema/types to add or update
- validation commands

## Step 4 - Write The Script

Use the current client-first folder layout:

```text
src/tests/{client}/api/<feature>.spec.ts
src/tests/shared/api/<feature>.spec.ts
```

Examples:

- Sabil-specific API specs: `src/tests/sabil/api/`
- Shared Penny API specs: `src/tests/shared/api/`
- Helpers for one suite: nearest `_support/` folder

Do not create `src/tests/api/<tier>` folders. Use Playwright tags such as
`@smoke`, `@regression`, `@api`, and `@critical` for grouping.

Follow this template shape:

```typescript
import { test, expect } from "@fixtures";
import { API_PATHS } from "@core/constants/urls";

type ResponseBody = {
  requests: Array<{ id: string; title: string }>;
};

test.describe("TC_API_PENNY — Requests List", { tag: ["@regression", "@api"] }, () => {
  test("TC_API_PENNY_001 — the requests list is available to an authenticated admin", async ({
    adminAccessToken,
    pennyRequestsApi,
  }) => {
    const response = await pennyRequestsApi.listRequests<ResponseBody>(adminAccessToken, {
      page: "0",
      limit: "10",
    });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.data.requests)).toBe(true);
  });
});
```

Use endpoint constants. If a constant is missing, add it first. Prefer existing
fixtures such as `adminAccessToken`, `userAccessToken`, `loginAs`, `authApi`, and
`pennyRequestsApi` before hand-writing auth or raw `request` calls. Keep the spec
focused: one behavior per test unless the endpoint contract is intentionally one combined assertion.

## Step 5 - Validate

Run:

```bash
npm run validate
```

Run targeted tests only when credentials and environment are available:

```bash
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec-file> --project=api-testing
```

Report whether live tests were run. If not, say why.

## Related Skills

- `/penny-create-standard-code` — naming, folders, tags, TypeScript baseline.
- `/penny-api-sdet` — deeper API framework reference.
- `/penny-test-data-setup` — factories, unique IDs, cleanup.
- `/penny-business` — domain vocabulary for titles and helpers.
- `/penny-review-api-script` — self-review before handover.
- `/playwright-cli` — targeted run and discovery commands.
