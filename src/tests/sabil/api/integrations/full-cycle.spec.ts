import { test } from "@fixtures";
import { API_PATHS } from "@core/constants/urls";
import { addAllureParameter } from "@utils/helpers/allure-metadata.helper";
import type { ManualTestHelper } from "@utils/helpers";
import {
  buildBillInvoicePayload,
  buildCreatePrPayload,
  buildGrnCallbackPayload,
  buildGrnCompletedPayload,
  buildInvoiceSyncPayload,
  buildPaymentConfirmationPayload,
  buildPoDraftedPayload,
  buildPoSyncPayload,
  buildRfqCreatedPayload,
  buildVendorMasterPayload,
  buildVendorSyncPayload,
  captureSapGrnNumber,
  captureSapInvoiceNumber,
  captureSapVendorCode,
  createSabilLifecycleData,
  expectSabilResponseAccepted,
  getSabilInboundHeaders,
  getSabilInboundPath,
  getSabilInboundToken,
  getSabilOutboundConfig,
  SabilLifecycleData,
  SabilOutboundConfig,
} from "./_support/sabil-integration.helpers";

const OUTBOUND_SKIP_REASON =
  "This check needs a Sabil/SAP receiver URL. Set SABIL_BASE_URL to run the outbound part of the cycle.";

type SabilManualGuideOptions = {
  purpose: string;
  expectedResult: string[];
  failureHints?: string[];
  businessData?: Record<string, unknown>;
  requiresOutbound?: boolean;
};

type SabilBusinessResultOptions = {
  action: string;
  context: string;
  expected: string;
  failureHints?: string[];
};

function startSabilManualGuide(
  manualGuide: ManualTestHelper,
  lifecycle: SabilLifecycleData,
  options: SabilManualGuideOptions,
): void {
  manualGuide.case({
    purpose: options.purpose,
    preconditions: [
      "The selected Penny environment is reachable.",
      "The Sabil organisation is enabled for this environment.",
      "The test data shown in the report belongs to the current run.",
      ...(options.requiresOutbound
        ? ["A Sabil/SAP receiver URL is configured so Penny can send messages out."]
        : []),
    ],
    expectedResult: options.expectedResult,
    failureHints: [
      ...(options.failureHints ?? []),
      "Confirm the client, environment, and Sabil organisation code are the intended ones.",
      "Open the Request / Response evidence and read the response message in plain language first.",
    ],
    testData: {
      "Sabil organisation": lifecycle.orgCode,
      "Purchase request": lifecycle.prId,
      "Purchase order": lifecycle.orderId,
      "SAP purchase order": lifecycle.sapPoNumber,
      "Vendor record": lifecycle.vendorPennyId,
      "Penny integration": lifecycle.pennyBaseUrl,
      ...(options.businessData ?? {}),
    },
  });
}

async function confirmBusinessResult(
  manualGuide: ManualTestHelper,
  response: unknown,
  options: SabilBusinessResultOptions,
): Promise<void> {
  await manualGuide.step(
    {
      action: options.action,
      expected: options.expected,
      failureHints: [
        "Look at the response message to see which business record or field was rejected.",
        ...(options.failureHints ?? []),
      ],
      evidence: { response },
    },
    async () => {
      expectSabilResponseAccepted(response, options.context);
    },
  );
}

test.describe(
  "TC_API_SABIL — Penny and Sabil procurement lifecycle integration",
  { tag: ["@regression", "@api", "@critical", "@sabil"] },
  () => {
    test.describe.configure({ mode: "serial" });

    let lifecycle: SabilLifecycleData;
    let outbound: SabilOutboundConfig | undefined;

    test.beforeEach(async ({ envConfig }, testInfo) => {
      if (!lifecycle || testInfo.retry > 0) {
        lifecycle = createSabilLifecycleData(envConfig);
      }
      if (!outbound || testInfo.retry > 0) {
        outbound = getSabilOutboundConfig();
      }

      await addAllureParameter("Sabil org code", lifecycle.orgCode);
      await addAllureParameter("Penny integration URL", lifecycle.pennyBaseUrl);
      await addAllureParameter("Sabil outbound configured", String(Boolean(outbound)));
      await addAllureParameter("PR ID", lifecycle.prId);
      await addAllureParameter("Order ID", lifecycle.orderId);
      await addAllureParameter("Vendor Penny ID", lifecycle.vendorPennyId);
    });

    test("TC_API_SABIL_316961 — Sabil integration health check returns a safe liveness response", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Penny is ready to receive Sabil procurement messages before the cycle starts.",
        expectedResult: [
          "Penny confirms the Sabil connection is available.",
          "The response does not show a setup, permission, or organisation error.",
        ],
        failureHints: [
          "If this fails before any procurement step, check whether the Sabil organisation is enabled.",
          "If the environment is unreachable, confirm network access to the Penny integration URL.",
        ],
        businessData: { "Business moment": "Readiness check before sending procurement data" },
      });
      await addAllureParameter("Testmo Case IDs", "316961");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.HEALTH))
        .headers(getSabilInboundHeaders(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Ask Penny whether the Sabil connection is ready",
          expected: "Penny replies that the Sabil connection is available.",
          failureHints: [
            "Check whether the organisation code in the report is enabled for Sabil.",
            "Check whether the Penny integration URL is reachable from this machine.",
          ],
        },
        () => builder.get(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm the readiness response is safe to continue",
        context: "Sabil health check",
        expected: "The response says the connection is healthy and does not contain an error.",
      });
    });

    test("TC_API_SABIL_316963_316964 — SAP can send a purchase request with string numeric fields", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Sabil can send a purchase request to Penny even when quantity and price arrive as text.",
        expectedResult: [
          "Penny creates or accepts the purchase request.",
          "The response links the new Penny request to the Sabil purchase request number.",
        ],
        failureHints: [
          "If Penny rejects a number field, compare the quantity and price values in the evidence.",
          "If this creates a duplicate, use a fresh SABIL_RUN_ID or purchase request number.",
        ],
        businessData: { "Business moment": "Sabil sends a new purchase request to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316963, 316964");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.PR))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildCreatePrPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send a new purchase request from Sabil to Penny",
          expected: "Penny accepts the request and creates the procurement request record.",
          failureHints: [
            "Check the purchase request number and line item values in the Request / Response evidence.",
            "Check whether the same purchase request number was already used in this environment.",
          ],
        },
        () => builder.post<unknown>(201),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny created the purchase request",
        context: "Create purchase request",
        expected: "The response confirms that Penny accepted the purchase request.",
      });
    });

    test("TC_API_SABIL_316963_MULTI — SAP can send a purchase request with multiple line items", async ({
      requestHandler,
      envConfig,
      manualGuide,
    }) => {
      await addAllureParameter("Testmo Case IDs", "316963");

      const multiItemLifecycle = createSabilLifecycleData(envConfig);
      multiItemLifecycle.prId = `${multiItemLifecycle.prId}-MI`;
      startSabilManualGuide(manualGuide, multiItemLifecycle, {
        purpose:
          "Confirm Sabil can send one purchase request with several items and Penny keeps all of them.",
        expectedResult: [
          "Penny accepts the purchase request.",
          "The response shows that all three line items were received.",
        ],
        failureHints: [
          "If the item count is wrong, compare the line items in the request evidence.",
          "If Penny rejects the request, check whether any line item is missing required business data.",
        ],
        businessData: {
          "Business moment": "Sabil sends one purchase request containing three items",
          "Expected line items": 3,
        },
      });
      const payload = buildCreatePrPayload(multiItemLifecycle, { itemCount: 3 });

      const builder = requestHandler
        .url(multiItemLifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(multiItemLifecycle, API_PATHS.SABIL.PR))
        .headers(getSabilInboundHeaders(multiItemLifecycle))
        .body(payload);

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send a purchase request with three line items",
          expected: "Penny accepts the request and keeps the three item lines together.",
          failureHints: [
            "Check the item list in the request evidence and confirm there are three item lines.",
          ],
        },
        () => builder.post<unknown>(201),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny accepted every line item",
        context: "Multi-item purchase request",
        expected: "The response confirms the multi-item purchase request was accepted.",
      });
    });

    test("TC_API_SABIL_316994 — Penny can notify Sabil that an RFQ was created", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Penny can tell Sabil that the purchase request has moved forward to an RFQ.",
        expectedResult: [
          "Sabil receives the RFQ-created notification from Penny.",
          "Sabil accepts the notification without returning an error.",
        ],
        failureHints: [
          "If this is skipped, configure SABIL_BASE_URL for the Sabil/SAP receiver.",
          "If Sabil rejects the message, check whether the purchase request number exists in Sabil.",
        ],
        businessData: { "Business moment": "Penny notifies Sabil that RFQ work has started" },
        requiresOutbound: true,
      });
      await addAllureParameter("Testmo Case IDs", "316994");
      test.skip(!outbound, OUTBOUND_SKIP_REASON);
      const outboundConfig = outbound as SabilOutboundConfig;

      const response = await manualGuide.step(
        {
          action: "Send the RFQ-created notification from Penny to Sabil",
          expected: "Sabil accepts the notification that RFQ work has started.",
          failureHints: [
            "Check whether the receiver URL belongs to the intended Sabil/SAP test environment.",
          ],
        },
        () =>
          requestHandler
            .url(outboundConfig.baseUrl)
            .path(API_PATHS.SABIL_OUTBOUND.RFQ_STATUS)
            .headers(outboundConfig.headers)
            .body(buildRfqCreatedPayload(lifecycle))
            .post<unknown>(outboundConfig.expectedStatus),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Sabil accepted the RFQ update",
        context: "RFQ status notification",
        expected: "The response confirms Sabil accepted the RFQ-created notification.",
      });
    });

    test("TC_API_SABIL_316995_OUT — Penny can send vendor master data to Sabil", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Penny can send supplier information to Sabil so the supplier can be created or updated there.",
        expectedResult: [
          "Sabil accepts the supplier master data from Penny.",
          "The response includes or allows capture of the SAP vendor code.",
        ],
        failureHints: [
          "If this is skipped, configure SABIL_BASE_URL for the Sabil/SAP receiver.",
          "If Sabil rejects the supplier, check identity, address, bank, and registration details.",
        ],
        businessData: { "Business moment": "Penny sends supplier master data to Sabil" },
        requiresOutbound: true,
      });
      await addAllureParameter("Testmo Case IDs", "316995");
      test.skip(!outbound, OUTBOUND_SKIP_REASON);
      const outboundConfig = outbound as SabilOutboundConfig;

      const response = await manualGuide.step(
        {
          action: "Send supplier master data from Penny to Sabil",
          expected: "Sabil accepts the supplier details and returns a successful result.",
          failureHints: [
            "Check whether the supplier name, registration details, and bank details are accepted by Sabil.",
          ],
        },
        () =>
          requestHandler
            .url(outboundConfig.baseUrl)
            .path(API_PATHS.SABIL_OUTBOUND.VENDOR_MASTER)
            .headers(outboundConfig.headers)
            .body(buildVendorMasterPayload(lifecycle))
            .post<unknown>(outboundConfig.expectedStatus),
      );

      captureSapVendorCode(lifecycle, response);
      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Sabil accepted the supplier details",
        context: "Vendor master sync",
        expected: "The response confirms the supplier information was accepted.",
      });
    });

    test("TC_API_SABIL_316995_IN — SAP can confirm vendor sync back to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Sabil can tell Penny that the supplier was created or updated successfully.",
        expectedResult: [
          "Penny accepts the supplier confirmation from Sabil.",
          "The Penny supplier record is linked to the SAP vendor code.",
        ],
        failureHints: [
          "If Penny cannot find the supplier, check the Vendor record value in the report.",
          "If the SAP vendor code is missing, check whether the vendor master step ran or provide one through test data.",
        ],
        businessData: { "Business moment": "Sabil confirms supplier creation back to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316995");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.VENDOR_SYNC))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildVendorSyncPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the supplier confirmation from Sabil to Penny",
          expected: "Penny accepts the supplier confirmation and stores the SAP vendor code.",
          failureHints: [
            "Check whether the Penny supplier ID in the report exists in the selected environment.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the supplier confirmation",
        context: "Vendor sync callback",
        expected: "The response confirms the supplier confirmation was accepted.",
      });
    });

    test("TC_API_SABIL_316972_316973_OUT — Penny can send a drafted purchase order to Sabil", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Penny can send a drafted purchase order to Sabil after procurement work reaches the order stage.",
        expectedResult: [
          "Sabil receives the drafted purchase order from Penny.",
          "Sabil accepts the purchase order details without an error.",
        ],
        failureHints: [
          "If this is skipped, configure SABIL_BASE_URL for the Sabil/SAP receiver.",
          "If Sabil rejects the order, check the purchase request, supplier, and order numbers in the evidence.",
        ],
        businessData: { "Business moment": "Penny sends drafted purchase order details to Sabil" },
        requiresOutbound: true,
      });
      await addAllureParameter("Testmo Case IDs", "316972, 316973");
      test.skip(!outbound, OUTBOUND_SKIP_REASON);
      const outboundConfig = outbound as SabilOutboundConfig;

      const response = await manualGuide.step(
        {
          action: "Send the drafted purchase order from Penny to Sabil",
          expected: "Sabil accepts the purchase order information from Penny.",
          failureHints: [
            "Check whether the purchase order number and supplier code match the earlier supplier step.",
          ],
        },
        () =>
          requestHandler
            .url(outboundConfig.baseUrl)
            .path(API_PATHS.SABIL_OUTBOUND.APPROVED_ESOURCING)
            .headers(outboundConfig.headers)
            .body(buildPoDraftedPayload(lifecycle))
            .post<unknown>(outboundConfig.expectedStatus),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Sabil accepted the drafted purchase order",
        context: "Draft purchase order notification",
        expected: "The response confirms the drafted purchase order was accepted.",
      });
    });

    test("TC_API_SABIL_316972_316973_DRAFT — SAP can sync draft purchase order status to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose: "Confirm Sabil can tell Penny that the purchase order exists in SAP as a draft.",
        expectedResult: [
          "Penny accepts the draft purchase order status from Sabil.",
          "The Penny order stays linked to the SAP purchase order number.",
        ],
        failureHints: [
          "If the response says the order was not found, confirm the drafted purchase order was created before this callback.",
          "If outbound steps were skipped, provide an existing SABIL_ORDER_ID or configure SABIL_BASE_URL for a full cycle.",
        ],
        businessData: {
          "Business moment": "Sabil confirms the purchase order draft back to Penny",
        },
      });
      await addAllureParameter("Testmo Case IDs", "316972, 316973");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.PO_SYNC))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildPoSyncPayload(lifecycle, "DRAFT"));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the draft purchase order status from Sabil to Penny",
          expected: "Penny finds the matching order and accepts the draft status update.",
          failureHints: [
            "Check whether the purchase order number in the response matches the Order ID in the report.",
            "If Penny returns not found, the order has not been created in this environment yet.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the draft purchase order status",
        context: "Draft purchase order callback",
        expected: "The response confirms Penny accepted the draft purchase order status.",
      });
    });

    test("TC_API_SABIL_316972_316973_316975_APPROVED — SAP can sync approved purchase order status to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Sabil can tell Penny that the purchase order has moved from draft to approved.",
        expectedResult: [
          "Penny accepts the approved purchase order status.",
          "The order remains linked to the same SAP purchase order number.",
        ],
        failureHints: [
          "If Penny cannot find the order, confirm the draft purchase order status was accepted first.",
          "If the status is rejected, check whether the approval fields match the expected Sabil contract.",
        ],
        businessData: { "Business moment": "Sabil confirms purchase order approval back to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316972, 316973, 316975");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.PO_SYNC))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildPoSyncPayload(lifecycle, "APPROVED"));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the approved purchase order status from Sabil to Penny",
          expected: "Penny finds the matching order and records the approval status.",
          failureHints: [
            "Check that the draft order callback passed before this approval callback runs.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the approved purchase order status",
        context: "Approved purchase order callback",
        expected: "The response confirms Penny accepted the approved purchase order status.",
      });
    });

    test("TC_API_SABIL_316996_OUT — Penny can send completed goods receipt to Sabil", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose: "Confirm Penny can tell Sabil that goods were received for the purchase order.",
        expectedResult: [
          "Sabil receives the completed goods receipt from Penny.",
          "Sabil accepts the received quantity and returns a successful result.",
        ],
        failureHints: [
          "If this is skipped, configure SABIL_BASE_URL for the Sabil/SAP receiver.",
          "If Sabil rejects the receipt, check the SAP purchase order number and received quantity.",
        ],
        businessData: { "Business moment": "Penny sends completed goods receipt details to Sabil" },
        requiresOutbound: true,
      });
      await addAllureParameter("Testmo Case IDs", "316996");
      test.skip(!outbound, OUTBOUND_SKIP_REASON);
      const outboundConfig = outbound as SabilOutboundConfig;

      const response = await manualGuide.step(
        {
          action: "Send the completed goods receipt from Penny to Sabil",
          expected: "Sabil accepts that the goods were received.",
          failureHints: [
            "Check whether the received quantity matches the purchase order quantity.",
          ],
        },
        () =>
          requestHandler
            .url(outboundConfig.baseUrl)
            .path(API_PATHS.SABIL_OUTBOUND.GRN_REQUEST)
            .headers(outboundConfig.headers)
            .body(buildGrnCompletedPayload(lifecycle))
            .post<unknown>(outboundConfig.expectedStatus),
      );

      captureSapGrnNumber(lifecycle, response);
      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Sabil accepted the goods receipt",
        context: "Goods receipt notification",
        expected: "The response confirms Sabil accepted the completed goods receipt.",
      });
    });

    test("TC_API_SABIL_316996_IN — SAP can confirm goods receipt back to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Sabil can send the SAP goods receipt number back to Penny after goods are received.",
        expectedResult: [
          "Penny accepts the goods receipt confirmation.",
          "The Penny receipt record is linked to the SAP goods receipt number.",
        ],
        failureHints: [
          "If Penny cannot match the receipt, confirm the purchase order and goods receipt steps ran first.",
          "If the SAP goods receipt number is missing, check the previous Sabil response or provide one in test data.",
        ],
        businessData: { "Business moment": "Sabil confirms goods receipt back to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316996");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.GRN))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildGrnCallbackPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the goods receipt confirmation from Sabil to Penny",
          expected: "Penny accepts the SAP goods receipt number for the order.",
          failureHints: [
            "Check whether the goods receipt reference in the report already exists in Penny.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the goods receipt confirmation",
        context: "Goods receipt callback",
        expected: "The response confirms Penny accepted the goods receipt confirmation.",
      });
    });

    test("TC_API_SABIL_316976_316977 — Penny can send bill and invoice details to Sabil", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose:
          "Confirm Penny can send bill and invoice details to Sabil after goods receipt is complete.",
        expectedResult: [
          "Sabil receives the bill and invoice details from Penny.",
          "Sabil accepts the invoice amount, tax invoice number, and related purchase order data.",
        ],
        failureHints: [
          "If this is skipped, configure SABIL_BASE_URL for the Sabil/SAP receiver.",
          "If Sabil rejects the invoice, check the invoice amount, tax invoice ID, and SAP purchase order number.",
        ],
        businessData: { "Business moment": "Penny sends bill and invoice details to Sabil" },
        requiresOutbound: true,
      });
      await addAllureParameter("Testmo Case IDs", "316976, 316977");
      test.skip(!outbound, OUTBOUND_SKIP_REASON);
      const outboundConfig = outbound as SabilOutboundConfig;

      const response = await manualGuide.step(
        {
          action: "Send bill and invoice details from Penny to Sabil",
          expected: "Sabil accepts the invoice details for posting.",
          failureHints: [
            "Check whether the invoice amount and SAP purchase order number match the earlier order data.",
          ],
        },
        () =>
          requestHandler
            .url(outboundConfig.baseUrl)
            .path(API_PATHS.SABIL_OUTBOUND.BILL_AND_INVOICE)
            .headers(outboundConfig.headers)
            .body(buildBillInvoicePayload(lifecycle))
            .post<unknown>(outboundConfig.expectedStatus),
      );

      captureSapInvoiceNumber(lifecycle, response);
      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Sabil accepted the bill and invoice",
        context: "Bill and invoice notification",
        expected: "The response confirms Sabil accepted the bill and invoice details.",
      });
    });

    test("TC_API_SABIL_316978 — SAP can confirm invoice sync back to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose: "Confirm Sabil can tell Penny that the invoice was posted in SAP.",
        expectedResult: [
          "Penny accepts the invoice posting confirmation.",
          "The Penny bill is linked to the SAP invoice number.",
        ],
        failureHints: [
          "If Penny cannot find the bill, confirm the bill and invoice step ran first.",
          "If the SAP invoice number is missing, check the Sabil response or provide one in test data.",
        ],
        businessData: { "Business moment": "Sabil confirms invoice posting back to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316978");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.BILL_SYNC))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildInvoiceSyncPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the invoice posting confirmation from Sabil to Penny",
          expected: "Penny accepts the SAP invoice number for the bill.",
          failureHints: [
            "Check whether the bill ID in the report exists in the selected environment.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the invoice posting confirmation",
        context: "Invoice sync callback",
        expected: "The response confirms Penny accepted the invoice posting confirmation.",
      });
    });

    test("TC_API_SABIL_316988 — SAP can send payment confirmation back to Penny", async ({
      manualGuide,
      requestHandler,
    }) => {
      startSabilManualGuide(manualGuide, lifecycle, {
        purpose: "Confirm Sabil can tell Penny that the invoice payment has been completed.",
        expectedResult: [
          "Penny accepts the payment confirmation from Sabil.",
          "The Penny bill is updated with the SAP payment reference.",
        ],
        failureHints: [
          "If Penny cannot find the bill, confirm invoice posting was accepted before payment.",
          "If the amount is rejected, compare the paid amount with the invoice total in the report.",
        ],
        businessData: { "Business moment": "Sabil confirms payment back to Penny" },
      });
      await addAllureParameter("Testmo Case IDs", "316988");

      const builder = requestHandler
        .url(lifecycle.pennyBaseUrl)
        .path(getSabilInboundPath(lifecycle, API_PATHS.SABIL.PAYMENT_CONFIRM))
        .headers(getSabilInboundHeaders(lifecycle))
        .body(buildPaymentConfirmationPayload(lifecycle));

      const inboundToken = getSabilInboundToken();
      if (inboundToken) builder.withToken(inboundToken);

      const response = await manualGuide.step(
        {
          action: "Send the payment confirmation from Sabil to Penny",
          expected: "Penny accepts the payment reference and amount for the bill.",
          failureHints: [
            "Check whether the payment amount matches the invoice total shown in the report.",
          ],
        },
        () => builder.post<unknown>(200),
      );

      await confirmBusinessResult(manualGuide, response, {
        action: "Confirm Penny saved the payment confirmation",
        context: "Payment confirmation callback",
        expected: "The response confirms Penny accepted the payment confirmation.",
      });
    });
  },
);
