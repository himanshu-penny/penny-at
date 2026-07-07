# Claude Skills And MCP Guide

This workspace includes local Claude skills under `.claude/skills/`. Use them to
keep generated work aligned with the Penny API-first framework.

## Local Skills

| Skill                         | Use                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `penny-api-sdet`              | Source of truth for API architecture, auth, retries, redaction, fixtures, constants, and schema validation |
| `penny-create-api-script`     | Create or improve Penny API Playwright specs                                                               |
| `penny-review-api-script`     | Review API specs and framework changes                                                                     |
| `penny-create-utility-script` | Create or improve setup, cleanup, schema, report, and other helper scripts                                 |

Prefer these skills over generic Playwright examples. They reflect this
workspace's current structure.

## Useful Prompts

Create a new API spec:

```text
Use penny-create-api-script to add API coverage for GET /api/request/expense.
Use admin auth, validate the response status and key filter-list fields, and keep
the spec under src/tests/{client}/api or src/tests/shared/api.
```

Review an API change:

```text
Use penny-review-api-script to review src/api/support/api-transport.ts and
src/tests/shared/api/requests/pr23512-filter-fields.spec.ts for retry,
redaction, schema, and auth risks.
```

Create a utility script:

```text
Use penny-create-utility-script to improve scripts/generate-schema.js so it is
safe for authenticated Penny endpoints and validates output paths.
```

Update a page object:

```text
Update src/pages/web/penny-login.page.ts following the BasePage conventions.
Keep locators in the PENNY_LOGIN_LOCATORS object at the top of the file.
```

## MCP Usage

The Playwright MCP server can help inspect live UI behavior and selectors.
Use it for browser-assisted investigation, not as a substitute for reviewing the
code and framework rules.

Install or run Playwright MCP as needed:

```bash
npx @playwright/mcp@latest
```

When using browser inspection, ask for changes in this repo's style:

```text
Inspect the Penny login page and suggest stable data-test-id locators. If code
changes are needed, update src/pages/web/penny-login.page.ts and keep selectors
inside PENNY_LOGIN_LOCATORS.
```

## Guardrails

- Do not read or copy files from another repo unless explicitly asked.
- Do not print or commit `.env`, `src/config/clients/**/*.env`, or `.auth/*.json`.
- Do not pass passwords to `.withToken()` or typed API client token options.
- Do not create broad abstractions before at least two tests need the behavior.
- Run `npm run validate` before handing off framework or API test changes.

## Validation

For normal framework changes:

```bash
npm run validate
```

For targeted live API validation, only when credentials and environment access
are available:

```bash
CLIENT=ewcf TEST_ENV=test npx playwright test <spec-file> --project=api-testing
```
