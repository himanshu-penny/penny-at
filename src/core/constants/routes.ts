/**
 * PENNY_ROUTES — canonical path strings for Penny app routes.
 */
export const PENNY_ROUTES = {
  LOGIN: "/en/auth/login",
  DASHBOARD: "/en/dashboard",
  REQUESTS: "/en/requests",
  VENDORS: "/en/vendors",
} as const;

/**
 * PENNY_ROUTE_PATTERNS — pre-compiled regex patterns for Penny URL assertions.
 */
export const PENNY_ROUTE_PATTERNS = {
  LOGIN: /\/en\/auth\/login/,
  AUTHENTICATED: /\/en\/(?!auth\/login)/,
  VENDORS: /\/en\/vendors/,
  VENDOR_DETAIL: /\/en\/vendors\/.+\/view/,
  VENDOR_INVITED_DETAIL: /\/en\/vendors\/invited\/.+/,
} as const;

/**
 * VENDOR_INVITE_PARAM — query parameter name used in vendor registration invite links.
 */
export const VENDOR_INVITE_PARAM = "invite" as const;
