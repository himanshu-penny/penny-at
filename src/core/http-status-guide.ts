export type HttpStatusCategory =
  | "Informational"
  | "Success"
  | "Redirection"
  | "Client Error"
  | "Server Error";

export type HttpStatusGuide = {
  code: number;
  name: string;
  category: HttpStatusCategory;
  plainLanguage: string;
  apiExample: string;
  testerAction: string;
  note?: string;
};

export const HTTP_STATUS_CLASSES: ReadonlyArray<{
  range: string;
  category: HttpStatusCategory;
  meaning: string;
}> = [
  {
    range: "1xx",
    category: "Informational",
    meaning: "The API received the request and is still working through the exchange.",
  },
  {
    range: "2xx",
    category: "Success",
    meaning: "The API accepted the request and completed the expected action.",
  },
  {
    range: "3xx",
    category: "Redirection",
    meaning: "The API is telling the caller to use another location or cached result.",
  },
  {
    range: "4xx",
    category: "Client Error",
    meaning: "The request could not be fulfilled because something about the request is wrong.",
  },
  {
    range: "5xx",
    category: "Server Error",
    meaning: "The request looked valid, but the server or a dependent service failed.",
  },
];

export const HTTP_STATUS_GUIDE = {
  100: {
    code: 100,
    name: "Continue",
    category: "Informational",
    plainLanguage: "The API is ready to receive the rest of the request.",
    apiExample: "A client sends headers first, then continues uploading a large request body.",
    testerAction: "Usually no action is needed unless the upload never finishes.",
  },
  101: {
    code: 101,
    name: "Switching Protocols",
    category: "Informational",
    plainLanguage: "The API agreed to switch to another protocol.",
    apiExample: "A connection upgrades from HTTP to WebSocket.",
    testerAction: "Confirm the client supports the requested protocol switch.",
  },
  102: {
    code: 102,
    name: "Processing",
    category: "Informational",
    plainLanguage: "The API is still processing a longer request.",
    apiExample: "A WebDAV operation is accepted but not complete yet.",
    testerAction: "Wait for the final response and check whether the operation completes.",
  },
  103: {
    code: 103,
    name: "Early Hints",
    category: "Informational",
    plainLanguage: "The API is sending early header hints before the final response.",
    apiExample: "A server hints which resources a browser can preload.",
    testerAction: "Review only if page loading or header behavior is under test.",
  },
  104: {
    code: 104,
    name: "Upload Resumption Supported",
    category: "Informational",
    plainLanguage: "The API says an interrupted upload can be resumed.",
    apiExample: "A file upload endpoint confirms resumable upload support.",
    testerAction: "Confirm the client resumes the same upload instead of starting over.",
    note: "Temporary IANA registration for resumable uploads.",
  },
  200: {
    code: 200,
    name: "OK",
    category: "Success",
    plainLanguage: "The API completed the request successfully.",
    apiExample: "A request list endpoint returns the requested records.",
    testerAction: "Confirm the response body contains the expected data.",
  },
  201: {
    code: 201,
    name: "Created",
    category: "Success",
    plainLanguage: "The API created a new record successfully.",
    apiExample: "Creating a purchase request returns the new request identifier.",
    testerAction: "Confirm the new record can be found in the API or UI.",
  },
  202: {
    code: 202,
    name: "Accepted",
    category: "Success",
    plainLanguage: "The API accepted the request but may finish it later.",
    apiExample: "A background import job is queued for processing.",
    testerAction: "Check the job status or follow-up event for the final result.",
  },
  203: {
    code: 203,
    name: "Non-Authoritative Information",
    category: "Success",
    plainLanguage: "The API returned successful data that may have been modified by a proxy.",
    apiExample: "A gateway returns transformed data from another source.",
    testerAction: "Confirm whether transformed data is expected for this endpoint.",
  },
  204: {
    code: 204,
    name: "No Content",
    category: "Success",
    plainLanguage: "The API succeeded and intentionally returned no response body.",
    apiExample: "Deleting a draft returns no body after the delete succeeds.",
    testerAction: "Confirm the record changed even though the response body is empty.",
  },
  205: {
    code: 205,
    name: "Reset Content",
    category: "Success",
    plainLanguage: "The API succeeded and asks the client to reset the input view.",
    apiExample: "A form submission succeeds and the client should clear the form.",
    testerAction: "Confirm the UI clears or resets the submitted form.",
  },
  206: {
    code: 206,
    name: "Partial Content",
    category: "Success",
    plainLanguage: "The API returned only the requested part of a resource.",
    apiExample: "A file download returns a requested byte range.",
    testerAction: "Confirm the returned range matches what the request asked for.",
  },
  207: {
    code: 207,
    name: "Multi-Status",
    category: "Success",
    plainLanguage: "The API returned separate statuses for multiple operations.",
    apiExample: "A bulk update reports success for some records and failure for others.",
    testerAction: "Review each item result instead of only the overall status.",
  },
  208: {
    code: 208,
    name: "Already Reported",
    category: "Success",
    plainLanguage: "The API avoids repeating a resource that was already included.",
    apiExample: "A WebDAV response omits a duplicate resource in a collection.",
    testerAction: "Confirm no expected item is missing from the complete response.",
  },
  226: {
    code: 226,
    name: "IM Used",
    category: "Success",
    plainLanguage: "The API returned a transformed representation of the resource.",
    apiExample: "A server returns a delta or instance-manipulated response.",
    testerAction: "Confirm the client understands the returned representation.",
  },
  300: {
    code: 300,
    name: "Multiple Choices",
    category: "Redirection",
    plainLanguage: "The API found more than one possible response location.",
    apiExample: "A resource can be downloaded in multiple formats.",
    testerAction: "Confirm the client chooses the correct option.",
  },
  301: {
    code: 301,
    name: "Moved Permanently",
    category: "Redirection",
    plainLanguage: "The API resource has a permanent new URL.",
    apiExample: "An old endpoint redirects to a new endpoint permanently.",
    testerAction: "Update the endpoint if the old URL should no longer be used.",
  },
  302: {
    code: 302,
    name: "Found",
    category: "Redirection",
    plainLanguage: "The API resource is temporarily available at another URL.",
    apiExample: "A login flow redirects to a temporary authentication location.",
    testerAction: "Confirm the redirect target is expected for this environment.",
  },
  303: {
    code: 303,
    name: "See Other",
    category: "Redirection",
    plainLanguage: "The API asks the client to fetch the result from another URL.",
    apiExample: "After creating a job, the response points to a job status URL.",
    testerAction: "Follow the provided location and confirm the final result.",
  },
  304: {
    code: 304,
    name: "Not Modified",
    category: "Redirection",
    plainLanguage: "The cached version is still valid.",
    apiExample: "A request with cache headers receives no new body.",
    testerAction: "Confirm caching behavior is expected for the endpoint.",
  },
  305: {
    code: 305,
    name: "Use Proxy",
    category: "Redirection",
    plainLanguage: "The API says the request must go through a proxy.",
    apiExample: "A legacy service requires a configured proxy.",
    testerAction: "Check proxy configuration if this appears unexpectedly.",
  },
  306: {
    code: 306,
    name: "Unused",
    category: "Redirection",
    plainLanguage: "This code is reserved and should not be used by modern APIs.",
    apiExample: "A modern Penny API should not intentionally return this code.",
    testerAction: "Raise it as unexpected unless a legacy dependency is documented.",
  },
  307: {
    code: 307,
    name: "Temporary Redirect",
    category: "Redirection",
    plainLanguage: "The API temporarily redirects without changing the request method.",
    apiExample: "A POST request is redirected to a temporary service URL.",
    testerAction: "Confirm the redirected request keeps the same method and body.",
  },
  308: {
    code: 308,
    name: "Permanent Redirect",
    category: "Redirection",
    plainLanguage: "The API permanently redirects without changing the request method.",
    apiExample: "An endpoint permanently moves while preserving POST behavior.",
    testerAction: "Update the endpoint and confirm the method is preserved.",
  },
  400: {
    code: 400,
    name: "Bad Request",
    category: "Client Error",
    plainLanguage: "The API could not understand the request.",
    apiExample: "A required JSON field is missing or the JSON is malformed.",
    testerAction: "Check required fields, field names, and request body format.",
  },
  401: {
    code: 401,
    name: "Unauthorized",
    category: "Client Error",
    plainLanguage: "The request is not signed in or the token is invalid.",
    apiExample: "A request is sent without a valid bearer token.",
    testerAction: "Check credentials, token generation, and session expiry.",
  },
  402: {
    code: 402,
    name: "Payment Required",
    category: "Client Error",
    plainLanguage: "Payment or billing action is required before continuing.",
    apiExample: "A paid feature is blocked until billing is active.",
    testerAction: "Confirm account billing or feature entitlement setup.",
  },
  403: {
    code: 403,
    name: "Forbidden",
    category: "Client Error",
    plainLanguage: "The user is signed in but is not allowed to perform the action.",
    apiExample: "A normal user tries to access an admin-only endpoint.",
    testerAction: "Check role, permissions, organisation code, and feature access.",
  },
  404: {
    code: 404,
    name: "Not Found",
    category: "Client Error",
    plainLanguage: "The requested record or endpoint was not found.",
    apiExample: "A purchase order sync references an order that does not exist.",
    testerAction: "Confirm the endpoint path and referenced record exist in the environment.",
  },
  405: {
    code: 405,
    name: "Method Not Allowed",
    category: "Client Error",
    plainLanguage: "The endpoint exists but does not allow this HTTP method.",
    apiExample: "A test sends POST to an endpoint that only supports GET.",
    testerAction: "Check whether the test uses the correct HTTP method.",
  },
  406: {
    code: 406,
    name: "Not Acceptable",
    category: "Client Error",
    plainLanguage: "The API cannot return a response in the requested format.",
    apiExample: "The request asks for XML when the endpoint only returns JSON.",
    testerAction: "Check the Accept header and supported response formats.",
  },
  407: {
    code: 407,
    name: "Proxy Authentication Required",
    category: "Client Error",
    plainLanguage: "The request must authenticate with a proxy first.",
    apiExample: "A corporate proxy blocks the API call until proxy login succeeds.",
    testerAction: "Check proxy settings and proxy credentials.",
  },
  408: {
    code: 408,
    name: "Request Timeout",
    category: "Client Error",
    plainLanguage: "The server timed out waiting for the full request.",
    apiExample: "A slow upload does not finish before the server timeout.",
    testerAction: "Retry and check network speed, payload size, and timeout settings.",
  },
  409: {
    code: 409,
    name: "Conflict",
    category: "Client Error",
    plainLanguage: "The request conflicts with the current state of the record.",
    apiExample: "A test creates a record that already exists or updates the wrong workflow state.",
    testerAction: "Check duplicate data and whether the record is in the expected state.",
  },
  410: {
    code: 410,
    name: "Gone",
    category: "Client Error",
    plainLanguage: "The record used to exist but is no longer available.",
    apiExample: "A deleted resource is requested after permanent removal.",
    testerAction: "Confirm whether the record was deleted or archived intentionally.",
  },
  411: {
    code: 411,
    name: "Length Required",
    category: "Client Error",
    plainLanguage: "The API requires a Content-Length header.",
    apiExample: "A client uploads a body without telling the server its length.",
    testerAction: "Check request headers and upload/client configuration.",
  },
  412: {
    code: 412,
    name: "Precondition Failed",
    category: "Client Error",
    plainLanguage: "A required request condition was not met.",
    apiExample: "An update uses an old version or ETag for a record.",
    testerAction: "Refresh the record and confirm version or precondition headers.",
  },
  413: {
    code: 413,
    name: "Content Too Large",
    category: "Client Error",
    plainLanguage: "The request body is larger than the API allows.",
    apiExample: "An attachment upload exceeds the maximum file size.",
    testerAction: "Check file size, payload size, and configured limits.",
  },
  414: {
    code: 414,
    name: "URI Too Long",
    category: "Client Error",
    plainLanguage: "The request URL is longer than the API allows.",
    apiExample: "Too many filter values are sent in the query string.",
    testerAction: "Move large inputs to the body or reduce query parameters.",
  },
  415: {
    code: 415,
    name: "Unsupported Media Type",
    category: "Client Error",
    plainLanguage: "The API does not support the request content type.",
    apiExample: "The request sends text/plain when the endpoint expects application/json.",
    testerAction: "Check Content-Type and payload format.",
  },
  416: {
    code: 416,
    name: "Range Not Satisfiable",
    category: "Client Error",
    plainLanguage: "The requested content range is outside what the resource can provide.",
    apiExample: "A file download asks for bytes beyond the end of the file.",
    testerAction: "Check the requested range and file size.",
  },
  417: {
    code: 417,
    name: "Expectation Failed",
    category: "Client Error",
    plainLanguage: "The server cannot meet the expectation requested by the client.",
    apiExample: "A client sends an Expect header the server does not support.",
    testerAction: "Check request headers generated by the client.",
  },
  418: {
    code: 418,
    name: "Unused",
    category: "Client Error",
    plainLanguage: "This code is reserved and should not be used by normal APIs.",
    apiExample: "A production API should not rely on this status for business behavior.",
    testerAction: "Treat it as unexpected unless the service explicitly documents it.",
  },
  421: {
    code: 421,
    name: "Misdirected Request",
    category: "Client Error",
    plainLanguage: "The request reached a server that cannot answer for this host.",
    apiExample: "A shared connection routes a request to the wrong virtual host.",
    testerAction: "Check base URL, host headers, and gateway routing.",
  },
  422: {
    code: 422,
    name: "Unprocessable Content",
    category: "Client Error",
    plainLanguage: "The API understood the request but rejected its business content.",
    apiExample: "A purchase request has a valid shape but an invalid delivery date.",
    testerAction: "Check business validation messages and field values.",
  },
  423: {
    code: 423,
    name: "Locked",
    category: "Client Error",
    plainLanguage: "The requested resource is locked.",
    apiExample: "A document cannot be updated because another process locked it.",
    testerAction: "Check whether another workflow or user is holding the lock.",
  },
  424: {
    code: 424,
    name: "Failed Dependency",
    category: "Client Error",
    plainLanguage: "This request failed because a related request or dependency failed.",
    apiExample: "A multi-step update fails after an earlier item in the batch fails.",
    testerAction: "Review the earlier failed operation first.",
  },
  425: {
    code: 425,
    name: "Too Early",
    category: "Client Error",
    plainLanguage: "The server is avoiding a request that might be replayed unsafely.",
    apiExample: "A gateway rejects an early retry of a non-idempotent POST.",
    testerAction: "Retry later and check client retry behavior.",
  },
  426: {
    code: 426,
    name: "Upgrade Required",
    category: "Client Error",
    plainLanguage: "The API requires the client to use a different protocol.",
    apiExample: "The service requires a newer TLS or HTTP protocol.",
    testerAction: "Check client protocol, TLS, and gateway configuration.",
  },
  428: {
    code: 428,
    name: "Precondition Required",
    category: "Client Error",
    plainLanguage: "The API requires a conditional request to prevent overwrites.",
    apiExample: "An update must include If-Match so it does not overwrite newer changes.",
    testerAction: "Check required version or ETag headers.",
  },
  429: {
    code: 429,
    name: "Too Many Requests",
    category: "Client Error",
    plainLanguage: "The caller sent too many requests too quickly.",
    apiExample: "A load or retry loop hits the rate limit.",
    testerAction: "Wait, reduce request rate, and check rate-limit headers.",
  },
  431: {
    code: 431,
    name: "Request Header Fields Too Large",
    category: "Client Error",
    plainLanguage: "One or more request headers are too large.",
    apiExample: "A token or cookie header exceeds the allowed size.",
    testerAction: "Check token size, cookies, and custom headers.",
  },
  451: {
    code: 451,
    name: "Unavailable For Legal Reasons",
    category: "Client Error",
    plainLanguage: "The resource is blocked because of a legal restriction.",
    apiExample: "A regional legal restriction prevents access to a resource.",
    testerAction: "Confirm region, tenant, and compliance rules.",
  },
  500: {
    code: 500,
    name: "Internal Server Error",
    category: "Server Error",
    plainLanguage: "The server failed unexpectedly.",
    apiExample: "An unhandled backend error occurs while creating a record.",
    testerAction: "Check API logs, request ID, and recent backend changes.",
  },
  501: {
    code: 501,
    name: "Not Implemented",
    category: "Server Error",
    plainLanguage: "The server does not support the requested functionality.",
    apiExample: "An endpoint receives an HTTP method that the server cannot implement.",
    testerAction: "Confirm the endpoint is available in this environment.",
  },
  502: {
    code: 502,
    name: "Bad Gateway",
    category: "Server Error",
    plainLanguage: "A gateway received an invalid response from an upstream service.",
    apiExample: "The API gateway cannot get a valid response from an internal service.",
    testerAction: "Check gateway logs and upstream service health.",
  },
  503: {
    code: 503,
    name: "Service Unavailable",
    category: "Server Error",
    plainLanguage: "The service is temporarily unavailable or overloaded.",
    apiExample: "The API is down for deployment or has too many requests.",
    testerAction: "Check service health, deployment status, and retry-after headers.",
  },
  504: {
    code: 504,
    name: "Gateway Timeout",
    category: "Server Error",
    plainLanguage: "A gateway waited too long for an upstream service.",
    apiExample: "A report endpoint times out while waiting for another service.",
    testerAction: "Check upstream service latency and timeout settings.",
  },
  505: {
    code: 505,
    name: "HTTP Version Not Supported",
    category: "Server Error",
    plainLanguage: "The server does not support the HTTP version used by the client.",
    apiExample: "A client uses an HTTP version the gateway rejects.",
    testerAction: "Check client, proxy, and gateway protocol versions.",
  },
  506: {
    code: 506,
    name: "Variant Also Negotiates",
    category: "Server Error",
    plainLanguage: "The server has a configuration problem while selecting a response variant.",
    apiExample: "Content negotiation loops because of server configuration.",
    testerAction: "Check server configuration for content negotiation.",
  },
  507: {
    code: 507,
    name: "Insufficient Storage",
    category: "Server Error",
    plainLanguage: "The server does not have enough storage to complete the request.",
    apiExample: "An attachment upload fails because storage is full.",
    testerAction: "Check storage capacity and file service health.",
  },
  508: {
    code: 508,
    name: "Loop Detected",
    category: "Server Error",
    plainLanguage: "The server detected a loop while processing the request.",
    apiExample: "A nested resource operation loops through linked resources.",
    testerAction: "Check resource relationships and backend recursion safeguards.",
  },
  510: {
    code: 510,
    name: "Not Extended",
    category: "Server Error",
    plainLanguage: "The server requires additional request extensions.",
    apiExample: "A legacy extension requirement is not satisfied.",
    testerAction: "Treat this as unusual and confirm whether a legacy dependency is involved.",
    note: "Obsoleted in the IANA registry.",
  },
  511: {
    code: 511,
    name: "Network Authentication Required",
    category: "Server Error",
    plainLanguage: "The network requires authentication before the request can continue.",
    apiExample: "A captive portal or network gateway requires sign-in.",
    testerAction: "Check network access, VPN, proxy, or captive portal login.",
  },
} as const;

export const REGISTERED_HTTP_STATUS_CODES: readonly number[] = Object.keys(HTTP_STATUS_GUIDE)
  .map(Number)
  .sort((left, right) => left - right);

export function getHttpStatusGuide(statusCode: number): HttpStatusGuide | undefined {
  return (HTTP_STATUS_GUIDE as Readonly<Record<number, HttpStatusGuide>>)[statusCode];
}

export function formatHttpStatus(statusCode: number): string {
  const guide = getHttpStatusGuide(statusCode);
  return guide ? `${guide.code} ${guide.name}` : `${statusCode} Unknown Status`;
}

export function explainHttpStatus(statusCode: number): string {
  const guide = getHttpStatusGuide(statusCode);
  if (guide) {
    return `${formatHttpStatus(statusCode)}: ${guide.plainLanguage}`;
  }

  const category = statusCategory(statusCode);
  return category
    ? `${statusCode}: Unregistered ${category.toLowerCase()} status code.`
    : `${statusCode}: Not an HTTP status code.`;
}

export function expectedHttpStatusText(expectedStatus?: number): string {
  if (expectedStatus === undefined) {
    return "The system should return a successful 2xx response.";
  }

  const guide = getHttpStatusGuide(expectedStatus);
  if (guide) {
    return `The system should return ${formatHttpStatus(expectedStatus)}. ${guide.plainLanguage}`;
  }

  return `The system should return status ${expectedStatus}.`;
}

export function httpStatusFailureHints(
  expectedStatus: number | undefined,
  actualStatus: number,
): string[] {
  const hints: string[] = [];

  if (expectedStatus !== undefined) {
    hints.push(
      `Expected ${formatHttpStatus(expectedStatus)}, but the system returned ${formatHttpStatus(
        actualStatus,
      )}.`,
    );
  }

  if (expectedStatus && expectedStatus >= 400 && actualStatus >= 200 && actualStatus < 300) {
    hints.push(
      "This negative check expected the system to reject the action, but it was accepted.",
    );
  }

  const actualGuide = getHttpStatusGuide(actualStatus);
  if (actualGuide) {
    hints.push(actualGuide.testerAction);
  } else if (actualStatus === 0) {
    hints.push("The system could not be reached. Check network access and the base URL.");
  } else {
    const category = statusCategory(actualStatus);
    hints.push(
      category
        ? `This is an unregistered ${category.toLowerCase()} status. Check API logs and gateway behavior.`
        : "This is not a valid HTTP status code. Check the API client or network failure details.",
    );
  }

  return [...new Set(hints)];
}

function statusCategory(statusCode: number): HttpStatusCategory | undefined {
  if (statusCode >= 100 && statusCode < 200) return "Informational";
  if (statusCode >= 200 && statusCode < 300) return "Success";
  if (statusCode >= 300 && statusCode < 400) return "Redirection";
  if (statusCode >= 400 && statusCode < 500) return "Client Error";
  if (statusCode >= 500 && statusCode < 600) return "Server Error";
  return undefined;
}
