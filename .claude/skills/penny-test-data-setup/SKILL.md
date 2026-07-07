---
name: penny-test-data-setup
description: Test data setup and cleanup patterns for penny-at automation. Use when the user asks Claude to design or improve how tests generate unique data, seed prerequisites, clean up after runs, or use TestDataFactory, VendorDataFactory, Faker, env-driven fixtures, or API-based teardown.
---

# Penny Test Data Setup

Own the "how do we generate, seed, and clean up test data" question. Pair with
`/penny-create-api-script` and `/penny-create-web-script` for the tests that
consume the data, and with `/penny-business` for domain-correct naming.

## When To Use

- New test needs unique users, vendors, requests, PRs, POs, invoices, etc.
- Existing tests share mutable state or produce name collisions.
- Cleanup is missing / partial / leaking data across runs.
- Framework needs a new data factory or seeded fixture.
- Deciding between static seed data vs generated data.

## Required Inputs

- **Entity** — vendor, purchase request, invoice, user, etc.
- **Ownership** — which client / org owns the data.
- **Lifecycle** — one test, describe block, worker, or entire run?
- **Cleanup obligation** — does the entity leak resources or interact with
  external systems (Sabil, email, notifications)?
- **Live data allowed?** — if no live API, static / generated data only.

## Repository Review Before Action

Read before designing:

- `src/factories/test-data.factory.ts` — general Faker-based helpers (unique
  emails, IDs, dates).
- `src/factories/vendor.factory.ts` — vendor-specific payloads.
- `src/factories/index.ts` — what is exported.
- `src/tests/*/api/_support/*.helpers.ts` — spec-local payload builders
  (`sabil-integration.helpers.ts` is the strongest reference).
- `src/utils/helpers/env.helper.ts` — `optionalEnv`, `envNumber`, `envFlag`.
- `test-data/response-schemas/**` and `test-data/*.json|csv` — static seeds.
- `src/fixtures/api.fixture.ts` — worker-scoped auth cache pattern.

## Step-By-Step Workflow

1. **Identify the entity** — use the exact `/penny-business` term.
2. **Reuse first** — does an existing factory already build this? If yes, extend
   instead of duplicating.
3. **Uniqueness** — combine time + worker index + short random suffix. For
   Sabil-style flows the pattern is:

   ```typescript
   function buildRunId(): string {
     const workerIndex = optionalEnv("TEST_WORKER_INDEX") ?? "0";
     return `${Date.now()}${workerIndex.padStart(2, "0")}`;
   }
   ```

4. **Env override** — every generated value must be env-overridable so a live
   env can pin known-good IDs. Naming convention: `SABIL_PR_ID`,
   `SABIL_ORDER_ID`, etc.
5. **API-based seeding** — prefer API clients over UI seeding. Store the
   resulting IDs on a lifecycle object that later tests read from.
6. **Cleanup obligation** — for anything that mutates external state (Sabil,
   vendor onboarding, invoice, payment), pair the creation with a cleanup call
   in `afterEach` / `afterAll`. Cleanup must run even on failure.
7. **Worker-scope caching** — for auth sessions or per-worker seeds, use
   `worker` scope like the existing `authSessionCache` fixture. Never share
   mutable state across tests inside a worker unless the fixture is worker-scoped.

## Framework Standards

### Naming

- Variables: `createdVendor`, `submittedRequest`, `approvedPurchaseOrder`.
- Emails: `TestDataFactory.uniqueEmail("qa-vendor")` — the seed is the persona.
- Business IDs: `PR-${shortRunId}`, `PO-${shortRunId}`, `INV-${shortRunId}`.
- Never `data1`, `payload1`, `test123`.

### Factory Pattern

Small, typed, pure. No I/O in factories.

```typescript
export class VendorPayloadFactory {
  static build(overrides: Partial<VendorPayload> = {}): VendorPayload {
    return {
      name: `QA Vendor ${TestDataFactory.uniqueSuffix()}`,
      email: TestDataFactory.uniqueEmail("qa-vendor"),
      country: "SA",
      ...overrides,
    };
  }
}
```

### Spec-Local Builder Pattern

For flow-specific payloads that don't belong in a global factory:

```text
src/tests/{client}/api/_support/{feature}.helpers.ts
```

Follow the `sabil-integration.helpers.ts` shape:

- A single `createLifecycleData(envConfig)` that resolves every env override.
- Per-endpoint `buildXxxPayload(data, options?)` functions.
- `capture*(data, response)` functions that pull SAP-assigned IDs into the
  lifecycle object and **throw** when the response doesn't contain the key.
- Modifier helpers (`withoutSabilField`, `withoutNestedSabilField`,
  `withSabilField`, `withFirstSabilItemField`, `withSabilAttachment`) for
  negative variants.

### Cleanup Pattern

```typescript
test.afterEach(async ({ pennyRequestsApi, adminAccessToken }, testInfo) => {
  const created = testInfo.attachments.find((a) => a.name === "created-request");
  if (!created?.body) return;
  const id = JSON.parse(created.body.toString()).id;
  await pennyRequestsApi.deleteRequest(adminAccessToken, id).catch(() => {
    // Cleanup best-effort; do not fail the test if teardown fails.
  });
});
```

For worker-level seeded data, prefer a global-teardown script under `scripts/`.

## Data Safety

- Do not use real customer, supplier, or employee data.
- Do not commit `.env`, `.auth`, or client credentials.
- Do not print emails, phone numbers, IBANs, or tokens to the console — Allure
  redaction covers attachments but console logs are not sanitized.
- Prefer example.com emails, RFC 2606 phone numbers, RFC-example IBANs unless
  the test env requires a specific value.

## Output Format

1. **Understanding** — entity + lifecycle summary.
2. **Files reviewed** — factories, helpers, fixtures inspected.
3. **Framework pattern found** — which factory / helper the answer builds on.
4. **Proposed approach** — factory extension, new helper, or spec-local builder.
5. **Files to create or update** — full list.
6. **Generated code** — factory / builder / cleanup snippet.
7. **Env variables** — full list of new `optionalEnv` keys, with defaults.
8. **Cleanup strategy** — hook, scope, and best-effort guard.
9. **Commands to run** — `npm run validate` and any targeted discovery.
10. **Self-review checklist** — see below.
11. **Risks / assumptions** — anything not verified.
12. **Framework feedback** — missing factory / helper / cleanup hook.

## Quality Checklist

- Every generated value is unique across parallel workers.
- Every generated value is env-overridable.
- Cleanup runs on failure (`afterEach` with try/catch or `.catch(() => {})`).
- No shared mutable state across tests unless deliberately worker-scoped.
- No secrets, real emails, or real IBANs in defaults.
- Factory is typed — no `any`, no untyped `Record<string, unknown>` unless the
  Sabil-style contract genuinely needs it.
- Business identifiers use domain language (`prId`, `vendorPennyId`), not
  invented labels.

## Do Not Do

- Do not seed via UI when an API client exists.
- Do not hardcode business IDs, emails, or IBANs when a factory can generate them.
- Do not create a factory for a one-off value used by a single test.
- Do not silently swallow cleanup failures without a comment explaining why.
- Do not put I/O in factory methods — factories build, they don't call APIs.
- Do not add a new factory in `src/factories/` without a real second consumer;
  prefer spec-local `_support/` until the second consumer arrives.
