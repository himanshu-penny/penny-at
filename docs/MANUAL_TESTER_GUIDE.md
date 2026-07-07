# Manual Tester Guide

This framework can produce a manual-friendly API test report for testers who do
not need to read TypeScript or inspect raw automation logs.

Manual-friendly reporting is framework-level. Any API test that uses the shared
`requestHandler` fixture or a typed API client built on `BaseApiClient`
automatically gets readable steps, expected outcomes, failure hints, and
redacted request/response evidence.

## Run The API Checks

```bash
CLIENT=ewcf TEST_ENV=test npm run test:api:manual
npm run report:allure
```

Use the client and environment you want to validate. For feature branch slots:

```bash
CLIENT=ewcf TEST_ENV=fb-5 npm run test:api:manual
npm run report:allure
```

## What To Review

Open the generated Allure report and review each test case:

- `Overview` shows whether the test passed, failed, or was skipped.
- `Steps` shows what the test did in plain business language.
- `Manual tester guide` explains the purpose, preconditions, expected result,
  and what to check if something fails.
- `Request / Response` shows the redacted API evidence used by the test.
- `docs/API_STATUS_CODES_GUIDE.md` explains what each API status code means,
  with examples and first checks.

The same run also writes a Markdown summary here:

```text
artifacts/reports/meta/summary.md
```

If a test fails, the summary includes the first failure message and any
manual-friendly next checks supplied by the test.

## How To Read A Failure

Start with these checks before raising a product bug:

1. Confirm `CLIENT` and `TEST_ENV` point to the environment you meant to test.
2. Open the failed test in Allure and read `Manual tester guide`.
3. Open `Request / Response` and confirm the API status code and response body.
4. If the failure says authentication failed, confirm the credential file for
   the selected client and environment.
5. If the failure says a field is missing or has the wrong value, compare the
   API response with the UI behavior or expected business rule.

Raise a defect when the environment, credentials, and test data are correct but
the API response does not match the expected result.

## Adding Manual Guidance To Tests

Automation engineers can add manual-friendly context through the `manualGuide`
fixture when a business flow needs wording beyond the automatic API step:

```typescript
test("TC_API_EXAMPLE_001 — the request list is available", async ({
  adminAccessToken,
  manualGuide,
  requestHandler,
}) => {
  manualGuide.case({
    purpose: "Confirm an admin can see the Requests list.",
    preconditions: ["The admin account exists for the selected environment."],
    expectedResult: "The API returns the first page of Requests.",
    failureHints: [
      "If this fails with 401, check admin credentials.",
      "If this fails with 500, check the API logs for the request ID.",
    ],
  });

  const response = await manualGuide.step(
    {
      action: "Open the Requests list",
      expected: "The API returns a successful response.",
    },
    () => requestHandler.path(API_PATHS.REQUESTS.BASE).withToken(adminAccessToken).get(200),
  );

  expect(response).toBeDefined();
});
```

Keep the text in business language. A manual tester should understand what the
user or system is expected to experience without reading the code.

## Default API Guidance

For new API scripts, no extra setup is required when the test uses framework API
helpers:

```typescript
test("TC_API_EXAMPLE_002 — the supplier list is available", async ({ requestHandler }) => {
  const response = await requestHandler.path(API_PATHS.SUPPLIERS.BASE).get(200);

  expect(response).toBeDefined();
});
```

The report automatically adds a step such as `Check supplier information`, an
expected result based on the status code, the actual status, a response summary,
and failure hints for common cases such as `401`, `403`, `404`, `409`, and
`5xx`.

The expected and actual status explanations come from
`src/core/http-status-guide.ts`, which covers all registered HTTP status codes
used by APIs.

If a test uses Playwright's raw `request` fixture directly, wrap the action with
`manualGuide.step()` or move it into `RequestHandler`/`BaseApiClient` so the
framework can generate the guide consistently.
