---
name: penny-api-sdet
description: API-focused Penny Playwright framework reference. Use when creating, editing, reviewing, or debugging Penny API tests, API clients, schema validation, auth flows, request handling, retries, redaction, fixtures, or test-data patterns in this penny-at workspace.
---

# Penny API SDET Reference

Use this as the source of truth for API automation work in `penny-at`. Prefer the
repo's current implementation over patterns from other Penny repositories.
For file creation, naming, test descriptions, page objects, helper placement, and
general TypeScript standards, use `penny-create-standard-code` first.

## Core Rules

- Import tests with `import { test, expect } from "@fixtures";`.
- Put client-specific API specs under `src/tests/{client}/api/**/*.spec.ts`.
- Put reusable/shared API specs under `src/tests/shared/api/**/*.spec.ts`.
- Put spec-local helpers under the nearest `_support/` folder, for example
  `src/tests/sabil/api/_support/` or `src/tests/shared/api/_support/`.
- Use `test.describe("TC_API_<AREA> — <feature>", { tag: ["@smoke"|"@regression", "@api"] }, ...)`.
- Write test titles and inline step comments in business language.
- Do not use `any`; create local types in the spec unless the type is reused.
- Do not commit or print secrets from `.env`, `src/config/clients/**/*.env`, or `.auth/*.json`.
- Do not pass a password to `.withToken()` or API client `{ token }` options.
- Credentials are only for login; authenticated requests use an access token.
- Valid standalone `CLIENT` values are `ewcf`, `rcmc`, `enterprise`, and `sabil`.
  Treat `srmg` and `voltalia` as enterprise subfolders, not standalone clients.
- This framework no longer supports a mobile test layer; use `@api` and `@ui`
  layer tags only.

## API Entry Points

Use `requestHandler` for exploratory or one-off API specs:

```typescript
const body = await requestHandler
  .path(API_PATHS.REQUESTS.BASE)
  .params({ page: "0", limit: "10" })
  .withToken(adminAccessToken)
  .get<RequestsListResponse>(200);
```

Use shared API client fixtures first when they fit:

```typescript
const response = await pennyRequestsApi.listRequests<RequestsListResponse>(adminAccessToken);
expect(response.statusCode).toBe(200);
```

Use `BaseApiClient` for new reusable domain clients:

```typescript
class RequestsApiClient extends BaseApiClient {
  list(token: string): Promise<ApiResponse<RequestsListResponse>> {
    return this.get<RequestsListResponse>(API_PATHS.REQUESTS.BASE, { token });
  }
}
```

Both routes share logging, retries, response parsing, redacted Allure attachments,
and `ApiError` handling through `src/api/support/api-transport.ts`.

## Current Test Layout

```text
src/tests/
  enterprise/
    srmg/
    voltalia/
  ewcf/
    web/
  rcmc/
  sabil/
    api/
      _support/
    web/
  shared/
    api/
      _support/
    web/
```

Playwright discovery is folder-layer based:

- API project: `**/api/**/*.spec.ts`
- Web/smoke project: `**/web/**/*.spec.ts`

Use tags for execution scope such as `@smoke`, `@regression`, `@api`, `@ui`,
and `@critical`.

## Sabil API Coverage

Sabil API coverage lives in:

- `src/tests/sabil/api/sabil-full-cycle.spec.ts`
- `src/tests/sabil/api/sabil-integration-negative.spec.ts`

Current Sabil API coverage lives across two files (see `--list` for the live
count):

- Full lifecycle tests for the Penny ↔ Sabil procurement flow (health, PR
  intake, RFQ, vendor onboarding, PO, GRN, bill/invoice, payment).
- Safeguard/edge tests for org routing, auth rejection, malformed payloads,
  duplicate PR IDs, lifecycle ordering, attachment validation, cross-tenant
  isolation, method-not-allowed, and one outbound-negative case.

For the Sabil gateway, preserve the `/api` prefix when needed:

```bash
CLIENT=sabil TEST_ENV=fb \
SABIL_ORG_CODE=<enabled-org-code> \
SABIL_PENNY_BASE_URL=https://api-sabil.tst.penny.co/api \
npx playwright test src/tests/sabil/api --project=api-testing
```

Full outbound coverage also requires `SABIL_BASE_URL`; otherwise outbound
Penny-to-Sabil tests intentionally skip.

## Auth Pattern

Use built-in token fixtures for common roles:

```typescript
test("TC_API_PENNY_001 — the requests list is available to an authenticated admin", async ({
  adminAccessToken,
  pennyRequestsApi,
}) => {
  const response = await pennyRequestsApi.listRequests(adminAccessToken);
  expect(response.statusCode).toBe(200);
});
```

Use `loginAs("user" | "admin")` when the full `AuthSession` is needed.
Use `authApi.login(role)` only when testing or debugging auth behavior.

Prefer adding a constant to `src/core/constants/urls.ts` before using a new API
path in tests. If an existing constant conflicts with a working endpoint, fix the
constant and update affected callers.

## Retry And Error Behavior

The shared API transport retries network errors, timeouts, HTTP `408`, HTTP `429`,
HTTP `5xx`, and Penny write-conflict `409` responses. Do not add ad hoc retry
loops in tests unless the scenario is intentionally testing eventual consistency.

Negative tests should assert the specific status with client `expectedStatus`
when the response body matters, or use `await expect(...get(200)).rejects.toThrow(...)`
when the failure itself is the assertion.
For negative write scenarios, use `.retry(false)` unless the scenario explicitly
tests retry behavior; an unexpected 2xx/3xx status mismatch must not re-send the
same write payload.

## Schema Validation

Schemas live under `test-data/response-schemas/`.

Use `validateSchema(body, schema, context)` for `requestHandler` results and
`validateApiResponseSchema(response, schema, context)` for `ApiResponse<T>`.

Generate or update schemas only when the endpoint contract is intentionally known.
Do not freeze volatile fields too tightly unless the test is meant to enforce them.

## Creation Workflow

1. Identify endpoint, scenario, auth role, environment/client, and expected status.
2. Search existing specs to avoid duplicate coverage.
3. Check or add `API_PATHS` constants before writing a test.
4. Choose an existing client fixture, `requestHandler`, or a new `BaseApiClient` subclass.
5. Add focused types and schema validation where contract stability matters.
6. Run `npm run validate` for typecheck, lint, and API test discovery.
7. Run a targeted API spec only when credentials/environment access are available.

## Do Not

- Do not read or merge files from another repo unless the user explicitly asks.
- Do not inline bearer tokens, credentials, endpoint strings, or generated IDs.
- Do not attach raw auth responses or request bodies containing secrets.
- Do not add broad abstractions before at least two specs need the same behavior.

## Related Skills

- `/penny-setup` — install, env, run, and debug commands.
- `/penny-create-standard-code` — coding standards baseline.
- `/penny-create-api-script` — generate a new API spec.
- `/penny-review-api-script` — review an API spec or transport change.
- `/penny-test-data-setup` — factories, unique IDs, cleanup.
- `/penny-business` — domain vocabulary and traceability.
- `/penny-framework-health-check` — cross-cutting framework audit.
