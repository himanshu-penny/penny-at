/**
 * Centralized timeout constants.
 * Import these instead of using magic numbers in your tests.
 */
export const TIMEOUTS = {
  /** Debounce window: confirm no duplicate events fire after a rapid action */
  DEBOUNCE: 2_000,
  /** Short wait: tooltips, hover states, animations */
  SHORT: 3_000,
  /** Default timeout for most interactions */
  DEFAULT: 10_000,
  /** Page loads and navigation */
  PAGE_LOAD: 30_000,
  /** Element visibility waits */
  ELEMENT_VISIBLE: 10_000,
  /** Element hidden waits */
  ELEMENT_HIDDEN: 5_000,
  /** Click actions */
  CLICK: 10_000,
  /** API response waits */
  API_RESPONSE: 20_000,
  /** Long-running operations */
  LONG: 60_000,
  /** Very long operations (file uploads, exports) */
  VERY_LONG: 120_000,
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
