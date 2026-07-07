# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## About This Project

A production-grade Playwright automation framework supporting Web UI and REST API testing for the Penny app.

## Tech Stack

- **Playwright** 1.49+ with TypeScript 5.7+
- **AJV** for JSON Schema contract validation
- **Faker** (`@faker-js/faker`) for test data generation
- **Allure** for rich reporting
- **dotenv** for environment variable loading

## Commands

```bash
# Test execution
npm test                    # All tests
npm run test:smoke          # @smoke tagged tests
npm run test:regression     # @regression tagged tests
npm run test:api            # api-testing project (no browser)
npm run test:web            # smoke web project
npm run test:api:list       # list API tests without executing
npm run test:parallel       # 4 workers
npm run test:ci             # HTML + JUnit + JSON reporters
npm run test:headed         # With browser visible
npm run test:debug          # Playwright debugger
npm run test:ui             # Playwright UI mode
npx playwright test my-feature.spec.ts   # Single file

# Quality
npm run validate            # typecheck + lint + API test discovery
npm run lint                # ESLint (all TypeScript files)
npm run lint:fix            # ESLint with auto-fix
npm run format              # Prettier
npm run format:check        # Prettier check
npm run typecheck           # tsc --noEmit

# Reports
npm run report              # Open HTML report (artifacts/reports/html)
npm run report:allure       # Serve Allure report

# Setup
npm run setup               # scripts/setup.sh
npm run install:browsers    # playwright install --with-deps
npm run generate:schema     # scripts/generate-schema.js
```

## Architecture

### Path Aliases (tsconfig)

```
@fixtures   → src/fixtures/index.ts
@pages/*    → src/pages/*
@utils/*    → src/utils/*
@config/*   → src/config/*
@core/*     → src/core/*
@api/*      → src/api/*
@factories/* → src/factories/*
@types/*    → src/types/*
@test-data/* → test-data/
```

Always import test utilities as `import { test, expect } from "@fixtures";`.

### Fixture Composition

Three fixture files merged via `mergeTests()` in `src/fixtures/index.ts`:

| Fixture            | Type                             | Source                                  |
| ------------------ | -------------------------------- | --------------------------------------- |
| `envConfig`        | `EnvironmentConfig`              | base — URLs, credentials, timeouts      |
| `testData`         | `TestDataFactory`                | base — Faker-based data generator       |
| `logger`           | `Logger`                         | base                                    |
| `actionHelper`     | `ActionHelper`                   | base                                    |
| `screenshotHelper` | `ScreenshotHelper`               | base                                    |
| `pennyLoginPage`   | `PennyLoginPage`                 | web                                     |
| `requestHandler`   | `RequestHandler`                 | api — fluent builder                    |
| `authApi`          | `AuthApiClient`                  | api — login helper client               |
| `loginAs`          | `(role) => Promise<AuthSession>` | api — cached per-test login helper      |
| `adminAccessToken` | `string`                         | api — admin bearer token                |
| `userAccessToken`  | `string`                         | api — user bearer token                 |
| `pennyRequestsApi` | `PennyRequestsApiClient`         | api — common request/RFQ list endpoints |

### Playwright Projects

Defined in `playwright.config.ts`:

- `api-testing` — no browser, targets Penny API
- `smoke` — Desktop Chrome, depends on `auth-setup-web` + `auth-setup-api`
- `auth-setup-web` — browser UI login → `.auth/user-web.json`
- `auth-setup-api` — headless REST login → `.auth/user-api.json`

### BasePage (`src/pages/web/base.page.ts`)

All page objects extend `BasePage`. Use `this.action.*` and `this.wait.*` — never call `this.page` directly in methods.

Page object methods fall into three categories:

- **Action methods** — change state, decorated with `@Step()`
- **Query methods** — return data, no assertions
- **Assertion methods** — wrapped expects, decorated with `@Step()`

```typescript
class MyPage extends BasePage {
  @Step("Click submit button")
  async clickSubmit(): Promise<void> {
    await this.action.click(MY_LOCATORS.SUBMIT_BUTTON);
  }
}
```

### BaseApiClient (`src/api/clients/`)

All API clients extend `BaseApiClient`. Use `this.get<T>()`, `this.post<T>()` etc. Response is always `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
  headers?: Record<string, string>;
}
```

Pass bearer tokens per call with `{ token }`; do not mutate shared client auth state.
Use credentials only for login.

### Fluent RequestHandler

For fine-grained request control, use the `requestHandler` fixture:

```typescript
const response = await requestHandler
  .path(API_PATHS.REQUESTS.BASE)
  .params({ page: "0", limit: "10" })
  .withToken(authToken)
  .get(200); // throws ApiError if status != 200
```

### Locators

Define locators as a `const` object at the top of each page object file (e.g., `PENNY_LOGIN_LOCATORS` in `penny-login.page.ts`). Never inline locator strings directly in methods or tests. Priority: `[data-test-id]` > `getByRole` > `getByLabel` > CSS > XPath.

### Constants

- `API_PATHS` (`src/core/constants/urls.ts`) — all API endpoint strings
- `PENNY_ROUTES` / `PENNY_ROUTE_PATTERNS` (`src/core/constants/routes.ts`) — URL paths and regexes
- Never inline route strings or API paths in tests

### Environment Config

Set `CLIENT` + `TEST_ENV` before running. Config resolved in `src/config/environments.ts`. The `envConfig` fixture exposes:

```typescript
{ name, client, webUrl, apiUrl, credentials: { user, admin }, timeouts: { pageLoad, elementVisible, apiResponse } }
```

URLs come from the built-in map in `src/config/client-config.ts`.
Credentials load from `src/config/clients/{client}/{env}.env` (gitignored — copy from `*.env.example`).

### Retry Middleware (`src/middleware/`)

```typescript
const result = await withRetry(() => apiClient.getUser(id), {
  retries: 3,
  delayMs: 500,
  exponentialBackoff: true, // default
});
```

### Schema Validation

JSON schemas live in `test-data/response-schemas/`. Validate API responses with AJV:

```typescript
validateSchema(response.data, registerSchema, "POST /users");
```

Generate new schemas with `npm run generate:schema`.

### Custom Assertions (`src/core/assertions.ts`)

```typescript
import { assert } from "@core/assertions";
await assert.isVisible(locator);
await assert.hasText(locator, "text or /regex/");
await assert.statusCode(response, 200);
await assert.urlContains(page, "/login");
```

## Key Patterns

### Test Structure

```typescript
import { test, expect } from "@fixtures";

test.describe("TC_API_PENNY — Requests List", { tag: ["@smoke", "@api"] }, () => {
  test("TC_API_PENNY_001 — requests list returns 200", async ({
    pennyRequestsApi,
    adminAccessToken,
  }) => {
    // ── Arrange ─────────
    const params = { page: "0", limit: "10" };

    // ── Act ──────────────
    const response = await pennyRequestsApi.listRequests(adminAccessToken, params);

    // ── Assert ───────────
    expect(response.statusCode).toBe(200);
  });
});
```

### Naming

- Tests: `TC_{AREA}_{FEATURE}_{###} — description` (e.g. `TC_API_AUTH_001 — login returns token`)
- Areas: `WEB`, `API`

### Test Descriptions & Inline Comments

Write all test titles and inline step comments in plain business language — as if explaining to a non-technical stakeholder what the user would see or experience, not what the code does.

**Do:**

```
"the Submit button remains visible at all times without scrolling"
"entering an invalid email and moving to the next field immediately shows a validation error"
"the form cannot be submitted until all required documents have been uploaded"
```

**Don't:**

```
"Confirm and Submit button is in viewport (sticky footer)"
"inline validation fires on blur, not only on submit"
"required documents block submission when not uploaded"
```

This rule applies to every `.spec.ts` file, including new tests and any test you modify.

### Tags (on every `describe` block, pick what applies)

Tier: `@smoke` · `@regression`
Layer: `@api` · `@ui`
Severity: `@critical`

```typescript
test.describe("TC_WEB_VENDOR — Vendors List", { tag: ["@smoke", "@ui"] }, () => { ... });
```

### Code Style

- 100 char line width (Prettier), trailing commas, double quotes
- No `any` — use proper interfaces from `src/types/`
