export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
  headers?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}
