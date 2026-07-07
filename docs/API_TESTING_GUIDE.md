# API Testing Guide

## Two Approaches

### 1. OOP API Clients (Recommended for structured testing)

Extend `BaseApiClient` for clean, typed API clients:

```typescript
// src/api/clients/requests.api.client.ts
export class RequestsApiClient extends BaseApiClient {
  async list(token: string): Promise<ApiResponse<RequestsListResponse>> {
    return this.get<RequestsListResponse>(API_PATHS.REQUESTS.BASE, { token });
  }
}
```

Use the shared Penny client fixtures when they cover the endpoint:

```typescript
test("requests list returns data", async ({ pennyRequestsApi, adminAccessToken }) => {
  const response = await pennyRequestsApi.listRequests(adminAccessToken);

  expect(response.statusCode).toBe(200);
  expect(response.data).toBeDefined();
});
```

### 2. Fluent RequestHandler (For fine-grained control)

Use the builder pattern when you need precise control:

```typescript
test("custom API request", async ({ requestHandler, adminAccessToken }) => {
  const response = await requestHandler
    .path(API_PATHS.REQUESTS.BASE)
    .params({ page: "0", limit: "10" })
    .withToken(adminAccessToken)
    .get(200);

  expect(response.requests.length).toBeGreaterThan(0);
});
```

Both approaches use the same API transport layer:

- request and response logging with sensitive values redacted
- Allure request/response attachments with tokens, passwords, cookies, and secrets redacted
- manual-friendly report steps with expected outcomes and next-check guidance
- HTTP status explanations from the shared status guide in `src/core/http-status-guide.ts`
- retries for network errors, timeouts, HTTP 408, HTTP 429, 5xx responses, and Penny write-conflict 409 responses
- consistent `ApiError` messages and parsed response bodies

See `docs/API_STATUS_CODES_GUIDE.md` for the manual-tester explanation and
example for each registered HTTP status code.

## Test Folder Layout

Use the folder that matches the behavior under test:

```text
src/tests/
  framework/api/              # framework/reporting demos, not client business coverage
  shared/api/                 # Penny API behavior expected to work for every client
  sabil/api/integrations/     # Sabil-specific API integration behavior
  <client>/api/               # future client-specific API behavior
```

Rules of thumb:

- Put cross-client Penny behavior under `src/tests/shared/api`.
- Put client-specific behavior under `src/tests/<client>/api`.
- Put framework demonstration checks under `src/tests/framework/api`.
- Keep feature helpers near the feature, usually in `_support`.
- Use short file names once the folder already names the client or feature.

## Schema Validation

Validate response structure against a JSON Schema:

```typescript
import { validateSchema, loadSchema } from "@api/schema-validator";

test("GET /api/request matches schema", async ({ requestHandler, adminAccessToken }) => {
  const response = await requestHandler
    .path(API_PATHS.REQUESTS.BASE)
    .withToken(adminAccessToken)
    .get(200);

  validateSchema(response, loadSchema("requests/GET_requests_schema.json"), "GET /api/request");
});
```

For OOP clients that return `ApiResponse<T>`, validate the normalized `data` property:

```typescript
import { validateApiResponseSchema, loadSchema } from "@api/schema-validator";

const response = await pennyRequestsApi.listRequests(adminAccessToken);
validateApiResponseSchema(
  response,
  loadSchema("requests/GET_requests_schema.json"),
  "GET /api/request",
);
```

### Creating New Schema Files

1. Get a real response from the API
2. Generate a schema (or write one manually):

```typescript
import { generateSchema } from "../../api/schema-validator";
const schema = generateSchema(responseBody);
console.log(JSON.stringify(schema, null, 2));
```

3. Save to `test-data/response-schemas/<endpoint>/<METHOD>_schema.json`
4. Use `loadSchema()` in tests

## Authentication Patterns

Credentials are only for logging in. Do not pass a password to `.withToken()` or to a
client method that expects a bearer token.

### Use token fixtures for common roles:

```typescript
test("authenticated request", async ({ pennyRequestsApi, adminAccessToken }) => {
  const response = await pennyRequestsApi.listRequests(adminAccessToken);
  expect(response.statusCode).toBe(200);
});
```

Use `loginAs("user" | "admin")` when a test needs the full session object.
Use `authApi.login(role)` when testing or debugging login behavior itself.

## Testing Error Responses

```typescript
test("401 without auth token", async ({ pennyRequestsApi }) => {
  const response = await pennyRequestsApi.listRequests(undefined, {}, { expectedStatus: 401 });
  expect(response.statusCode).toBe(401);
});
```

## Request/Response Logging

All API requests are automatically logged by the framework's logger. Logs and Allure attachments
redact sensitive fields such as `Authorization`, cookies, passwords, tokens, and secrets.

To adjust verbosity:

```bash
LOG_LEVEL=DEBUG npm test  # Show all logs including request bodies
LOG_LEVEL=ERROR npm test  # Show errors only
```

## Allure Reporting

Use the normal test scripts for clean Playwright HTML output:

```bash
CLIENT=ewcf TEST_ENV=fb npm run test:api
```

Use the Allure-specific scripts when you want richer Allure labels and
parameters:

```bash
CLIENT=ewcf TEST_ENV=fb npm run test:api:allure
npm run report:allure
```

Use the manual-friendly API run when a manual tester needs to understand what
each check is doing, what result is expected, and what to review if the check
fails:

```bash
CLIENT=ewcf TEST_ENV=fb npm run test:api:manual
npm run report:allure
```

The report automatically includes environment details, executor metadata,
failure categories, redacted request/response attachments, and preserved history
for local trend graphs.

Tests can add purpose, expected result, and next-check guidance with the
`manualGuide` fixture. See [Manual Tester Guide](MANUAL_TESTER_GUIDE.md) for
the full workflow and example.

Manual guidance is automatic for API calls made through `RequestHandler` or
typed clients extending `BaseApiClient`. Add `manualGuide.case()` or
`manualGuide.step()` only when a complex business flow needs more explanation
than the generic API step can infer.

## Sabil Integration Cycle

The Postman collection `Sabil Penny Integration (Full Cycle)` is automated as:

```text
src/tests/sabil/api/integrations/full-cycle.spec.ts
```

Run Penny inbound-only checks:

```bash
CLIENT=ewcf TEST_ENV=fb SABIL_ORG_CODE=sabil \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

If the Sabil integration routes are not hosted on the normal `envConfig.apiUrl`,
provide the Postman `pennyBaseUrl` equivalent:

```bash
CLIENT=ewcf TEST_ENV=fb SABIL_ORG_CODE=sabil \
SABIL_PENNY_BASE_URL=https://your-penny-integration-gateway \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

For the Sabil fb host, the current integration base is:

```bash
CLIENT=sabil TEST_ENV=fb SABIL_ORG_CODE=<enabled-org-code> \
SABIL_PENNY_BASE_URL=https://api-sabil.tst.penny.co/api \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

If `SABIL_ORG_CODE` is not enabled for Sabil integration, the health check returns
`403 Sabil integration is not enabled for this organization`.

Run the full inbound and outbound lifecycle by adding the Sabil/SAP receiver:

```bash
CLIENT=ewcf TEST_ENV=fb SABIL_ORG_CODE=sabil \
SABIL_PENNY_BASE_URL=https://your-penny-integration-gateway \
SABIL_BASE_URL=https://sap-sabil.example.test \
SABIL_SAP_USERNAME='***' SABIL_SAP_PASSWORD='***' \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

Optional overrides include `SABIL_INBOUND_TOKEN`, `SABIL_RUN_ID`,
`SABIL_PR_ID`, `SABIL_ORDER_ID`, `SABIL_VENDOR_PENNY_ID`,
`SABIL_SAP_VENDOR_CODE`, `SABIL_SAP_PO_NUMBER`, `SABIL_GRN_REFERENCE`,
`SABIL_SAP_GRN_NUMBER`, `SABIL_BILL_ID`, `SABIL_SAP_INVOICE_NUMBER`, and
`SABIL_PAYMENT_REFERENCE`.
