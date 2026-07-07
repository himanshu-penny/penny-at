---
name: penny-create-api-client
description: Guided creation of a new BaseApiClient subclass in penny-at. Use when the user asks to add, refactor, or promote a reusable API client for a Penny domain (vendors, orders, bills, RFQs, contracts, payments), or when three or more specs would benefit from sharing the same endpoint calls behind a typed client.
---

# Penny Create API Client

Add a typed domain client that wraps a related set of Penny API endpoints. Use
this when `requestHandler` chains start repeating in specs. For one-off request
plumbing, use `requestHandler` directly — do NOT create a client for a single
endpoint used by a single test.

## When To Use

- Two or more specs already use the same endpoints via `requestHandler`.
- A new domain area (payments, contracts, GRNs) is being automated and will need
  several endpoints.
- Auth / retry / typing behavior should be consistent across specs that hit the
  same domain.

## Do Not Use For

- A single endpoint called from a single spec — keep it inline with `requestHandler`.
- Sabil-style contract-first payloads where a spec-local `_support/` helper is a
  better fit (see `src/tests/sabil/api/_support/sabil-integration.helpers.ts`).
- Endpoints that need a fundamentally different transport (multipart uploads,
  streaming) — those need transport-level work first.

## Required Inputs

- **Domain name** — matches Penny business vocabulary from `/penny-business`
  (e.g., `vendors`, `orders`, `bills`, `contracts`, `payments`).
- **Endpoints to cover** — path + verb + auth requirement + default query params.
- **Response contract source** — Postman collection, Penny KB, existing spec,
  or backend README.
- **Auth model** — bearer token per call (default), unauthenticated (rare),
  or a special header (Sabil-style `X-ORG-CODE`).

## Repository Review Before Action

Read every one of these:

- `src/api/clients/base-api.client.ts` — the class you'll extend.
- `src/api/clients/penny-requests-api.client.ts` — the reference implementation
  (typed list methods, default params, `compactParams` helper).
- `src/api/clients/auth-api.client.ts` — the login-flow reference.
- `src/api/support/api-transport.ts` — what `ApiRequestOptions` accepts.
- `src/core/constants/urls.ts` — `API_PATHS` for the paths you'll use.
- `src/fixtures/api.fixture.ts` — how existing clients wire into fixtures.
- Any existing specs that hit the same domain (grep `<endpoint-fragment>`).

## Step-By-Step Workflow

1. **Confirm the domain and scope** — write down the 2–8 endpoints. If the list
   is one or two endpoints without a coherent theme, stop and reuse
   `requestHandler` instead.
2. **Add the paths to `API_PATHS`** if missing. Group by domain
   (`API_PATHS.VENDORS = { BASE, DETAIL, INVITE, ... }`).
3. **Draft the client** — one method per endpoint. Methods are `Promise<ApiResponse<T>>`.
4. **Wire the fixture** if the client is broadly useful. Add to
   `src/fixtures/api.fixture.ts` following the `pennyRequestsApi` pattern.
5. **Consume from a spec** to prove the shape. Delete inline `requestHandler`
   usages that duplicate the new client.
6. **Validate.**
   ```bash
   npm run validate
   CLIENT=<c> TEST_ENV=<e> npx playwright test <spec> --project=api-testing --list
   ```

## Framework Standards

### File Placement

```text
src/api/clients/<domain>-api.client.ts
src/api/clients/index.ts   ← export the new client
```

### Class Shape

Every client extends `BaseApiClient`. Every method takes `token` first, then
params, then `options?: ApiRequestOptions`. Never mutate shared header state.

```typescript
import { APIRequestContext } from "@playwright/test";
import { API_PATHS } from "../../core/constants/urls";
import { ApiRequestOptions } from "../support/api-transport";
import { BaseApiClient } from "./base-api.client";

export type VendorListParams = {
  page?: string;
  limit?: string;
  status?: "active" | "invited" | "blocked";
};

export class VendorsApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  listVendors<T>(
    token: string | undefined,
    params: VendorListParams = {},
    options?: ApiRequestOptions,
  ) {
    return this.get<T>(API_PATHS.VENDORS.BASE, { ...options, token, params });
  }

  inviteVendor<T>(token: string, body: { email: string }, options?: ApiRequestOptions) {
    return this.post<T>(API_PATHS.VENDORS.INVITE, { ...options, token, body });
  }
}
```

### Naming

- Class: `<Domain>ApiClient` (`VendorsApiClient`, `OrdersApiClient`).
- File: `<domain>-api.client.ts`.
- Fixture: `<domain>Api` (camelCase, drop `Client` suffix — matches
  `pennyRequestsApi`).
- Methods: verbs first — `listVendors`, `inviteVendor`, `getVendorById`,
  `updateVendor`, `deactivateVendor`.

### Fixture Wiring

```typescript
// src/fixtures/api.fixture.ts
import { VendorsApiClient } from "../api/clients/vendors-api.client";

export type ApiFixtures = {
  // …existing…
  vendorsApi: VendorsApiClient;
};

export const test = baseTest.extend<ApiFixtures, ApiWorkerFixtures>({
  // …existing…
  vendorsApi: async ({ request, envConfig }, use) => {
    await use(new VendorsApiClient(request, envConfig.apiUrl));
  },
});
```

Update the ApiFixtures docstring so consumers know what the client covers.

## Output Format

1. **Understanding** — domain + endpoint list.
2. **Files reviewed** — `base-api.client.ts`, `api-transport.ts`, `API_PATHS`,
   sample existing client.
3. **Framework pattern found** — reference client the new one mirrors.
4. **Proposed approach** — client shape, method list, fixture wiring.
5. **Files to create or update** — full list including `API_PATHS`, index
   re-export, fixture.
6. **Generated code** — client + fixture diff.
7. **Test data setup** — usually N/A at this layer; the client is stateless.
8. **Cleanup strategy** — N/A.
9. **Commands to run** — `npm run validate` + `--list`.
10. **Self-review checklist** — below.
11. **Risks / assumptions** — response shape assumptions, auth requirement.
12. **Framework feedback** — surface schema gaps, missing constants, or fixture
    drift.

## Quality Checklist

- Extends `BaseApiClient`; no direct `request.get/post`.
- Every method takes `token` as the first arg and does NOT mutate shared state.
- All endpoints go through `API_PATHS` constants — no inline strings.
- Types are typed generics (`<T>`), not `any`.
- Default params (e.g., `{ page: "0", limit: "10" }`) match existing clients.
- `compactParams`-style helper used when optional params can be `undefined`.
- Client re-exported from `src/api/clients/index.ts`.
- Fixture wired in `api.fixture.ts` if the client is broadly useful.
- `npm run validate` passes.

## Do Not Do

- Do not create a client with a single method for a single test.
- Do not add domain logic (payload building, response parsing) inside the
  client — that belongs in spec `_support/` or a factory.
- Do not accept a `Credentials` object; the client takes tokens only.
- Do not `throw` inside client methods — let `expectedStatus` in transport do that.
- Do not use `any` on the response type — force callers to pass `<T>`.

## Related Skills

- `/penny-api-sdet` — deeper transport / auth reference.
- `/penny-create-standard-code` — naming and typing baseline.
- `/penny-create-api-script` — first consumer of the new client.
- `/penny-schema` — when the client's responses need a stable contract.
- `/penny-review-framework-change` — for review after wiring the fixture.
