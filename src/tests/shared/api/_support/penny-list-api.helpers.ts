import type { PennyRequestsApiClient, RequestQueryParams } from "@api/clients";
import { API_PATHS } from "@core/constants/urls";
import { safeJson } from "@core/redaction";
import { addAllureParameter } from "@utils/helpers/allure-metadata.helper";
import { attachment } from "allure-js-commons";
import type {
  EsourceListItem,
  ExpenseListItem,
  PennyListResponse,
  RequestListItem,
} from "./penny-list-api.types";

export function fmtList(list: string[] | undefined): string {
  if (!list || list.length === 0) return "(empty)";
  const shown = list.slice(0, 5).join(", ");
  return list.length > 5 ? `${shown} ... (+${list.length - 5} more)` : shown;
}

export async function attachJson(name: string, body: unknown): Promise<void> {
  await attachment(name, safeJson(body), "application/json");
}

export async function fetchRequests(
  api: PennyRequestsApiClient,
  token: string,
  params: RequestQueryParams = { page: "0", limit: "10" },
  attachmentName = `Response - GET ${API_PATHS.REQUESTS.BASE}`,
): Promise<PennyListResponse<RequestListItem>> {
  const response = await api.listRequests<PennyListResponse<RequestListItem>>(token, params);
  await addAllureParameter("HTTP status", String(response.statusCode));
  await attachJson(attachmentName, response.data);
  return response.data;
}

export async function fetchExpenseRequests(
  api: PennyRequestsApiClient,
  token: string,
): Promise<PennyListResponse<ExpenseListItem>> {
  const response = await api.listExpenseRequests<PennyListResponse<ExpenseListItem>>(token);
  await addAllureParameter("HTTP status", String(response.statusCode));
  await attachJson(`Response - GET ${API_PATHS.REQUESTS.EXPENSE}`, response.data);
  return response.data;
}

export async function fetchPendingRfqs(
  api: PennyRequestsApiClient,
  token: string,
  params: RequestQueryParams = { page: "0", limit: "10" },
  attachmentName = `Response - GET ${API_PATHS.RFQS.PENDING}`,
): Promise<PennyListResponse<EsourceListItem>> {
  const response = await api.listPendingRfqs<PennyListResponse<EsourceListItem>>(token, params);
  await addAllureParameter("HTTP status", String(response.statusCode));
  await attachJson(attachmentName, response.data);
  return response.data;
}
