import type { APIRequestContext } from "@playwright/test";
import type { EnvironmentConfig } from "../../../../../types/interfaces/config.interface";
import { envFlag, envNumber, optionalEnv, tinyPdfBase64 } from "@utils/helpers";

export type SabilLifecycleData = {
  billId: string;
  currency: string;
  grnReference: string;
  invoiceTotal: number;
  lineItemNumber: string;
  materialCode: string;
  orderId: string;
  orgCode: string;
  paymentTerm: string;
  pennyBaseUrl: string;
  pennyPathPrefix: string;
  plantCode: string;
  prId: string;
  projectManager: string;
  projectName: string;
  purchaseGroup: string;
  quantity: number;
  sapGrnNumber: string;
  sapInvoiceNumber: string;
  sapPaymentReference: string;
  sapPoNumber: string;
  sapVendorCode: string;
  taxCode: string;
  taxInvoiceId: string;
  unitPrice: number;
  vendorName: string;
  vendorPennyId: string;
  requestorName: string;
  requestorEmail: string;
  requestorSapUserId: string;
  contactName: string;
  contactEmail: string;
  contactMobile: string;
};

export type SabilOutboundConfig = {
  baseUrl: string;
  headers: Record<string, string>;
  expectedStatus: number;
};

export type SabilExpectedStatusKey =
  | "SABIL_EXPECTED_CREATE_PR_STATUS"
  | "SABIL_EXPECTED_CROSS_TENANT_STATUS"
  | "SABIL_EXPECTED_DISABLED_ORG_STATUS"
  | "SABIL_EXPECTED_DUPLICATE_PR_STATUS"
  | "SABIL_EXPECTED_GRN_BEFORE_PO_STATUS"
  | "SABIL_EXPECTED_INVALID_BOOLEAN_STATUS"
  | "SABIL_EXPECTED_INVALID_ATTACHMENT_STATUS"
  | "SABIL_EXPECTED_INVALID_NUMERIC_STATUS"
  | "SABIL_EXPECTED_INVALID_ORG_STATUS"
  | "SABIL_EXPECTED_INVALID_TOKEN_STATUS"
  | "SABIL_EXPECTED_INVOICE_BEFORE_BILL_STATUS"
  | "SABIL_EXPECTED_MALFORMED_JSON_STATUS"
  | "SABIL_EXPECTED_METHOD_NOT_ALLOWED_STATUS"
  | "SABIL_EXPECTED_MISSING_ORG_STATUS"
  | "SABIL_EXPECTED_MISSING_REQUIRED_STATUS"
  | "SABIL_EXPECTED_OUTBOUND_BAD_REQUEST_STATUS"
  | "SABIL_EXPECTED_PAYMENT_BEFORE_INVOICE_STATUS"
  | "SABIL_EXPECTED_PO_BEFORE_PR_STATUS"
  | "SABIL_EXPECTED_UNSUPPORTED_INDICATOR_STATUS";

export function createSabilLifecycleData(envConfig: EnvironmentConfig): SabilLifecycleData {
  assertSabilOrgCodeIsExplicitWhenNeeded(envConfig);

  const runId = optionalEnv("SABIL_RUN_ID") ?? buildRunId();
  const shortRunId = runId.slice(-8);

  const pennyIntegrationUrl = parsePennyIntegrationUrl(envConfig);

  return {
    billId: optionalEnv("SABIL_BILL_ID") ?? `org5544360-bill-${shortRunId}`,
    currency: optionalEnv("SABIL_CURRENCY") ?? "SAR",
    grnReference: optionalEnv("SABIL_GRN_REFERENCE") ?? `GRN-${shortRunId}`,
    invoiceTotal: envNumber("SABIL_INVOICE_TOTAL", 7500),
    lineItemNumber: optionalEnv("SABIL_LINE_ITEM_NUMBER") ?? "00010",
    materialCode: optionalEnv("SABIL_MATERIAL_CODE") ?? "6000000219",
    orderId: optionalEnv("SABIL_ORDER_ID") ?? `PO-${shortRunId}`,
    orgCode:
      optionalEnv("SABIL_ORG_CODE") ?? optionalEnv("ORG_CODE") ?? envConfig.client ?? "sabil",
    paymentTerm: optionalEnv("SABIL_PAYMENT_TERM") ?? "0001",
    pennyBaseUrl: pennyIntegrationUrl.baseUrl,
    pennyPathPrefix: pennyIntegrationUrl.pathPrefix,
    plantCode: optionalEnv("SABIL_PLANT_CODE") ?? "1001",
    prId: optionalEnv("SABIL_PR_ID") ?? `PR-${shortRunId}`,
    projectManager: optionalEnv("SABIL_PROJECT_MANAGER") ?? "Penny QA",
    projectName: optionalEnv("SABIL_PROJECT_NAME") ?? `Sabil API ${shortRunId}`,
    purchaseGroup: optionalEnv("SABIL_PURCHASE_GROUP") ?? "002",
    quantity: envNumber("SABIL_QUANTITY", 100),
    sapGrnNumber: optionalEnv("SABIL_SAP_GRN_NUMBER") ?? `5000${shortRunId}`,
    sapInvoiceNumber: optionalEnv("SABIL_SAP_INVOICE_NUMBER") ?? `INV-${shortRunId}`,
    sapPaymentReference: optionalEnv("SABIL_PAYMENT_REFERENCE") ?? `PAY-${shortRunId}`,
    sapPoNumber: optionalEnv("SABIL_SAP_PO_NUMBER") ?? `4500${shortRunId}`,
    sapVendorCode: optionalEnv("SABIL_SAP_VENDOR_CODE") ?? `V${shortRunId}`,
    taxCode: optionalEnv("SABIL_TAX_CODE") ?? "V1",
    taxInvoiceId: optionalEnv("SABIL_TAX_INVOICE_ID") ?? `tax-invoice-${shortRunId}`,
    unitPrice: envNumber("SABIL_UNIT_PRICE", 75),
    vendorName: optionalEnv("SABIL_VENDOR_NAME") ?? `Sabil QA Vendor ${shortRunId}`,
    vendorPennyId: optionalEnv("SABIL_VENDOR_PENNY_ID") ?? `vendor-${shortRunId}`,
    requestorName: optionalEnv("SABIL_REQUESTOR_NAME") ?? "Penny QA Requester",
    requestorEmail: optionalEnv("SABIL_REQUESTOR_EMAIL") ?? "requester@example.com",
    requestorSapUserId: optionalEnv("SABIL_REQUESTOR_SAP_USER_ID") ?? "QAUSER",
    contactName: optionalEnv("SABIL_CONTACT_NAME") ?? "Penny QA Contact",
    contactEmail: optionalEnv("SABIL_CONTACT_EMAIL") ?? "ap@example.com",
    contactMobile: optionalEnv("SABIL_CONTACT_MOBILE") ?? "+966500000000",
  };
}

export function getSabilInboundHeaders(data: SabilLifecycleData): Record<string, string> {
  return {
    "X-ORG-CODE": data.orgCode,
  };
}

export function getSabilInboundAuthHeaders(): Record<string, string> {
  const inboundToken = getSabilInboundToken();
  return inboundToken ? { Authorization: `Bearer ${inboundToken}` } : {};
}

export function getSabilInboundPath(data: SabilLifecycleData, path: string): string {
  return `${data.pennyPathPrefix}${path}`;
}

export function getSabilInboundToken(): string | undefined {
  return optionalEnv("SABIL_INBOUND_TOKEN");
}

function parsePennyIntegrationUrl(envConfig: EnvironmentConfig): {
  baseUrl: string;
  pathPrefix: string;
} {
  const rawUrl = optionalEnv("SABIL_PENNY_BASE_URL") ?? envConfig.apiUrl;
  const parsed = new URL(rawUrl);
  const pathPrefix = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");

  return {
    baseUrl: parsed.origin,
    pathPrefix,
  };
}

export function getSabilOutboundConfig(): SabilOutboundConfig | undefined {
  const baseUrl = optionalEnv("SABIL_BASE_URL");
  if (!baseUrl) {
    if (isSabilOutboundRequired()) {
      throw new Error("SABIL_BASE_URL is required when SABIL_REQUIRE_OUTBOUND=true.");
    }
    return undefined;
  }

  return {
    baseUrl,
    headers: getSabilOutboundHeaders(),
    expectedStatus: envNumber("SABIL_OUTBOUND_EXPECTED_STATUS", 200),
  };
}

export function isSabilOutboundRequired(): boolean {
  return envFlag("SABIL_REQUIRE_OUTBOUND", false);
}

export type BuildPrPayloadOptions = {
  /** Number of line items to include (default 1). */
  itemCount?: number;
};

export function buildCreatePrPayload(
  data: SabilLifecycleData,
  options: BuildPrPayloadOptions = {},
): Record<string, unknown> {
  const itemCount = Math.max(1, options.itemCount ?? 1);
  const items = Array.from({ length: itemCount }, (_, index) => buildPrItem(data, index));

  return {
    Indicator: "Create",
    prId: data.prId,
    // Contract note: Sabil currently sends the literal string "null" here.
    externalId: "null",
    requestType: "ZPR1-PR with Budget",
    requestedDate: "2026-06-29",
    currency: data.currency,
    workspace: optionalEnv("SABIL_WORKSPACE") ?? "org9854269-wkp-1012",
    projectName: data.projectName,
    projectManager: data.projectManager,
    headerText: "Sabil Penny integration automation",
    requestor: {
      name: data.requestorName,
      email: data.requestorEmail,
      sapUserId: data.requestorSapUserId,
    },
    items,
    attachments: [
      {
        name: "1782815484-demo_pdf.pdf",
        fileType: "pdf",
        image: tinyPdfBase64(),
      },
    ],
  };
}

function buildPrItem(data: SabilLifecycleData, index: number): Record<string, unknown> {
  const lineItemNumber =
    index === 0
      ? data.lineItemNumber
      : String(Number(data.lineItemNumber) + index * 10).padStart(5, "0");
  return {
    lineItemNumber,
    materialCode: data.materialCode.padEnd(40, " "),
    nameEnglish: "PENCIL WITH ERASER HB NATURAL BARREL",
    shortDescription: "PENCIL WITH ERASER HB NATURAL BARREL",
    longDescription: "PENCIL WITH ERASER HB NATURAL BARREL",
    quantity: `${data.quantity.toFixed(3)} `,
    uom: "EA",
    valuationPrice: `${(data.quantity * data.unitPrice).toFixed(2)} `,
    pricePerUnit: `${data.unitPrice} `,
    currency: data.currency,
    deliveryDate: "20260629",
    plantCode: data.plantCode,
    purchaseGroup: data.purchaseGroup,
    batchEnabled: "false",
    serialNumberRequired: "false",
    deleteStatus: "false",
  };
}

export function buildRfqCreatedPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    externalId: data.prId,
    status: "RFQ_CREATED",
    items: [{ lineItemId: data.lineItemNumber }],
  };
}

export function buildVendorMasterPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    indicator: "Create",
    identity: {
      pennyIdForSupplier: data.vendorPennyId,
      BPId: null,
      vendorCode: null,
      classification: "Supplier",
      subClassification: "IT Equipment, Office Supplies",
      type: "Company",
      category: "Domestic",
      supplierName: data.vendorName,
      searchTerm1: data.vendorName,
    },
    address: {
      houseNumber: "123",
      street: "King Fahd Road",
      city: "Riyadh",
      country: "SA",
      postalCode: "11564",
    },
    contact: {
      mobile: data.contactMobile,
      emailId: data.contactEmail,
      mailId: data.contactEmail,
      contactPersonName: data.contactName,
    },
    registration: {
      crNumber: "1010101010",
      vatNumber: "300000000000003",
    },
    bank: {
      bankCountry: "SA",
      bankKey: "SA8000",
      bankName: "Al Rajhi Bank",
      bankAccount: "123456789012",
      accountHolderName: data.vendorName,
      currency: data.currency,
      IBAN: "SA0380000000608010167519",
    },
    terms: {
      incoTerm: "",
      incoTermDescription: "",
      purchaseGroup: "",
      paymentTerm: "",
      reconciliationAccount: "",
    },
    certificates: {
      COCNumber: "COC-123",
      COCExpiryDate: "31/12/2026",
      ZKTNumber: "ZKT-123",
      ZKTExpiryDate: "31/12/2026",
      GOSINumber: "GOSI-123",
      GOSIExpiryDate: "31/12/2026",
      SUNumber: "SU-123",
      SUExpiryDate: "31/12/2026",
      farmer: { moiId: "", certificateNumber: "", idNumber: "" },
    },
  };
}

export function buildVendorSyncPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    success: "true",
    indicator: "Create",
    vendor: {
      pennyIdForSupplier: data.vendorPennyId,
      sapVendorCode: data.sapVendorCode,
      message: "Vendor created in SAP",
    },
  };
}

export function buildPoDraftedPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    indicator: "Create",
    poNumber: data.orderId,
    externalId: "",
    type: "standard",
    creationDate: "2026-03-08",
    sapVendorId: data.sapVendorCode,
    paymentTerm: data.paymentTerm,
    purchaseGroup: data.purchaseGroup,
    // Contract note: field casing follows the Sabil outbound payload contract.
    ShippingFee: 0,
    projectName: data.projectName,
    projectManager: data.projectManager,
    plantCode: data.plantCode,
    prNumber: data.prId,
    createdBy: {
      email: "buyer@penny.co",
      sapUserId: "",
    },
    items: [
      {
        lineItemNumber: data.lineItemNumber,
        itemId: "line-1",
        materialCode: data.materialCode,
        quantity: data.quantity,
        uom: "EA",
        price: data.unitPrice,
        currency: data.currency,
        deliveryDate: "2026-03-15",
        plantCode: data.plantCode,
        taxCode: data.taxCode,
      },
    ],
  };
}

export function buildPoSyncPayload(
  data: SabilLifecycleData,
  status: "DRAFT" | "APPROVED",
): Record<string, unknown> {
  const isApprovedCallback = status === "APPROVED";

  return {
    poNumber: data.orderId,
    sapPoNumber: data.sapPoNumber,
    lastApprover: isApprovedCallback ? "Dora Dora" : null,
    poDocType: "",
    // v3 callback contract keeps status as DRAFT and uses lastApprover to signal approval.
    status: isApprovedCallback ? "DRAFT" : status,
    errorMessage: "",
  };
}

export function buildGrnCompletedPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    sapPoNumber: data.sapPoNumber,
    grnId: data.grnReference,
    grnStatus: "COMPLETED",
    receiptDate: "2026-03-15",
    indicator: "Create",
    items: [
      {
        lineItem: data.lineItemNumber,
        preqItem: data.lineItemNumber,
        orderedQuantity: data.quantity,
        receivedQuantity: data.quantity,
        acceptedQuantity: data.quantity,
        uom: "EA",
      },
    ],
  };
}

export function buildGrnCallbackPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    success: "true",
    grnReference: data.grnReference,
    // Contract note: field casing follows the SAP callback payload contract.
    SAP_GRN_Number: data.sapGrnNumber,
    message: "GRN recorded successfully",
  };
}

export function buildBillInvoicePayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    invoiceDate: "2026-03-16",
    postingDate: "2026-03-16",
    supplierInvoiceNumber: data.taxInvoiceId,
    externalId: data.billId,
    sapPoNumber: data.sapPoNumber,
    currency: data.currency,
    invoiceTotal: data.invoiceTotal,
    sapInvoiceNumber: null,
    indicator: "Approve",
    items: [
      {
        poLineItem: data.lineItemNumber,
        lineItem: data.lineItemNumber,
        grnNumber: data.sapGrnNumber,
        supplierInvoiceValue: data.invoiceTotal,
        taxCode: data.taxCode,
        taxCodeName: data.taxCode,
      },
    ],
    attachments: [
      {
        name: "1782815484-demo_pdf.pdf",
        fileType: "pdf",
        image: tinyPdfBase64(),
      },
    ],
  };
}

export function buildInvoiceSyncPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    success: "true",
    supplierInvoiceNumber: data.taxInvoiceId,
    externalId: data.billId,
    sapInvoiceNumber: data.sapInvoiceNumber,
    message: "Invoice posted in SAP",
  };
}

export function buildPaymentConfirmationPayload(data: SabilLifecycleData): Record<string, unknown> {
  return {
    // Contract note: lowercase "c" matches the Sabil payment confirmation contract.
    sapVendorcode: data.sapVendorCode,
    billId: data.billId,
    sapPaymentReference: data.sapPaymentReference,
    paidAmount: String(data.invoiceTotal),
    paymentDate: "2026-03-28",
    currency: data.currency,
  };
}

/**
 * Return the expected 4xx/5xx status for a Sabil negative case, allowing the
 * default to be overridden per environment. Clamps to error ranges so a
 * misconfigured env can't invert a negative assertion (e.g. by pointing to 200).
 */
export function expectedSabilStatus(key: SabilExpectedStatusKey, fallback: number): number {
  const value = envNumber(key, fallback);
  if (value < 400 || value > 599) {
    throw new Error(
      `${key} must resolve to a 4xx or 5xx status (got ${value}). ` +
        "Check the SABIL_EXPECTED_* env value.",
    );
  }
  return value;
}

export function cloneSabilPayload(payload: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
}

export function withoutSabilField(
  payload: Record<string, unknown>,
  fieldName: string,
): Record<string, unknown> {
  const next = cloneSabilPayload(payload);
  delete next[fieldName];
  return next;
}

/**
 * Remove a dot-separated nested field, e.g.
 * `withoutNestedSabilField(payload, "vendor.pennyIdForSupplier")`.
 */
export function withoutNestedSabilField(
  payload: Record<string, unknown>,
  fieldPath: string,
): Record<string, unknown> {
  const next = cloneSabilPayload(payload);
  const segments = fieldPath.split(".");
  const leaf = segments.pop();
  if (!leaf) throw new Error("Field path must be non-empty.");

  let cursor: Record<string, unknown> = next;
  for (const segment of segments) {
    const child = cursor[segment];
    if (!child || typeof child !== "object") {
      throw new Error(`Cannot descend into "${segment}" — value is not an object.`);
    }
    cursor = child as Record<string, unknown>;
  }
  delete cursor[leaf];
  return next;
}

export function withSabilField(
  payload: Record<string, unknown>,
  fieldName: string,
  value: unknown,
): Record<string, unknown> {
  return {
    ...cloneSabilPayload(payload),
    [fieldName]: value,
  };
}

export function withFirstSabilItemField(
  payload: Record<string, unknown>,
  fieldName: string,
  value: unknown,
): Record<string, unknown> {
  const next = cloneSabilPayload(payload);
  const items = next.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Sabil payload must include at least one item.");
  }

  const firstItem = items[0];
  if (!firstItem || typeof firstItem !== "object") {
    throw new Error("Sabil payload item must be an object.");
  }

  (firstItem as Record<string, unknown>)[fieldName] = value;
  return next;
}

export function withSabilAttachment(
  payload: Record<string, unknown>,
  attachmentOverride: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...cloneSabilPayload(payload),
    attachments: [
      {
        name: "sabil-edge-case.pdf",
        fileType: "pdf",
        image: tinyPdfBase64(),
        ...attachmentOverride,
      },
    ],
  };
}

export function captureSapVendorCode(data: SabilLifecycleData, response: unknown): void {
  const value = getStringProperty(response, ["sapVendorCode", "sapVendorcode", "vendorCode"]);
  if (!value) {
    throw new Error("Vendor master response did not include a SAP vendor code.");
  }
  data.sapVendorCode = value;
}

export function captureSapGrnNumber(data: SabilLifecycleData, response: unknown): void {
  const value = getStringProperty(response, ["sapGRNNumber", "SAP_GRN_Number", "sapGrnNumber"]);
  if (!value) {
    throw new Error("Goods receipt response did not include a SAP GRN number.");
  }
  data.sapGrnNumber = value;
}

export function captureSapInvoiceNumber(data: SabilLifecycleData, response: unknown): void {
  const value = getStringProperty(response, [
    "invoiceReference",
    "sapInvoiceNumber",
    "SAP_Invoice_Number",
  ]);
  if (!value) {
    throw new Error("Bill and invoice response did not include a SAP invoice reference.");
  }
  data.sapInvoiceNumber = value;
}

export function expectSabilResponseAccepted(response: unknown, context: string): void {
  if (response === undefined) {
    throw new Error(`${context} did not return a response body.`);
  }

  // Sabil inbound endpoints (e.g. PR create) return an array of per-item result
  // objects; single-resource endpoints return one object. Accept both.
  if (Array.isArray(response)) {
    if (response.length === 0) {
      throw new Error(`${context} returned an empty result array.`);
    }
    response.forEach((entry, index) =>
      expectSabilResultObjectAccepted(entry, `${context} (result ${index + 1})`),
    );
    return;
  }

  expectSabilResultObjectAccepted(response, context);
}

function expectSabilResultObjectAccepted(entry: unknown, context: string): void {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(`${context} returned a non-JSON-object response body.`);
  }

  const data = entry as Record<string, unknown>;
  const statusCode = Number(data.statusCode);
  if (Number.isFinite(statusCode) && statusCode >= 400) {
    throw new Error(`${context} returned an error status in the response body: ${statusCode}`);
  }

  const error = data.error;
  if (typeof error === "string" && error.trim()) {
    throw new Error(`${context} returned an error body: ${error}`);
  }
}

function getSabilOutboundHeaders(): Record<string, string> {
  const username = optionalEnv("SABIL_SAP_USERNAME");
  const password = optionalEnv("SABIL_SAP_PASSWORD");
  if (!username || !password) return {};

  return {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
  };
}

function assertSabilOrgCodeIsExplicitWhenNeeded(envConfig: EnvironmentConfig): void {
  if (envConfig.client === "sabil") return;
  if (optionalEnv("SABIL_ORG_CODE") || optionalEnv("ORG_CODE")) return;

  throw new Error(
    `Sabil API tests require SABIL_ORG_CODE when CLIENT=${envConfig.client}. ` +
      "Use CLIENT=sabil or provide an explicit SABIL_ORG_CODE.",
  );
}

function getStringProperty(value: unknown, keys: string[]): string | undefined {
  // Sabil result payloads may be a single object or a one-entry array; read from
  // the first element when handed an array so field capture works for both shapes.
  const source = Array.isArray(value) ? value[0] : value;
  if (!source || typeof source !== "object") return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;

    const property = record[key];
    if (property !== undefined && property !== null) return String(property);
  }

  return undefined;
}

/**
 * Compose a run identifier that stays unique across parallel Playwright workers.
 * `Date.now()` alone can collide when two workers enter this function within
 * the same millisecond — the worker index disambiguates.
 */
function buildRunId(): string {
  const workerIndex = optionalEnv("TEST_WORKER_INDEX") ?? "0";
  return `${Date.now()}${workerIndex.padStart(2, "0")}`;
}

/**
 * POST a raw JSON string to a Sabil inbound endpoint, bypassing the framework
 * request handler so callers can send deliberately malformed bodies. Preserves
 * the standard org-code header and optional bearer token so the request still
 * reaches Sabil's parsing layer.
 */
export async function postRawInboundJson(
  request: APIRequestContext,
  data: SabilLifecycleData,
  path: string,
  rawJsonText: string,
): Promise<{ status: number; body: string }> {
  const url = `${data.pennyBaseUrl}${getSabilInboundPath(data, path)}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...getSabilInboundHeaders(data),
    ...getSabilInboundAuthHeaders(),
  };

  const response = await request.post(url, { headers, data: rawJsonText });
  return { status: response.status(), body: await response.text() };
}
