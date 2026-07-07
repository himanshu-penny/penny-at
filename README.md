# Penny AT

Production-grade Playwright automation for the Penny app, with a strong API
testing core and supporting Web UI coverage.

## What This Framework Provides

| Area              | Current Pattern                                                              |
| ----------------- | ---------------------------------------------------------------------------- |
| REST API testing  | Typed API clients, fluent request builder, token fixtures                    |
| Auth              | Credentials only for login; bearer tokens passed per request                 |
| Reliability       | Shared retry handling for timeouts, 408, 429, 5xx, and Penny write conflicts |
| Security          | Redacted logs, redacted Allure attachments, ignored auth/env artifacts       |
| Schema validation | AJV helpers and generated schema support                                     |
| Web UI testing    | Penny page objects and browser storage-state setup                           |
| Reporting         | HTML, JSON, JUnit, custom console summary, and Allure                        |
| Manual review     | Automatic API guide with expected results, evidence, and next checks         |
| CI                | GitHub Actions quality job plus `api-testing` and `smoke` projects           |

## Quick Start

```bash
npm run setup
```

Create a local credential file from a template:

```bash
cp src/config/clients/ewcf/test.env.example src/config/clients/ewcf/test.env
```

Fill in:

```bash
USER_EMAIL=your-test-user@example.com
USER_PASSWORD=your-password
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-admin-password
```

Run with an explicit client and environment:

```bash
CLIENT=ewcf TEST_ENV=test npm run test:api
```

Valid clients: `ewcf`, `rcmc`, `enterprise`, `sabil`.

Valid environments: `dev`, `test`, `fb`, `fb-<number>`, `demo`, `prod`.

Feature-branch slots can be selected directly:

```bash
CLIENT=ewcf TEST_ENV=fb-5 npm run test:api
```

`TEST_ENV=fb FB_NUMBER=5` is also supported.

CI can provide `USER_EMAIL`, `USER_PASSWORD`, `ADMIN_EMAIL`, and
`ADMIN_PASSWORD` directly as environment variables instead of creating local
credential files.

## Commands

```bash
# Tests
npm test                    # all configured Playwright projects
npm run test:api            # API-only project
npm run test:api:allure     # API-only project with rich Allure metadata
npm run test:api:manual     # API checks with manual-friendly guidance
npm run test:api:shared     # shared API checks only
npm run test:api:sabil      # shared + Sabil API checks
npm run test:web            # smoke web project
npm run test:web:allure     # smoke web project with rich Allure metadata
npm run test:web:ewcf       # shared + EWCF web checks
npm run test:web:sabil      # shared + Sabil web checks
npm run test:smoke          # tests tagged @smoke
npm run test:regression     # tests tagged @regression
npm run test:parallel       # 4 workers
npm run test:ci             # CI=true playwright test
npm run test:headed         # visible browser
npm run test:debug          # Playwright debugger
npm run test:ui             # Playwright UI mode
npm run test:api:list       # list API tests without executing

# Quality
npm run validate            # typecheck + lint + API test discovery
npm run typecheck           # tsc --noEmit
npm run lint                # ESLint for TypeScript files
npm run lint:fix            # ESLint auto-fix
npm run format              # Prettier write
npm run format:check        # Prettier check

# Reports and utilities
npm run report              # open HTML report
npm run report:allure       # generate and open Allure report
npm run report:allure:generate
npm run report:allure:open
npm run generate:schema     # generate JSON schema from a live response
npm run cleanup             # clean generated artifacts
```

## Allure Reporting

Allure output is written to `artifacts/reports/allure-results`, and the
generated report is written to `artifacts/reports/allure-html`.

Global setup enriches every run with:

- `environment.properties` for client, environment, URLs, OS, Node, workers, projects, branch, and commit
- `executor.json` for local or GitHub Actions run identity
- `categories.json` for auth, UI locator, API contract, schema, timeout, network, assertion, and framework failures
- restored Allure history so trend graphs survive between local report generations

Normal test commands keep Playwright's own HTML report clean. Use
`npm run test:api:allure` or `npm run test:web:allure` when you want richer
Allure runtime labels and parameters in the Allure report. Use
`npm run test:api:manual` when a manual tester needs readable purpose,
expected-result, request/response evidence, and next-check guidance. API calls
made through `RequestHandler` or typed API clients are documented automatically.
The manual report uses `src/core/http-status-guide.ts`; see
`docs/API_STATUS_CODES_GUIDE.md` for examples and first checks for registered
HTTP status codes.

## Project Structure

```text
penny-at/
├── .claude/skills/              # Local Claude skills for this workspace
├── .github/workflows/ci.yml     # CI quality + Playwright matrix
├── docs/
│   ├── API_TESTING_GUIDE.md
│   ├── API_STATUS_CODES_GUIDE.md
│   ├── CI_CD_GUIDE.md
│   ├── CLAUDE_MCP_GUIDE.md
│   ├── LOCATOR_STRATEGY.md
│   └── MANUAL_TESTER_GUIDE.md
├── scripts/
│   ├── setup.sh
│   ├── cleanup.sh
│   ├── generate-schema.js
│   └── strip-ansi-allure.js
├── src/
│   ├── api/
│   │   ├── clients/             # BaseApiClient, AuthApiClient, Penny clients
│   │   ├── support/             # shared transport + RequestHandler
│   │   └── schema-validator.ts
│   ├── config/                  # environment, auth setup, client config
│   ├── core/                    # assertions, constants, errors, logger, redaction
│   ├── factories/               # faker-backed test data
│   ├── fixtures/                # merged Playwright fixtures
│   ├── middleware/              # retry helpers
│   ├── pages/                   # Penny page objects
│   ├── reporters/               # custom Playwright reporter
│   ├── tests/
│   │   ├── enterprise/
│   │   │   ├── srmg/
│   │   │   └── voltalia/
│   │   ├── ewcf/
│   │   │   └── web/vendors/
│   │   ├── framework/
│   │   │   └── api/
│   │   ├── rcmc/
│   │   ├── sabil/
│   │   │   ├── api/integrations/
│   │   │   └── web/vendors/
│   │   └── shared/
│   │       ├── api/requests/
│   │       └── web/
│   ├── types/
│   └── utils/
├── test-data/
│   ├── request-objects/
│   └── response-schemas/
├── playwright.config.ts
└── tsconfig.json
```

## API Testing Pattern

Always import fixtures from `@fixtures`:

```typescript
import { test, expect } from "@fixtures";
import { API_PATHS } from "@core/constants/urls";

test.describe("TC_API_PENNY — Requests List", { tag: ["@regression", "@api"] }, () => {
  test("TC_API_PENNY_001 — the requests list is available to an authenticated admin", async ({
    adminAccessToken,
    pennyRequestsApi,
  }) => {
    const response = await pennyRequestsApi.listRequests(adminAccessToken, {
      page: "0",
      limit: "10",
    });

    expect(response.statusCode).toBe(200);
  });
});
```

Use endpoint constants from `API_PATHS`. Add a constant before adding a new
inline endpoint string to a spec.

## API Fixtures

| Fixture            | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `requestHandler`   | Fluent builder for one-off API requests                    |
| `authApi`          | Login client for auth coverage                             |
| `loginAs`          | Cached per-test login helper returning an auth session     |
| `adminAccessToken` | Admin bearer token                                         |
| `userAccessToken`  | User bearer token                                          |
| `pennyRequestsApi` | Shared client for request, expense, and RFQ list endpoints |

Credentials from `envConfig` are only for login. Authenticated API calls should
pass an access token with `.withToken(token)` or a typed API client method.

## Local-Only Files

Do not commit:

- `.env` and `.env.*`
- `src/config/clients/**/*.env`
- `.auth/*.json`
- `artifacts/**`
- `test-results/**`, `playwright-report/**`, `blob-report/**`
- `allure-results/**`, `allure-report/**`
- `.DS_Store` and editor/system clutter

## Documentation

| Guide                                              | Purpose                                     |
| -------------------------------------------------- | ------------------------------------------- |
| [API Testing Guide](docs/API_TESTING_GUIDE.md)     | API framework patterns and examples         |
| [Manual Tester Guide](docs/MANUAL_TESTER_GUIDE.md) | Manual-friendly API run and report workflow |
| [CI/CD Guide](docs/CI_CD_GUIDE.md)                 | GitHub Actions setup and secrets            |
| [Claude MCP Guide](docs/CLAUDE_MCP_GUIDE.md)       | AI-assisted framework workflows             |
| [Locator Strategy](docs/LOCATOR_STRATEGY.md)       | Web selector conventions                    |

## Contributing Rules

1. Use `import { test, expect } from "@fixtures";`.
2. Put API specs under `src/tests/{client}/api/` or `src/tests/shared/api/`.
3. Tag every `test.describe` with tier and layer tags, such as `@regression` and `@api`.
4. Keep credentials out of logs, Allure attachments, and committed files.
5. Use access tokens for API authorization; never pass passwords to `.withToken()`.
6. Run `npm run validate` before handing off changes.
