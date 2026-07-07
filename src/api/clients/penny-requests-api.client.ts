import { APIRequestContext } from "@playwright/test";
import { API_PATHS } from "../../core/constants/urls";
import { ApiRequestOptions } from "../support/api-transport";
import { BaseApiClient } from "./base-api.client";

export type RequestQueryParams = Record<string, string | number | boolean | undefined>;

const DEFAULT_PAGE_PARAMS = {
  page: "0",
  limit: "10",
};

export class PennyRequestsApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  listRequests<T>(
    token: string | undefined,
    params: RequestQueryParams = DEFAULT_PAGE_PARAMS,
    options?: ApiRequestOptions,
  ) {
    return this.get<T>(API_PATHS.REQUESTS.BASE, {
      ...options,
      token,
      params: compactParams(params),
    });
  }

  listExpenseRequests<T>(
    token: string | undefined,
    params: RequestQueryParams = DEFAULT_PAGE_PARAMS,
    options?: ApiRequestOptions,
  ) {
    return this.get<T>(API_PATHS.REQUESTS.EXPENSE, {
      ...options,
      token,
      params: compactParams(params),
    });
  }

  listPendingRfqs<T>(
    token: string | undefined,
    params: RequestQueryParams = DEFAULT_PAGE_PARAMS,
    options?: ApiRequestOptions,
  ) {
    return this.get<T>(API_PATHS.RFQS.PENDING, {
      timeout: 30_000,
      ...options,
      token,
      params: compactParams(params),
    });
  }
}

function compactParams(params: RequestQueryParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string | number | boolean] => {
      const [, value] = entry;
      return value !== undefined;
    }),
  );
}
