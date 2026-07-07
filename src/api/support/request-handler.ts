import { APIRequestContext, test } from "@playwright/test";
import { Logger } from "../../core/logger";
import { ApiMethod, ApiRequestOptions, buildUrl, executeApiRequest } from "./api-transport";

/**
 * Fluent API Request Builder.
 *
 * Provides a chainable, builder-pattern interface for making API requests.
 * Best used when you need fine-grained control over request construction,
 * or when writing test-step-wrapped API calls.
 *
 * Usage:
 *   const response = await new RequestHandler(request, baseUrl, logger)
 *     .path(API_PATHS.REQUESTS.BASE)
 *     .params({ page: "0", limit: "10" })
 *     .headers({ "X-Custom": "value" })
 *     .get(200);
 */
export class RequestHandler {
  private readonly _initialBaseUrl: string;
  private _baseUrl: string;
  private _path: string = "";
  private _params: Record<string, string> = {};
  private _headers: Record<string, string> = {};
  private _body: unknown = undefined;
  private _defaultAuthToken: string;
  private _authToken: string | undefined;
  private _clearAuth = false;
  private _timeout: number | undefined;
  private _retry: ApiRequestOptions["retry"] = undefined;

  private logger: Logger;
  private request: APIRequestContext;

  constructor(
    request: APIRequestContext,
    baseUrl: string,
    logger: Logger,
    defaultAuthToken: string = "",
  ) {
    this.request = request;
    this._initialBaseUrl = baseUrl;
    this._baseUrl = baseUrl;
    this._defaultAuthToken = defaultAuthToken;
    this.logger = logger;
  }

  // ── Builder methods ──────────────────────────────────────────────

  url(url: string): this {
    this._baseUrl = url;
    return this;
  }

  path(path: string): this {
    this._path = path;
    return this;
  }

  params(params: Record<string, string | number | boolean>): this {
    this._params = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    );
    return this;
  }

  headers(headers: Record<string, string>): this {
    this._headers = { ...this._headers, ...headers };
    return this;
  }

  body(body: unknown): this {
    this._body = body;
    return this;
  }

  withToken(token: string): this {
    this._authToken = token;
    return this;
  }

  clearAuth(): this {
    this._clearAuth = true;
    return this;
  }

  timeout(ms: number): this {
    this._timeout = ms;
    return this;
  }

  retry(retry: ApiRequestOptions["retry"]): this {
    this._retry = retry;
    return this;
  }

  // ── HTTP methods ─────────────────────────────────────────────────

  async get<T = unknown>(expectedStatus: number): Promise<T> {
    return this._execute<T>("GET", expectedStatus);
  }

  async post<T = unknown>(expectedStatus: number): Promise<T> {
    return this._execute<T>("POST", expectedStatus);
  }

  async put<T = unknown>(expectedStatus: number): Promise<T> {
    return this._execute<T>("PUT", expectedStatus);
  }

  async patch<T = unknown>(expectedStatus: number): Promise<T> {
    return this._execute<T>("PATCH", expectedStatus);
  }

  async delete<T = unknown>(expectedStatus: number): Promise<T> {
    return this._execute<T>("DELETE", expectedStatus);
  }

  // ── Internal ─────────────────────────────────────────────────────

  private buildFullUrl(): string {
    return buildUrl(this._baseUrl, this._path, this._params);
  }

  private reset(): void {
    this._baseUrl = this._initialBaseUrl;
    this._path = "";
    this._params = {};
    this._headers = {};
    this._body = undefined;
    this._clearAuth = false;
    this._authToken = undefined;
    this._timeout = undefined;
    this._retry = undefined;
  }

  private async _execute<T>(method: ApiMethod, expectedStatus: number): Promise<T> {
    const url = this.buildFullUrl();
    const token = this._clearAuth ? undefined : (this._authToken ?? this._defaultAuthToken);
    const body = this._body;
    const headers = this._headers;
    const retry = this._retry;
    const timeout = this._timeout;

    let responseData: T;

    await test.step(`${method} ${this._path || url}`, async () => {
      try {
        const response = await executeApiRequest<T>(
          this.request,
          this.logger,
          method,
          this._baseUrl,
          this._path || url,
          {
            expectedStatus,
            params: this._params,
            token,
            timeout,
            retry,
            body,
            headers,
          },
        );

        responseData = response.data;
      } finally {
        this.reset();
      }
    });

    return responseData!;
  }
}
