export type ApiErrorIssue = {
  path: string;
  message: string;
};

export type ApiErrorData = {
  status?: string;
  message?: string;
  error?: {
    message?: string;
    statusCode?: number;
    issues?: ApiErrorIssue[];
  };
  issues?: ApiErrorIssue[];
};

const STATUS_FALLBACK: Record<number, string> = {
  400: "The server rejected the request",
  401: "Your session has expired, sign in again",
  403: "You do not have access to this",
  404: "Not found",
  429: "Too many requests, wait a moment",
  500: "The server hit an unexpected error",
  502: "The upstream service returned an unusable answer",
  503: "The service is temporarily unavailable",
  504: "The request took too long and timed out",
};

const readIssues = (data: ApiErrorData): ApiErrorIssue[] =>
  data.error?.issues ?? data.issues ?? [];

const readMessage = (status: number, data: ApiErrorData): string => {
  const issue = readIssues(data)[0];
  if (issue) {
    return issue.path ? `${issue.path}: ${issue.message}` : issue.message;
  }
  const direct = data.error?.message?.trim() || data.message?.trim();
  if (direct) {
    return direct;
  }
  return STATUS_FALLBACK[status] ?? `Request failed with status ${status}`;
};

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;
  issues: ApiErrorIssue[];

  constructor(status: number, data: ApiErrorData) {
    super(readMessage(status, data));
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.issues = readIssues(data);
  }
}
