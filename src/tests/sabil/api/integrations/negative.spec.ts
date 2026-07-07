import { test, expect } from "@fixtures";
import type { RequestHandler } from "@api/support";
import { API_PATHS } from "@core/constants/urls";
import { addAllureParameter } from "@utils/helpers/allure-metadata.helper";
import { corruptedBase64, optionalEnv, unsupportedFileTypeAttachment } from "@utils/helpers";
import {
  buildCreatePrPayload,
  buildGrnCallbackPayload,
  buildInvoiceSyncPayload,
  buildPaymentConfirmationPayload,
  buildPoSyncPayload,
  buildVendorMasterPayload,
  buildVendorSyncPayload,
  cloneSabilPayload,
  createSabilLifecycleData,
  expectedSabilStatus,
  getSabilInboundAuthHeaders,
  getSabilInboundHeaders,
  getSabilInboundPath,
  getSabilInboundToken,
  getSabilOutboundConfig,
  postRawInboundJson,
  SabilLifecycleData,
  SabilOutboundConfig,
  withFirstSabilItemField,
  withSabilAttachment,
  withSabilField,
  withoutNestedSabilField,
  withoutSabilField,
} from "./_support/sabil-integration.helpers";

test.describe(
  "TC_API_SABIL_NEGATIVE — Sabil integration safeguards and edge cases",
  { tag: ["@regression", "@api", "@critical", "@sabil"] },
  () => {
    let lifecycle: SabilLifecycleData;
    let outbound: SabilOutboundConfig | undefined;

    test.beforeEach(async ({ envConfig }, testInfo) => {
      lifecycle = createSabilLifecycleData(envConfig);
      outbound = getSabilOutboundConfig();

      const automationCaseId = testInfo.title.match(/^(TC_API_SABIL_NEG_\d+)/)?.[1];
      if (automationCaseId) await addAllureParameter("Automation Case ID", automationCaseId);
      await addAllureParameter("Sabil org code", lifecycle.orgCode);
      await addAllureParameter("Penny integration URL", lifecycle.pennyBaseUrl);
      await addAllureParameter("PR ID", lifecycle.prId);
      await addAllureParameter("Order ID", lifecycle.orderId);
    });

    test("TC_API_SABIL_NEG_001 — requests without an organisation code are rejected", async ({
      requestHandler,
    }) => {
      const response = await requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .retry(false)
        .get<unknown>(expectedSabilStatus("SABIL_EXPECTED_MISSING_ORG_STATUS", 403));

      expect(response, "The API should return a controlled rejection response").toBeDefined();
    });

    test("TC_API_SABIL_NEG_002 — requests for an organisation without Sabil enabled are rejected", async ({
      requestHandler,
    }) => {
      const disabledOrgCode = optionalEnv("SABIL_DISABLED_ORG_CODE") ?? "idola";

      const response = await requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .headers({ "X-ORG-CODE": disabledOrgCode })
        .retry(false)
        .get<unknown>(expectedSabilStatus("SABIL_EXPECTED_DISABLED_ORG_STATUS", 403));

      expect(response, "The API should reject organisations that are not enabled").toBeDefined();
    });

    test("TC_API_SABIL_NEG_003 — requests with an unknown organisation code are rejected", async ({
      requestHandler,
    }) => {
      const response = await requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .headers({ "X-ORG-CODE": `unknown-${Date.now()}` })
        .retry(false)
        .get<unknown>(expectedSabilStatus("SABIL_EXPECTED_INVALID_ORG_STATUS", 403));

      expect(response, "The API should reject unknown organisations").toBeDefined();
    });

    test("TC_API_SABIL_NEG_004 — requests with an invalid bearer token are rejected", async ({
      requestHandler,
    }) => {
      const response = await requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .headers(getSabilInboundHeaders(lifecycle))
        .withToken("invalid-token-for-negative-coverage")
        .retry(false)
        .get<unknown>(expectedSabilStatus("SABIL_EXPECTED_INVALID_TOKEN_STATUS", 401));

      expect(response, "The API should reject invalid credentials").toBeDefined();
    });

    test("TC_API_SABIL_NEG_005 — malformed purchase request JSON is rejected cleanly", async ({
      request,
    }) => {
      const expectedStatus = expectedSabilStatus("SABIL_EXPECTED_MALFORMED_JSON_STATUS", 400);
      const response = await postRawInboundJson(
        request,
        lifecycle,
        API_PATHS.SABIL.PR,
        '{"Indicator":"Create","prId":',
      );

      expect(response.status, "The API should reject malformed JSON").toBe(expectedStatus);
      expect(
        response.body,
        "The API should reject malformed JSON with a controlled response body",
      ).not.toBe("");
    });

    test("TC_API_SABIL_NEG_006 — an unsupported purchase request indicator is rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withSabilField(buildCreatePrPayload(lifecycle), "Indicator", "Archive"),
        expectedSabilStatus("SABIL_EXPECTED_UNSUPPORTED_INDICATOR_STATUS", 400),
      );

      expect(response, "The API should reject unsupported purchase request actions").toBeDefined();
    });

    test("TC_API_SABIL_NEG_007 — a purchase request without a PR ID is rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withoutSabilField(buildCreatePrPayload(lifecycle), "prId"),
        expectedSabilStatus("SABIL_EXPECTED_MISSING_REQUIRED_STATUS", 400),
      );

      expect(
        response,
        "The API should reject missing required purchase request data",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_008 — invalid item quantity values are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withFirstSabilItemField(buildCreatePrPayload(lifecycle), "quantity", "not-a-number"),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_NUMERIC_STATUS", 400),
      );

      expect(response, "The API should reject invalid numeric item fields").toBeDefined();
    });

    test("TC_API_SABIL_NEG_009 — invalid item boolean values are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withFirstSabilItemField(buildCreatePrPayload(lifecycle), "batchEnabled", "maybe"),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_BOOLEAN_STATUS", 400),
      );

      expect(response, "The API should reject invalid boolean item fields").toBeDefined();
    });

    test("TC_API_SABIL_NEG_010 — duplicate purchase request IDs do not create duplicate business records", async ({
      requestHandler,
    }) => {
      const payload = buildCreatePrPayload(lifecycle);
      await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        payload,
        expectedSabilStatus("SABIL_EXPECTED_CREATE_PR_STATUS", 201),
      );

      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        cloneSabilPayload(payload),
        expectedSabilStatus("SABIL_EXPECTED_DUPLICATE_PR_STATUS", 409),
      );

      expect(response, "The API should handle duplicate purchase request IDs safely").toBeDefined();
    });

    test("TC_API_SABIL_NEG_011 — purchase order callbacks before the purchase request exists are rejected", async ({
      requestHandler,
    }) => {
      lifecycle.prId = `missing-pr-${Date.now()}`;
      lifecycle.orderId = `missing-po-${Date.now()}`;

      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PO_SYNC,
        buildPoSyncPayload(lifecycle, "APPROVED"),
        expectedSabilStatus("SABIL_EXPECTED_PO_BEFORE_PR_STATUS", 404),
      );

      expect(response, "The API should reject purchase orders for unknown requests").toBeDefined();
    });

    test("TC_API_SABIL_NEG_012 — goods receipt callbacks before an approved purchase order are rejected", async ({
      requestHandler,
    }) => {
      lifecycle.sapPoNumber = `missing-sap-po-${Date.now()}`;

      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.GRN,
        buildGrnCallbackPayload(lifecycle),
        expectedSabilStatus("SABIL_EXPECTED_GRN_BEFORE_PO_STATUS", 409),
      );

      expect(response, "The API should reject goods receipts before the PO is ready").toBeDefined();
    });

    test("TC_API_SABIL_NEG_013 — invoice callbacks before the bill is ready are rejected", async ({
      requestHandler,
    }) => {
      lifecycle.billId = `missing-bill-${Date.now()}`;

      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.BILL_SYNC,
        buildInvoiceSyncPayload(lifecycle),
        expectedSabilStatus("SABIL_EXPECTED_INVOICE_BEFORE_BILL_STATUS", 409),
      );

      expect(
        response,
        "The API should reject invoice callbacks before the bill is ready",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_014 — payment confirmations before invoice sync are rejected", async ({
      requestHandler,
    }) => {
      lifecycle.billId = `missing-invoice-${Date.now()}`;

      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PAYMENT_CONFIRM,
        buildPaymentConfirmationPayload(lifecycle),
        expectedSabilStatus("SABIL_EXPECTED_PAYMENT_BEFORE_INVOICE_STATUS", 409),
      );

      expect(
        response,
        "The API should reject payments before invoice sync is complete",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_015 — vendor sync callbacks without a Penny vendor ID are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.VENDOR_SYNC,
        withoutNestedSabilField(buildVendorSyncPayload(lifecycle), "vendor.pennyIdForSupplier"),
        expectedSabilStatus("SABIL_EXPECTED_MISSING_REQUIRED_STATUS", 400),
      );

      expect(
        response,
        "The API should reject vendor callbacks without a Penny vendor ID",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_016 — corrupted attachment content is rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withSabilAttachment(buildCreatePrPayload(lifecycle), {
          image: corruptedBase64(),
        }),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS", 400),
      );

      expect(response, "The API should reject corrupted attachment content").toBeDefined();
    });

    test("TC_API_SABIL_NEG_017 — unsupported attachment file types are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withSabilAttachment(buildCreatePrPayload(lifecycle), unsupportedFileTypeAttachment()),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS", 400),
      );

      expect(response, "The API should reject unsupported attachment file types").toBeDefined();
    });

    test("TC_API_SABIL_NEG_018 — attachment names containing path traversal sequences are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withSabilAttachment(buildCreatePrPayload(lifecycle), {
          name: "../../etc/passwd.pdf",
        }),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS", 400),
      );

      expect(
        response,
        "The API should reject path-traversal patterns in attachment names",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_018b — attachment names containing control characters are rejected", async ({
      requestHandler,
    }) => {
      const response = await inboundPost(
        requestHandler,
        lifecycle,
        API_PATHS.SABIL.PR,
        withSabilAttachment(buildCreatePrPayload(lifecycle), {
          name: `invoice${String.fromCharCode(0, 7)}.pdf`,
        }),
        expectedSabilStatus("SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS", 400),
      );

      expect(
        response,
        "The API should reject control characters in attachment names",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_019 — sending a valid purchase request under a different tenant's org code is rejected", async ({
      requestHandler,
    }) => {
      const foreignOrgCode = optionalEnv("SABIL_DISABLED_ORG_CODE") ?? "idola";
      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.PR))
        .headers({
          ...getSabilInboundHeaders(lifecycle),
          "X-ORG-CODE": foreignOrgCode,
        })
        .body(buildCreatePrPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await builder
        .retry(false)
        .post<unknown>(expectedSabilStatus("SABIL_EXPECTED_CROSS_TENANT_STATUS", 403));

      expect(
        response,
        "A tenant should not be able to submit data under another org's code",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_020 — the health endpoint rejects methods other than GET", async ({
      requestHandler,
    }) => {
      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .headers({
          ...getSabilInboundHeaders(lifecycle),
          ...getSabilInboundAuthHeaders(),
        })
        .body({});

      const response = await builder
        .retry(false)
        .post<unknown>(expectedSabilStatus("SABIL_EXPECTED_METHOD_NOT_ALLOWED_STATUS", 404));

      expect(
        response,
        "POSTing to the health endpoint should be rejected as method-not-allowed or not-found",
      ).toBeDefined();
    });

    test("TC_API_SABIL_NEG_021 — Sabil rejects a vendor master payload that is missing required identity fields", async ({
      requestHandler,
    }) => {
      test.skip(
        !outbound,
        "Set SABIL_BASE_URL to run outbound Penny to Sabil checks. For readiness runs, set SABIL_REQUIRE_OUTBOUND=true.",
      );
      const outboundConfig = outbound as SabilOutboundConfig;

      const payload = buildVendorMasterPayload(lifecycle);
      const identity = (payload.identity as Record<string, unknown>) ?? {};
      identity.pennyIdForSupplier = "";
      identity.supplierName = "";

      const response = await requestHandler
        .url(outboundConfig.baseUrl)
        .path(API_PATHS.SABIL_OUTBOUND.VENDOR_MASTER)
        .headers(outboundConfig.headers)
        .body(payload)
        .retry(false)
        .post<unknown>(expectedSabilStatus("SABIL_EXPECTED_OUTBOUND_BAD_REQUEST_STATUS", 400));

      expect(
        response,
        "Sabil should reject an outbound vendor master with missing required identity fields",
      ).toBeDefined();
    });
  },
);

async function inboundPost(
  requestHandler: RequestHandler,
  lifecycle: SabilLifecycleData,
  path: string,
  payload: Record<string, unknown>,
  expectedStatus: number,
): Promise<unknown> {
  const builder = requestHandler
    .url(lifecycle.pennyBaseUrl)
    .path(getSabilInboundPath(lifecycle, path))
    .headers(getSabilInboundHeaders(lifecycle));

  const inboundToken = getSabilInboundToken();
  const requestBuilder = inboundToken ? builder.withToken(inboundToken) : builder;

  return requestBuilder.body(payload).retry(false).post<unknown>(expectedStatus);
}
