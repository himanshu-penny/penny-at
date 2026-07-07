---
name: penny-review-api-script
description: Review skill for Penny API Playwright scripts and API framework changes in penny-at. Use when the user asks Claude to review API specs, request handlers, BaseApiClient clients, auth setup, schema validation, retry/error handling, redaction, fixtures, or generated API test scripts.
---

# Penny Review API Script

Review as a senior SDET. Lead with bugs, risks, and missing tests. Be concise.
Use `penny-create-standard-code` as the baseline for naming, folder placement,
business-readable descriptions, TypeScript style, and validation expectations.

## Start

If this workspace is a git repo:

```bash
git status --short
git diff --name-only
```

If not, review the files the user named or the API files changed in this session.
Relevant paths:

- `src/tests/{client}/api/**/*.spec.ts`
- `src/tests/shared/api/**/*.spec.ts`
- `src/api/**/*.ts`
- `src/fixtures/**/*.ts`
- `src/config/**/*.ts`
- `src/core/constants/urls.ts`
- `test-data/response-schemas/**`
- `docs/API_TESTING_GUIDE.md`

## Required Checks

Run:

```bash
npm run validate
```

If live API validation is requested and credentials exist, run the smallest targeted
`--project=api-testing` command.

## Review Checklist

Report findings with file and line:

- Credentials are used only for login, not as bearer tokens.
- Tokens, passwords, cookies, and auth responses are not logged or attached raw.
- API paths use `API_PATHS` constants instead of inline strings in tests.
- API specs follow the client-first structure, not old `src/tests/api/<tier>` folders.
- `requestHandler` chains are reset-safe and do not rely on shared mutable auth state.
- `BaseApiClient` callers pass `{ token }` per call instead of mutating shared headers.
- Negative tests assert the intended status or error body.
- Retry behavior is not duplicated in specs.
- Schema validation is meaningful and not overfitted to volatile data.
- Test titles and step comments read as business behavior.
- File, function, variable, class, and helper names are clear to a new framework user.
- Tags include tier and `@api`.
- Tags do not use `@mobile`; this framework currently supports API and web UI only.
- Types avoid `any` and describe only the fields the test needs.
- Generated artifacts and env/auth files are not added to commit candidates.

## Sabil-Specific Review Notes

For Sabil API changes, verify both suites when relevant:

- `src/tests/sabil/api/sabil-full-cycle.spec.ts`
- `src/tests/sabil/api/sabil-integration-negative.spec.ts`

Full test-env readiness means the current Sabil suite (verify count via
`--list`) is discoverable and, once an enabled `SABIL_ORG_CODE` plus outbound
`SABIL_BASE_URL` are available, all pass.
Keep `SABIL_PENNY_BASE_URL` with `/api` when targeting the Sabil gateway.

## Output Format

Use this order:

1. Findings, highest severity first.
2. Open questions or assumptions.
3. Checks run.
4. Brief change summary only if useful.

If there are no issues, say that clearly and name any residual risk, such as live
API tests not being run.

## Related Skills

- `/penny-create-standard-code` — baseline standard used for review.
- `/penny-api-sdet` — API architecture reference.
- `/penny-create-api-script` — for code fixes after review.
- `/penny-test-data-setup` — for cleanup/factory-related findings.
- `/penny-business` — vocabulary + traceability checks.
- `/penny-framework-health-check` — escalation path when the finding is
  framework-wide, not spec-local.
