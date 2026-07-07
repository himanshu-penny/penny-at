export const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/;

export type RequestListItem = {
  id: string;
  title: string;
  requestPriority: string | null;
  requestor: unknown;
  requestType: string | null;
  workspace: unknown;
  status: string;
  requestSourcingStatus: string | null;
  esourceAssigneeName: string | null;
  [key: string]: unknown;
};

export type EsourceListItem = {
  id: string;
  title: string;
  requestor: unknown;
  requestType: string | null;
  status: string;
  requestSourcingStatus: string | null;
  esourceAssignee: unknown;
  esourceAssigneeName: string | null;
  workflow: unknown;
  locationName: string | null;
  [key: string]: unknown;
};

export type ExpenseListItem = {
  id: string;
  title: string;
  requestor: unknown;
  requestType: string | null;
  status: string;
  [key: string]: unknown;
};

export type PennyListResponse<T> = {
  requests: T[];
  total?: number;
  totalCount?: number;
  page?: number;
  classificationsList?: string[];
  statusList?: string[];
  workspaceClassificationList?: string[];
  workspaceList?: string[];
  requestorList?: string[];
  requestIdList?: string[];
  requestTypeList?: string[];
  requestTitleList?: string[];
  locationNameList?: string[];
  esourceAssigneeNameList?: string[];
  [key: string]: unknown;
};
