import { APIRequestContext } from "@playwright/test";
import { ApiResponse } from "../../types/interfaces/api-response.interface";
import { Logger } from "../../core/logger";
import { ApiRequestOptions, buildUrl, executeApiRequest } from "../support/api-transport";

/**
 * Base API client — all API clients extend this.
 * Handles logging, response parsing, and error wrapping.
 *
 * Usage:
 *   class MyApiClient extends BaseApiClient {
 *     async getUsers() { return this.get<User[]>("/users"); }
 *   }
 */
export abstract class BaseApiClient {
  protected request: APIRequestContext;
  protected baseURL: string;
  protected logger: Logger;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
    this.logger = new Logger(this.constructor.name);
  }

  // ── HTTP methods ─────────────────────────────────────────────

  protected async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return executeApiRequest<T>(this.request, this.logger, "GET", this.baseURL, endpoint, options);
  }

  protected async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return executeApiRequest<T>(this.request, this.logger, "POST", this.baseURL, endpoint, {
      ...options,
      body: data,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return executeApiRequest<T>(this.request, this.logger, "PUT", this.baseURL, endpoint, {
      ...options,
      body: data,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return executeApiRequest<T>(this.request, this.logger, "PATCH", this.baseURL, endpoint, {
      ...options,
      body: data,
    });
  }

  protected async httpDelete<T>(
    endpoint: string,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return executeApiRequest<T>(
      this.request,
      this.logger,
      "DELETE",
      this.baseURL,
      endpoint,
      options,
    );
  }

  protected buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    return buildUrl(this.baseURL, endpoint, params);
  }
}
