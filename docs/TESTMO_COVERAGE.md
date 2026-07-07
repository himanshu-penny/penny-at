# Testmo Coverage Notes

Source analyzed locally:

```text
/Users/Montu/Downloads/testmo-export-repository-2(1).csv
```

This corrected export replaces the earlier broad repository export. It contains
36 active Sabil Integration cases, all under the `Common` module and
`Integration / API` test type.

## Corrected Export Summary

| Metric        |         Count |
| ------------- | ------------: |
| Total cases   |            36 |
| Manual        |            36 |
| Automated     |             0 |
| Case ID range | 316961-316996 |

## Automated Now

The executable coverage lives here:

```text
src/tests/sabil/api/integrations/full-cycle.spec.ts
src/tests/sabil/api/integrations/negative.spec.ts
```

Current executable Sabil API coverage:

| Suite                     | Tests | Purpose                                                |
| ------------------------- | ----: | ------------------------------------------------------ |
| Full lifecycle            |    13 | Main Penny ↔ Sabil procurement integration flow        |
| Safeguards and edge cases |    18 | Negative, ordering, tenant, payload, attachment checks |
| Total                     |    31 | Test-env promotion confidence coverage                 |

Positive Sabil tests require a JSON object response body and reject response
bodies that carry error/status failure fields. Negative write tests disable
transport retries so an unexpected successful response is not re-sent and does
not create duplicate audit or business records.

| Testmo case | Coverage in framework                                                   |
| ----------- | ----------------------------------------------------------------------- |
| 316961      | Sabil health endpoint responds without exposing secrets                 |
| 316963      | SAP can create a Penny PR through inbound PR intake                     |
| 316964      | PR intake accepts SAP string-form numeric and boolean item fields       |
| 316972      | PO sync accepts SAP PO document type data                               |
| 316973      | PO sync accepts SAP last approver data                                  |
| 316975      | PO approved callback path is represented in lifecycle sync              |
| 316976      | Bill and invoice outbound payload includes attachment data when present |
| 316977      | Bill and invoice outbound payload supports the no-attachment path       |
| 316978      | Invoice sync callback path is represented                               |
| 316988      | Payment confirmation callback path is represented                       |
| 316994      | RFQ created outbound payload path is represented                        |
| 316995      | Vendor master outbound and vendor sync callback paths are represented   |
| 316996      | GRN outbound and callback paths are represented                         |

Additional negative and edge coverage:

| Test ID              | Coverage                                                       |
| -------------------- | -------------------------------------------------------------- |
| TC_API_SABIL_NEG_001 | Missing organisation code is rejected                          |
| TC_API_SABIL_NEG_002 | Organisation without Sabil enabled is rejected                 |
| TC_API_SABIL_NEG_003 | Unknown organisation code is rejected                          |
| TC_API_SABIL_NEG_004 | Invalid bearer token is rejected when inbound auth is enforced |
| TC_API_SABIL_NEG_005 | Malformed JSON is rejected cleanly                             |
| TC_API_SABIL_NEG_006 | Unsupported purchase request indicator is rejected             |
| TC_API_SABIL_NEG_007 | Missing PR ID is rejected                                      |
| TC_API_SABIL_NEG_008 | Invalid numeric item values are rejected                       |
| TC_API_SABIL_NEG_009 | Invalid boolean item values are rejected                       |
| TC_API_SABIL_NEG_010 | Duplicate PR IDs do not create duplicate business records      |
| TC_API_SABIL_NEG_011 | PO callbacks before PR creation are rejected                   |
| TC_API_SABIL_NEG_012 | GRN callbacks before approved PO state are rejected            |
| TC_API_SABIL_NEG_013 | Invoice callbacks before bill readiness are rejected           |
| TC_API_SABIL_NEG_014 | Payment confirmations before invoice sync are rejected         |
| TC_API_SABIL_NEG_015 | Vendor sync callbacks without Penny vendor ID are rejected     |
| TC_API_SABIL_NEG_016 | Corrupted attachment content is rejected                       |
| TC_API_SABIL_NEG_017 | Unsupported attachment file types are rejected                 |
| TC_API_SABIL_NEG_018 | Unsafe attachment names are rejected                           |

Outbound Penny-to-Sabil checks are skipped unless `SABIL_BASE_URL` is set:

```bash
SABIL_BASE_URL=https://your-sabil-sap-url
SABIL_SAP_USERNAME='***'
SABIL_SAP_PASSWORD='***'
```

For readiness/promotion runs, make missing outbound configuration fail loudly:

```bash
SABIL_REQUIRE_OUTBOUND=true
```

Inbound callbacks use `X-ORG-CODE` from `SABIL_ORG_CODE`. If the environment
requires bearer auth for Sabil callbacks, also set:

```bash
SABIL_INBOUND_TOKEN='***'
```

If the Sabil integration routes are hosted on a gateway different from
`envConfig.apiUrl`, set:

```bash
SABIL_PENNY_BASE_URL=https://your-penny-integration-gateway
```

Current `ewcf/fb` probe results:

| URL checked                                                            | Result           |
| ---------------------------------------------------------------------- | ---------------- |
| `https://api-fb-5.tst.penny.co/integrations/sabil/requests/health`     | `404 Cannot GET` |
| `https://api-fb-5.tst.penny.co/api/integrations/sabil/requests/health` | `404 Cannot GET` |
| `https://fb-5.tst.penny.co/integrations/sabil/requests/health`         | `404 nginx`      |
| `https://fb-5.tst.penny.co/api/integrations/sabil/requests/health`     | `404 Cannot GET` |

Current `sabil/fb` probe result:

| URL checked                                                             | Result                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `https://api-sabil.tst.penny.co/api/integrations/sabil/requests/health` | `403 Sabil integration is not enabled for this organization` |

That confirms the `/api/integrations/...` route exists on the Sabil host. To run
successfully, use an org code with Sabil integration enabled or enable the feature
flag for the current org.

## Contract Tuning

Negative expected statuses can be tuned per environment without changing the
specs:

```bash
SABIL_EXPECTED_MISSING_ORG_STATUS=403
SABIL_EXPECTED_CREATE_PR_STATUS=201
SABIL_EXPECTED_INVALID_ORG_STATUS=403
SABIL_EXPECTED_INVALID_TOKEN_STATUS=401
SABIL_EXPECTED_UNSUPPORTED_INDICATOR_STATUS=400
SABIL_EXPECTED_MISSING_REQUIRED_STATUS=400
SABIL_EXPECTED_INVALID_NUMERIC_STATUS=400
SABIL_EXPECTED_INVALID_BOOLEAN_STATUS=400
SABIL_EXPECTED_DUPLICATE_PR_STATUS=409
SABIL_EXPECTED_PO_BEFORE_PR_STATUS=404
SABIL_EXPECTED_GRN_BEFORE_PO_STATUS=409
SABIL_EXPECTED_INVOICE_BEFORE_BILL_STATUS=409
SABIL_EXPECTED_PAYMENT_BEFORE_INVOICE_STATUS=409
SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS=400
```

When these expectations are confirmed and the suite passes against an enabled
org with real outbound configuration, the Sabil integration automation is ready
to support production configuration promotion.

## Still Needs Confirmed Contracts

These cases require missing endpoint/UI contracts, seeded PR/PO/Bill data, SAP
mock behavior, or attachment/upload contracts before they should be automated as
durable tests:

| Testmo cases  | Blocker                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| 316962        | Requires ability to disable Sabil integration and inspect no outbound call/status         |
| 316965-316966 | Need confirmed validation statuses for unsupported Indicator and missing/invalid org code |
| 316967-316974 | Require Phase 2 PR/PO field names, UI locations, and persisted data contract              |
| 316969-316971 | Require SAP PR attachment schema and UI/download contract                                 |
| 316979-316983 | Require Bill attachment status, retry, file-type, size, and sanitization contracts        |
| 316984-316987 | Require explicit auth/RBAC/tenant-isolation fixtures and expected status codes            |
| 316989        | Requires confirmed behavior for missing/not-ready invoice callbacks                       |
| 316990-316991 | Require Arabic/RTL/accessibility UI page coverage                                         |
| 316992-316993 | Require concurrency and max-file-size test harness/SLA                                    |

## Run Command

```bash
CLIENT=ewcf TEST_ENV=fb SABIL_ORG_CODE=sabil \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

Run against a separate Penny integration gateway:

```bash
CLIENT=ewcf TEST_ENV=fb SABIL_ORG_CODE=sabil \
SABIL_PENNY_BASE_URL=https://your-penny-integration-gateway \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```

Run against Sabil fb:

```bash
CLIENT=sabil TEST_ENV=fb SABIL_ORG_CODE=<enabled-org-code> \
SABIL_PENNY_BASE_URL=https://api-sabil.tst.penny.co/api \
npx playwright test src/tests/sabil/api/integrations/full-cycle.spec.ts --project=api-testing
```
