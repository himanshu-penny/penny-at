import { Logger } from "../core/logger";
import { ApiError } from "../core/errors";

const logger = new Logger("RetryMiddleware");

/**
 * Default retry predicate.
 * - 4xx client errors (except 408 Request Timeout and 429 Too Many Requests)
 *   are NOT retried — they are deterministic failures caused by the request itself.
 * - 2xx/3xx status mismatches are NOT retried — the request completed and the
 *   expected status was wrong for the response.
 * - 5xx server errors, network errors (statusCode 0), and unknown errors ARE retried.
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    const { statusCode } = error;
    if (statusCode >= 200 && statusCode < 400) {
      return false;
    }
    if (statusCode === 409 && isPennyWriteConflict(error.responseBody)) {
      return true;
    }
    if (statusCode >= 400 && statusCode < 500) {
      return statusCode === 408 || statusCode === 429;
    }
    return true; // 5xx or network error (statusCode 0)
  }
  return true; // unknown / network-level errors are assumed transient
}

export interface RetryOptions {
  /** Number of retry attempts (not counting the initial attempt) */
  retries?: number;
  /** Initial delay in ms — doubles each retry (exponential backoff) */
  delayMs?: number;
  /** Whether to use exponential backoff. Default: true */
  exponentialBackoff?: boolean;
  /** Called before each retry with the error and attempt number */
  onRetry?: (error: unknown, attempt: number) => void;
  /** If provided, only retry when this returns true */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Retry wrapper with exponential backoff.
 *
 * Use this for wrapping flaky network operations or actions
 * where repeating is safe (idempotent).
 *
 * @example
 *   const data = await withRetry(() => apiClient.getUser(id), { retries: 3 });
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 2,
    delayMs = 250,
    exponentialBackoff = true,
    onRetry,
    shouldRetry = isRetryable,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error)) {
        throw error;
      }

      if (attempt === retries) break;

      const waitMs = exponentialBackoff ? delayMs * Math.pow(2, attempt) : delayMs;

      logger.warn(
        `Retry ${attempt + 1}/${retries} after ${waitMs}ms`,
        error instanceof Error ? error.message : String(error),
      );

      onRetry?.(error, attempt + 1);
      await sleep(waitMs);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPennyWriteConflict(body: unknown): boolean {
  const text = typeof body === "string" ? body : JSON.stringify(body ?? {});
  return /write\s*conflict|writeconflict/i.test(text);
}
