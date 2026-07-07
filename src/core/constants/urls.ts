/**
 * API_PATHS — reusable URL path segments for the Penny API.
 *
 * Prefer these constants over hard-coded strings in API clients and tests.
 */
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
  REQUESTS: {
    BASE: "/api/request",
    EXPENSE: "/api/request/expense",
  },
  RFQS: {
    PENDING: "/api/rfqs/pending",
  },
  SABIL: {
    HEALTH: "/integrations/sabil/requests/health",
    PR: "/integrations/sabil/requests/pr",
    VENDOR_SYNC: "/integrations/sabil/requests/vendor/sync",
    PO_SYNC: "/integrations/sabil/requests/po/sync",
    GRN: "/integrations/sabil/requests/grn",
    BILL_SYNC: "/integrations/sabil/requests/bill/sync",
    PAYMENT_CONFIRM: "/integrations/sabil/requests/bill/payment-confirm",
  },
  SABIL_OUTBOUND: {
    RFQ_STATUS: "/PR_RFQ_Status",
    VENDOR_MASTER: "/VendorMaster_Req",
    APPROVED_ESOURCING: "/Approved_Esourcing_Req",
    GRN_REQUEST: "/GRN_Req",
    BILL_AND_INVOICE: "/bill_and_invoice",
  },
} as const;
