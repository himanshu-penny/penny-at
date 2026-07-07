# API Status Codes Guide

This guide explains HTTP status codes in manual-tester language, with API
examples and first checks. The framework source of truth lives in
`src/core/http-status-guide.ts`, and the manual test report uses it when API
steps pass or fail.

The registered status list is based on the
[IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml),
last checked against the 2025-09-15 registry update.

Unassigned ranges are not listed as individual API outcomes. If an unregistered
code appears, the framework explains it by status class and asks the tester to
check gateway or API behavior.

## How To Read Status Codes

| Range | Meaning       | Manual tester view                                                               |
| ----- | ------------- | -------------------------------------------------------------------------------- |
| `1xx` | Informational | The API received the request and is still working through the exchange.          |
| `2xx` | Success       | The API accepted the request and completed the expected action.                  |
| `3xx` | Redirection   | The API is telling the caller to use another location or cached result.          |
| `4xx` | Client Error  | The request could not be fulfilled because something about the request is wrong. |
| `5xx` | Server Error  | The request looked valid, but the server or a dependent service failed.          |

## Framework Usage

The status guide is used automatically when an API script calls the framework
API helpers:

```typescript
const response = await requestHandler.path(API_PATHS.REQUESTS.BASE).get(200);
```

The Allure `Manual tester guide` attachment will include:

- the expected status meaning, such as `200 OK`
- the actual status meaning, such as `404 Not Found`
- a response summary
- a first-check hint, such as checking whether the referenced record exists

Automation engineers can also use the guide directly:

```typescript
import { explainHttpStatus, getHttpStatusGuide } from "@core/http-status-guide";

console.log(explainHttpStatus(409));
console.log(getHttpStatusGuide(422)?.testerAction);
```

## 1xx Informational

| Code                              | Meaning                                                          | Example                                                                      | First check                                                            |
| --------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `100 Continue`                    | The API is ready to receive the rest of the request.             | A client sends headers first, then continues uploading a large request body. | Usually no action is needed unless the upload never finishes.          |
| `101 Switching Protocols`         | The API agreed to switch to another protocol.                    | A connection upgrades from HTTP to WebSocket.                                | Confirm the client supports the requested protocol switch.             |
| `102 Processing`                  | The API is still processing a longer request.                    | A WebDAV operation is accepted but not complete yet.                         | Wait for the final response and check whether the operation completes. |
| `103 Early Hints`                 | The API is sending early header hints before the final response. | A server hints which resources a browser can preload.                        | Review only if page loading or header behavior is under test.          |
| `104 Upload Resumption Supported` | The API says an interrupted upload can be resumed.               | A file upload endpoint confirms resumable upload support.                    | Confirm the client resumes the same upload instead of starting over.   |

## 2xx Success

| Code                                | Meaning                                                                  | Example                                                                | First check                                                        |
| ----------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `200 OK`                            | The API completed the request successfully.                              | A request list endpoint returns the requested records.                 | Confirm the response body contains the expected data.              |
| `201 Created`                       | The API created a new record successfully.                               | Creating a purchase request returns the new request identifier.        | Confirm the new record can be found in the API or UI.              |
| `202 Accepted`                      | The API accepted the request but may finish it later.                    | A background import job is queued for processing.                      | Check the job status or follow-up event for the final result.      |
| `203 Non-Authoritative Information` | The API returned successful data that may have been modified by a proxy. | A gateway returns transformed data from another source.                | Confirm whether transformed data is expected for this endpoint.    |
| `204 No Content`                    | The API succeeded and intentionally returned no response body.           | Deleting a draft returns no body after the delete succeeds.            | Confirm the record changed even though the response body is empty. |
| `205 Reset Content`                 | The API succeeded and asks the client to reset the input view.           | A form submission succeeds and the client should clear the form.       | Confirm the UI clears or resets the submitted form.                |
| `206 Partial Content`               | The API returned only the requested part of a resource.                  | A file download returns a requested byte range.                        | Confirm the returned range matches what the request asked for.     |
| `207 Multi-Status`                  | The API returned separate statuses for multiple operations.              | A bulk update reports success for some records and failure for others. | Review each item result instead of only the overall status.        |
| `208 Already Reported`              | The API avoids repeating a resource that was already included.           | A WebDAV response omits a duplicate resource in a collection.          | Confirm no expected item is missing from the complete response.    |
| `226 IM Used`                       | The API returned a transformed representation of the resource.           | A server returns a delta or instance-manipulated response.             | Confirm the client understands the returned representation.        |

## 3xx Redirection

| Code                     | Meaning                                                            | Example                                                        | First check                                                      |
| ------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `300 Multiple Choices`   | The API found more than one possible response location.            | A resource can be downloaded in multiple formats.              | Confirm the client chooses the correct option.                   |
| `301 Moved Permanently`  | The API resource has a permanent new URL.                          | An old endpoint redirects to a new endpoint permanently.       | Update the endpoint if the old URL should no longer be used.     |
| `302 Found`              | The API resource is temporarily available at another URL.          | A login flow redirects to a temporary authentication location. | Confirm the redirect target is expected for this environment.    |
| `303 See Other`          | The API asks the client to fetch the result from another URL.      | After creating a job, the response points to a job status URL. | Follow the provided location and confirm the final result.       |
| `304 Not Modified`       | The cached version is still valid.                                 | A request with cache headers receives no new body.             | Confirm caching behavior is expected for the endpoint.           |
| `305 Use Proxy`          | The API says the request must go through a proxy.                  | A legacy service requires a configured proxy.                  | Check proxy configuration if this appears unexpectedly.          |
| `306 Unused`             | This code is reserved and should not be used by modern APIs.       | A modern Penny API should not intentionally return this code.  | Raise it as unexpected unless a legacy dependency is documented. |
| `307 Temporary Redirect` | The API temporarily redirects without changing the request method. | A POST request is redirected to a temporary service URL.       | Confirm the redirected request keeps the same method and body.   |
| `308 Permanent Redirect` | The API permanently redirects without changing the request method. | An endpoint permanently moves while preserving POST behavior.  | Update the endpoint and confirm the method is preserved.         |

## 4xx Client Error

| Code                                  | Meaning                                                               | Example                                                                          | First check                                                               |
| ------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `400 Bad Request`                     | The API could not understand the request.                             | A required JSON field is missing or the JSON is malformed.                       | Check required fields, field names, and request body format.              |
| `401 Unauthorized`                    | The request is not signed in or the token is invalid.                 | A request is sent without a valid bearer token.                                  | Check credentials, token generation, and session expiry.                  |
| `402 Payment Required`                | Payment or billing action is required before continuing.              | A paid feature is blocked until billing is active.                               | Confirm account billing or feature entitlement setup.                     |
| `403 Forbidden`                       | The user is signed in but is not allowed to perform the action.       | A normal user tries to access an admin-only endpoint.                            | Check role, permissions, organisation code, and feature access.           |
| `404 Not Found`                       | The requested record or endpoint was not found.                       | A purchase order sync references an order that does not exist.                   | Confirm the endpoint path and referenced record exist in the environment. |
| `405 Method Not Allowed`              | The endpoint exists but does not allow this HTTP method.              | A test sends POST to an endpoint that only supports GET.                         | Check whether the test uses the correct HTTP method.                      |
| `406 Not Acceptable`                  | The API cannot return a response in the requested format.             | The request asks for XML when the endpoint only returns JSON.                    | Check the Accept header and supported response formats.                   |
| `407 Proxy Authentication Required`   | The request must authenticate with a proxy first.                     | A corporate proxy blocks the API call until proxy login succeeds.                | Check proxy settings and proxy credentials.                               |
| `408 Request Timeout`                 | The server timed out waiting for the full request.                    | A slow upload does not finish before the server timeout.                         | Retry and check network speed, payload size, and timeout settings.        |
| `409 Conflict`                        | The request conflicts with the current state of the record.           | A test creates a record that already exists or updates the wrong workflow state. | Check duplicate data and whether the record is in the expected state.     |
| `410 Gone`                            | The record used to exist but is no longer available.                  | A deleted resource is requested after permanent removal.                         | Confirm whether the record was deleted or archived intentionally.         |
| `411 Length Required`                 | The API requires a Content-Length header.                             | A client uploads a body without telling the server its length.                   | Check request headers and upload/client configuration.                    |
| `412 Precondition Failed`             | A required request condition was not met.                             | An update uses an old version or ETag for a record.                              | Refresh the record and confirm version or precondition headers.           |
| `413 Content Too Large`               | The request body is larger than the API allows.                       | An attachment upload exceeds the maximum file size.                              | Check file size, payload size, and configured limits.                     |
| `414 URI Too Long`                    | The request URL is longer than the API allows.                        | Too many filter values are sent in the query string.                             | Move large inputs to the body or reduce query parameters.                 |
| `415 Unsupported Media Type`          | The API does not support the request content type.                    | The request sends text/plain when the endpoint expects application/json.         | Check Content-Type and payload format.                                    |
| `416 Range Not Satisfiable`           | The requested content range is outside what the resource can provide. | A file download asks for bytes beyond the end of the file.                       | Check the requested range and file size.                                  |
| `417 Expectation Failed`              | The server cannot meet the expectation requested by the client.       | A client sends an Expect header the server does not support.                     | Check request headers generated by the client.                            |
| `418 Unused`                          | This code is reserved and should not be used by normal APIs.          | A production API should not rely on this status for business behavior.           | Treat it as unexpected unless the service explicitly documents it.        |
| `421 Misdirected Request`             | The request reached a server that cannot answer for this host.        | A shared connection routes a request to the wrong virtual host.                  | Check base URL, host headers, and gateway routing.                        |
| `422 Unprocessable Content`           | The API understood the request but rejected its business content.     | A purchase request has a valid shape but an invalid delivery date.               | Check business validation messages and field values.                      |
| `423 Locked`                          | The requested resource is locked.                                     | A document cannot be updated because another process locked it.                  | Check whether another workflow or user is holding the lock.               |
| `424 Failed Dependency`               | This request failed because a related request or dependency failed.   | A multi-step update fails after an earlier item in the batch fails.              | Review the earlier failed operation first.                                |
| `425 Too Early`                       | The server is avoiding a request that might be replayed unsafely.     | A gateway rejects an early retry of a non-idempotent POST.                       | Retry later and check client retry behavior.                              |
| `426 Upgrade Required`                | The API requires the client to use a different protocol.              | The service requires a newer TLS or HTTP protocol.                               | Check client protocol, TLS, and gateway configuration.                    |
| `428 Precondition Required`           | The API requires a conditional request to prevent overwrites.         | An update must include If-Match so it does not overwrite newer changes.          | Check required version or ETag headers.                                   |
| `429 Too Many Requests`               | The caller sent too many requests too quickly.                        | A load or retry loop hits the rate limit.                                        | Wait, reduce request rate, and check rate-limit headers.                  |
| `431 Request Header Fields Too Large` | One or more request headers are too large.                            | A token or cookie header exceeds the allowed size.                               | Check token size, cookies, and custom headers.                            |
| `451 Unavailable For Legal Reasons`   | The resource is blocked because of a legal restriction.               | A regional legal restriction prevents access to a resource.                      | Confirm region, tenant, and compliance rules.                             |

## 5xx Server Error

| Code                                  | Meaning                                                                    | Example                                                               | First check                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `500 Internal Server Error`           | The server failed unexpectedly.                                            | An unhandled backend error occurs while creating a record.            | Check API logs, request ID, and recent backend changes.                    |
| `501 Not Implemented`                 | The server does not support the requested functionality.                   | An endpoint receives an HTTP method that the server cannot implement. | Confirm the endpoint is available in this environment.                     |
| `502 Bad Gateway`                     | A gateway received an invalid response from an upstream service.           | The API gateway cannot get a valid response from an internal service. | Check gateway logs and upstream service health.                            |
| `503 Service Unavailable`             | The service is temporarily unavailable or overloaded.                      | The API is down for deployment or has too many requests.              | Check service health, deployment status, and retry-after headers.          |
| `504 Gateway Timeout`                 | A gateway waited too long for an upstream service.                         | A report endpoint times out while waiting for another service.        | Check upstream service latency and timeout settings.                       |
| `505 HTTP Version Not Supported`      | The server does not support the HTTP version used by the client.           | A client uses an HTTP version the gateway rejects.                    | Check client, proxy, and gateway protocol versions.                        |
| `506 Variant Also Negotiates`         | The server has a configuration problem while selecting a response variant. | Content negotiation loops because of server configuration.            | Check server configuration for content negotiation.                        |
| `507 Insufficient Storage`            | The server does not have enough storage to complete the request.           | An attachment upload fails because storage is full.                   | Check storage capacity and file service health.                            |
| `508 Loop Detected`                   | The server detected a loop while processing the request.                   | A nested resource operation loops through linked resources.           | Check resource relationships and backend recursion safeguards.             |
| `510 Not Extended`                    | The server requires additional request extensions.                         | A legacy extension requirement is not satisfied.                      | Treat this as unusual and confirm whether a legacy dependency is involved. |
| `511 Network Authentication Required` | The network requires authentication before the request can continue.       | A captive portal or network gateway requires sign-in.                 | Check network access, VPN, proxy, or captive portal login.                 |
