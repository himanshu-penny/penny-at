import { APIRequestContext, APIResponse } from "@playwright/test";
import { attachment, step as allureStep } from "allure-js-commons";
import { ApiError } from "../../core/errors";
import { Logger } from "../../core/logger";
import { redactHeaders, redactSensitiveData, redactUrl, safeJson } from "../../core/redaction";
import { RetryOptions, withRetry } from "../../middleware/retry.middleware";
import { currentManualGuide } from "../../utils/helpers/manual-test.helper";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
  token?: string;
  timeout?: number;
  expectedStatus?: number;
  retry?: RetryOptions | false;
}

export interface ApiTransportResult<T = unknown> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
  headers: Record<string, string>;
  url: string;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 2,
  delayMs: 500,
  exponentialBackoff: true,
};

export async function executeApiRequest<T>(
  request: APIRequestContext,
  logger: Logger,
  method: ApiMethod,
  baseUrl: string,
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiTransportResult<T>> {
  const url = buildUrl(baseUrl, path, options.params);
  const headers = buildHeaders(options.headers, options.token);
  const retry = options.retry === false ? false : { ...DEFAULT_RETRY_OPTIONS, ...options.retry };

  const run = async (): Promise<ApiTransportResult<T>> => {
    logger.logRequest(method, url, headers, options.body);

    let response: APIResponse;
    try {
      response = await sendRequest(request, method, url, headers, options.body, options.timeout);
    } catch (error) {
      throw new ApiError(
        `Network error on ${method} ${redactUrl(url)}: ${errorMessage(error)}`,
        0,
        null,
      );
    }

    const parsed = await parseApiResponse<T>(response);
    logger.logResponse(parsed.statusCode, parsed.data, options.expectedStatus);
    await attachApiCall(logger, method, url, headers, options.body, parsed);
    recordManualApiCall(method, url, options.expectedStatus, options.body, parsed);

    const expectedStatus = options.expectedStatus;
    if (expectedStatus !== undefined && parsed.statusCode !== expectedStatus) {
      throw new ApiError(
        `${method} ${redactUrl(url)} expected status ${expectedStatus}, got ${parsed.statusCode}`,
        parsed.statusCode,
        parsed.data,
        parsed.headers,
      );
    }

    if (expectedStatus === undefined && !parsed.success) {
      throw new ApiError(
        `Request to ${redactUrl(response.url())} failed`,
        parsed.statusCode,
        parsed.data,
        parsed.headers,
      );
    }

    return parsed;
  };

  return retry ? withRetry(run, retry) : run();
}

function recordManualApiCall<T>(
  method: ApiMethod,
  url: string,
  expectedStatus: number | undefined,
  requestBody: unknown,
  response: ApiTransportResult<T>,
): void {
  try {
    currentManualGuide()?.recordApiCall({
      method,
      url,
      expectedStatus,
      actualStatus: response.statusCode,
      requestBody,
      responseBody: response.data,
    });
  } catch (error) {
    // Manual reporting should never change API test behavior.
    const guideError = error instanceof Error ? error.message : String(error);
    currentManualGuide()
      ?.evidence("Manual guide recording warning", guideError)
      .catch(() => {});
  }
}

export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean>,
): string {
  const url = path.startsWith("http") ? new URL(path) : new URL(path, ensureTrailingSlash(baseUrl));

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function buildHeaders(
  headers?: Record<string, string>,
  token?: string,
): Record<string, string> {
  const merged = { ...DEFAULT_HEADERS, ...headers };
  if (token) {
    merged.Authorization = `Bearer ${token}`;
  }
  return merged;
}

async function sendRequest(
  request: APIRequestContext,
  method: ApiMethod,
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeout?: number,
): Promise<APIResponse> {
  const options = {
    headers,
    data: body,
    timeout,
  };

  switch (method) {
    case "GET":
      return request.get(url, { headers, timeout });
    case "POST":
      return request.post(url, options);
    case "PUT":
      return request.put(url, options);
    case "PATCH":
      return request.patch(url, options);
    case "DELETE":
      return request.delete(url, { headers, timeout });
  }
}

async function parseApiResponse<T>(response: APIResponse): Promise<ApiTransportResult<T>> {
  const statusCode = response.status();
  const headers = response.headers();
  const text = await response.text().catch(() => "");
  const data = parseBody<T>(text, headers["content-type"]);

  return {
    success: statusCode >= 200 && statusCode < 300,
    data,
    statusCode,
    message: statusCode >= 200 && statusCode < 300 ? "Request successful" : "Request failed",
    headers,
    url: response.url(),
  };
}

function parseBody<T>(text: string, contentType?: string): T {
  if (!text.trim()) return null as T;

  const shouldParseJson =
    contentType?.includes("application/json") ||
    text.trim().startsWith("{") ||
    text.trim().startsWith("[");

  if (!shouldParseJson) {
    return text as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function attachApiCall<T>(
  logger: Logger,
  method: ApiMethod,
  url: string,
  headers: Record<string, string>,
  requestBody: unknown,
  response: ApiTransportResult<T>,
): Promise<void> {
  try {
    await allureStep(`${method} ${redactUrl(url)} -> ${response.statusCode}`, async () => {
      await attachment(
        "Request / Response",
        safeJson({
          request: {
            method,
            url: redactUrl(url),
            headers: redactHeaders(headers),
            body: redactSensitiveData(requestBody ?? null),
          },
          response: {
            status: response.statusCode,
            headers: redactHeaders(response.headers),
            body: redactSensitiveData(response.data ?? null),
          },
        }),
        "application/json",
      );
    });
  } catch (error) {
    // Allure context is not always available, especially in setup helpers.
    logger.debug("Unable to attach API call details to Allure", errorMessage(error));
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
