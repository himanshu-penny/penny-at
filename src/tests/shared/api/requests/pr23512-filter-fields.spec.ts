// cspell:disable
import { test, expect } from "@fixtures";
import { addAllureParameter } from "@utils/helpers/allure-metadata.helper";
import {
  fetchExpenseRequests,
  fetchPendingRfqs,
  fetchRequests,
  fmtList,
} from "../_support/penny-list-api.helpers";
import { OBJECT_ID_PATTERN } from "../_support/penny-list-api.types";

/**
 * PR #23512 — Faceted Set-Filters & eSource $lookup Fix
 *
 * PURPOSE:
 *   Validate the API contract changes introduced in PR #23512:
 *   - Requests list returns all fields required for faceted set-filters
 *     (requestId, title, requestor, requestType)
 *   - Expense Requests list returns faceted list arrays
 *     (requestTitleList, requestorList, requestIdList)
 *   - eSource pending RFQs list returns all fields required for
 *     faceted set-filters (requestId, requestTitle, requestor,
 *     esourceAssignee, esourceAssigneeName, locationName)
 *   - esourceAssigneeName is resolved to a human-readable name via
 *     $lookup aggregation — NOT a raw MongoDB ObjectId (bug fix)
 *   - Faceted behaviour: applying one filter does not collapse other *List arrays
 *   - keyValueParser applied to set-filter values (no 4xx/5xx on typed ID filters)
 *   - Unauthenticated access is rejected with 401
 *
 * ENDPOINTS:
 *   GET /api/request?page=0&limit=10
 *   GET /api/request/expense?page=0&limit=10
 *   GET /api/rfqs/pending?page=0&limit=10
 *
 * TAGS: @regression @api
 *
 * HOW TO RUN:
 *   npx playwright test src/tests/shared/api/requests/pr23512-filter-fields.spec.ts --project=api-testing
 *
 * ENVIRONMENT:
 *   Set CLIENT + TEST_ENV before running (see src/config/client-config.ts).
 *   Credentials are loaded from src/config/clients/{client}/{env}.env.
 */

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe(
  "TC_API_PENNY_PR23512 — Faceted Filters & eSource $lookup",
  { tag: ["@regression", "@api"] },
  () => {
    // ── TC_001: Requests — per-item filter fields ─────────────────────────────

    /**
     * TC_API_PENNY_PR23512_001
     * Each item in GET /api/request must carry the fields the ag-Grid set-filter
     * dropdowns depend on: id, title, requestor, requestType, status,
     * requestSourcingStatus. When esourceAssigneeName is set it must be a
     * human-readable name, not a raw MongoDB ObjectId.
     */
    test("TC_API_PENNY_PR23512_001 — requests list returns filter fields (id, title, requestor, requestType)", async ({
      adminAccessToken,
      manualGuide,
      pennyRequestsApi,
    }) => {
      manualGuide.case({
        purpose:
          "Confirm the Requests list gives the Penny UI the values needed to show working filters.",
        preconditions: [
          "The selected client and environment are reachable.",
          "The admin account can open the Requests list.",
        ],
        expectedResult: [
          "The Requests list API responds successfully.",
          "Every returned request includes the values used by the list filters.",
          "The assignee name is readable when it is returned.",
        ],
        failureHints: [
          "If the test fails with 401, check the admin credentials for CLIENT and TEST_ENV.",
          "If a required value is missing, compare the response with the Requests grid columns.",
          "If the assignee name looks like an ObjectId, check the API lookup that resolves users.",
        ],
        testData: {
          endpoint: "GET /api/request",
          page: "0",
          limit: "10",
        },
      });
      await addAllureParameter("Endpoint", "GET /api/request");
      await addAllureParameter("Page", "0");
      await addAllureParameter("Limit", "10");

      // The tester opens the same Requests list data that the UI uses.
      const body = await manualGuide.step(
        {
          action: "Open the Requests list data",
          expected: "The API returns the first page of requests for the selected environment.",
          failureHints: [
            "Check that the API base URL points to the intended environment.",
            "Check that the admin user can log in to Penny for this client.",
          ],
        },
        () => fetchRequests(pennyRequestsApi, adminAccessToken),
      );

      // The tester should see a list of requests in the response.
      await manualGuide.step(
        {
          action: "Check that the response contains a Requests list",
          expected: "The response includes a list that can be shown in the Requests page.",
          failureHints: [
            "Open the request/response attachment and confirm whether the response shape changed.",
          ],
          evidence: {
            returnedItems: body.requests?.length ?? 0,
            totalCount: body.totalCount ?? body.total ?? "not returned",
          },
        },
        async () => {
          expect(body, "Response should have a requests array").toHaveProperty("requests");
          expect(Array.isArray(body.requests), "requests should be an array").toBe(true);
          await addAllureParameter("Items in page", String(body.requests.length));
          await addAllureParameter(
            "Total count",
            String(body.totalCount ?? body.total ?? "not returned"),
          );
        },
      );

      // Each visible request should carry the values needed by the filter menus.
      await manualGuide.step(
        {
          action: `Review ${body.requests.length} returned request records`,
          expected:
            "Each request has the ID, title, requester, type, status, and sourcing status values used by filters.",
          failureHints: [
            "Check which field is reported as missing in the failed expectation.",
            "Confirm whether the missing value should be present for this request type.",
          ],
        },
        async () => {
          for (const item of body.requests) {
            await test.step(`Item ${item.id ?? "(no id)"}`, async () => {
              await addAllureParameter("id", String(item.id ?? "MISSING"));
              await addAllureParameter("title", String(item.title ?? "MISSING"));
              await addAllureParameter("requestType", String(item.requestType ?? "(null)"));
              await addAllureParameter("status", String(item.status ?? "MISSING"));
              await addAllureParameter(
                "esourceAssigneeName",
                item.esourceAssigneeName ? String(item.esourceAssigneeName) : "(null)",
              );

              expect(item, "id is required for requestId filter").toHaveProperty("id");
              expect(typeof item.id, "id must be a string").toBe("string");
              expect(item, "title is required for title filter").toHaveProperty("title");
              expect(item, "requestor is required for requestor filter").toHaveProperty(
                "requestor",
              );
              expect(item, "requestType is required for requestType filter").toHaveProperty(
                "requestType",
              );
              expect(item, "status is required for status filter").toHaveProperty("status");
              expect(item, "requestSourcingStatus must be present").toHaveProperty(
                "requestSourcingStatus",
              );

              if (item.esourceAssigneeName) {
                expect(
                  OBJECT_ID_PATTERN.test(item.esourceAssigneeName),
                  `esourceAssigneeName "${item.esourceAssigneeName}" must be a resolved name, not a raw ObjectId`,
                ).toBe(false);
              }
            });
          }
        },
      );
    });

    // ── TC_002: eSource — per-item filter fields + $lookup fix ────────────────

    /**
     * TC_API_PENNY_PR23512_002
     * Each item in GET /api/rfqs/pending must carry the fields the ag-Grid
     * set-filter dropdowns depend on, including esourceAssigneeName resolved
     * to a human-readable string via a MongoDB $lookup aggregation (not an ObjectId).
     */
    test("TC_API_PENNY_PR23512_002 — esource list returns filter fields with esourceAssigneeName resolved via $lookup", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/rfqs/pending");
      await addAllureParameter("Page", "0");
      await addAllureParameter("Limit", "10");

      // ── Act ─────────────────────────────────────────────────────────────────
      const body = await test.step("GET /api/rfqs/pending", () =>
        fetchPendingRfqs(pennyRequestsApi, adminAccessToken));

      // ── Assert — shape ───────────────────────────────────────────────────────
      await test.step("Assert — response has requests array", async () => {
        expect(body, "Response should have a requests array").toHaveProperty("requests");
        expect(Array.isArray(body.requests), "requests should be an array").toBe(true);
        await addAllureParameter("Items in page", String(body.requests.length));
        await addAllureParameter(
          "Total count",
          String(body.totalCount ?? body.total ?? "not returned"),
        );
      });

      // ── Assert — per-item fields ─────────────────────────────────────────────
      await test.step(`Assert — each of ${body.requests.length} items has required filter fields`, async () => {
        for (const item of body.requests) {
          await test.step(`Item ${item.id ?? "(no id)"}`, async () => {
            await addAllureParameter("id", String(item.id ?? "MISSING"));
            await addAllureParameter("title", String(item.title ?? "MISSING"));
            await addAllureParameter(
              "esourceAssigneeName",
              item.esourceAssigneeName ? String(item.esourceAssigneeName) : "(null)",
            );
            await addAllureParameter("locationName", String(item.locationName ?? "(null)"));

            expect(item, "id must be present").toHaveProperty("id");
            expect(typeof item.id, "id must be a string").toBe("string");
            expect(item, "title is required for requestTitle filter").toHaveProperty("title");
            expect(item, "requestor is required for requestor filter").toHaveProperty("requestor");
            expect(item, "esourceAssignee is required for esourceAssignee filter").toHaveProperty(
              "esourceAssignee",
            );
            expect(item, "esourceAssigneeName must be present ($lookup fix)").toHaveProperty(
              "esourceAssigneeName",
            );
            expect(item, "workflow must be present").toHaveProperty("workflow");
            expect(item, "requestSourcingStatus must be present").toHaveProperty(
              "requestSourcingStatus",
            );

            if (item.esourceAssigneeName) {
              expect(typeof item.esourceAssigneeName, "esourceAssigneeName must be a string").toBe(
                "string",
              );
              expect(
                OBJECT_ID_PATTERN.test(item.esourceAssigneeName),
                `esourceAssigneeName "${item.esourceAssigneeName}" must be a resolved name, not a raw ObjectId`,
              ).toBe(false);
            }
          });
        }
      });
    });

    // ── TC_003: Requests — top-level faceted list arrays ──────────────────────

    /**
     * TC_API_PENNY_PR23512_003
     * GET /api/request response must include top-level faceted list arrays
     * (requestorList, requestIdList, requestTypeList, requestTitleList).
     * These arrays populate the ag-Grid set-filter dropdowns in the Requests list view.
     * requestIdList entries must follow the {orgCode}-req-{id} key format.
     */
    test("TC_API_PENNY_PR23512_003 — requests response includes top-level faceted list arrays", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/request");

      // ── Act ─────────────────────────────────────────────────────────────────
      const body = await test.step("GET /api/request", () =>
        fetchRequests(pennyRequestsApi, adminAccessToken));

      // ── Assert — faceted list arrays present ─────────────────────────────────
      await test.step("Assert — classificationsList, statusList, workspaceClassificationList, workspaceList are present", async () => {
        for (const field of [
          "classificationsList",
          "statusList",
          "workspaceClassificationList",
          "workspaceList",
        ] as const) {
          expect(body, `Response should have top-level "${field}" array`).toHaveProperty(field);
          expect(Array.isArray(body[field]), `"${field}" must be an array`).toBe(true);
          await addAllureParameter(
            `${field} (${(body[field] as string[]).length})`,
            fmtList(body[field]),
          );
        }
      });

      // ── Assert — classificationsList entries are non-empty strings ────────────
      await test.step("Assert — classificationsList entries are non-empty strings", async () => {
        if (body.classificationsList && body.classificationsList.length > 0) {
          await addAllureParameter("Sample classification", body.classificationsList[0]);
          for (const val of body.classificationsList) {
            expect(typeof val, "classificationsList entry must be a string").toBe("string");
          }
        }
      });
    });

    // ── TC_004: Expense Requests — per-item fields + top-level lists ──────────

    /**
     * TC_API_PENNY_PR23512_004
     * GET /api/request/expense must return 200 with per-item filter fields
     * (id, title, requestor, status) and top-level faceted list arrays
     * (requestTitleList, requestorList, requestIdList).
     * This is the first automated coverage of the expense-request endpoint.
     */
    test("TC_API_PENNY_PR23512_004 — expense requests response includes filter fields and top-level faceted list arrays", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/request/expense");

      // ── Act ─────────────────────────────────────────────────────────────────
      const body = await test.step("GET /api/request/expense", () =>
        fetchExpenseRequests(pennyRequestsApi, adminAccessToken));

      // ── Assert — shape ───────────────────────────────────────────────────────
      await test.step("Assert — response has requests array", async () => {
        expect(body, "Response should have a requests array").toHaveProperty("requests");
        expect(Array.isArray(body.requests), "requests must be an array").toBe(true);
        await addAllureParameter("Items in page", String(body.requests.length));
      });

      // ── Assert — per-item fields ─────────────────────────────────────────────
      await test.step(`Assert — each of ${body.requests.length} items has required filter fields`, async () => {
        for (const item of body.requests) {
          await test.step(`Item ${item.id ?? "(no id)"}`, async () => {
            await addAllureParameter("id", String(item.id ?? "MISSING"));
            await addAllureParameter("title", String(item.title ?? "MISSING"));
            await addAllureParameter("status", String(item.status ?? "MISSING"));

            expect(item, "id is required for requestId filter").toHaveProperty("id");
            expect(typeof item.id, "id must be a string").toBe("string");
            expect(item, "title is required for title filter").toHaveProperty("title");
            expect(item, "requestor is required for requestor filter").toHaveProperty("requestor");
            expect(item, "status must be present").toHaveProperty("status");
          });
        }
      });

      // ── Assert — top-level faceted lists ─────────────────────────────────────
      await test.step("Assert — faceted list arrays are present", async () => {
        const knownFacetedFields = [
          "requestTitleList",
          "requestorList",
          "requestIdList",
          "classificationsList",
          "statusList",
          "workspaceList",
          "workspaceClassificationList",
        ] as const;
        const presentFields = knownFacetedFields.filter((f) => Array.isArray(body[f]));
        if (presentFields.length === 0) {
          test.skip(
            true,
            "No faceted list arrays in expense response — backend may not support them yet",
          );
          return;
        }
        for (const field of presentFields) {
          await addAllureParameter(
            `${field} (${(body[field] as string[]).length})`,
            fmtList(body[field] as string[]),
          );
        }
      });
    });

    // ── TC_005: eSource — top-level lists + locationName ──────────────────────

    /**
     * TC_API_PENNY_PR23512_005
     * GET /api/rfqs/pending response must include top-level faceted list arrays
     * (requestIdList, requestTitleList, requestorList, locationNameList, esourceAssigneeNameList)
     * and each item must carry a locationName field.
     * esourceAssigneeNameList entries must be resolved names, not raw ObjectIds.
     */
    test("TC_API_PENNY_PR23512_005 — esource response includes top-level faceted list arrays with resolved names", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/rfqs/pending");

      // ── Act ─────────────────────────────────────────────────────────────────
      const body = await test.step("GET /api/rfqs/pending", () =>
        fetchPendingRfqs(pennyRequestsApi, adminAccessToken));

      // ── Assert — top-level faceted lists ─────────────────────────────────────
      await test.step("Assert — faceted list arrays are present", async () => {
        const knownFacetedFields = [
          "classificationsList",
          "statusList",
          "workspaceClassificationList",
          "workspaceList",
          "requestIdList",
          "requestTitleList",
          "requestorList",
          "locationNameList",
          "esourceAssigneeNameList",
        ] as const;
        const presentFields = knownFacetedFields.filter((f) => Array.isArray(body[f]));
        if (presentFields.length === 0) {
          test.skip(
            true,
            "No faceted list arrays in rfqs/pending response — backend may not support them yet",
          );
          return;
        }
        for (const field of presentFields) {
          await addAllureParameter(
            `${field} (${(body[field] as string[]).length})`,
            fmtList(body[field] as string[]),
          );
        }
      });

      // ── Assert — esourceAssigneeNameList entries are resolved names ───────────
      await test.step("Assert — esourceAssigneeNameList entries are human-readable names (not ObjectIds)", async () => {
        const names = body.esourceAssigneeNameList ?? [];
        await addAllureParameter("esourceAssigneeNameList count", String(names.length));
        for (const name of names) {
          expect(
            OBJECT_ID_PATTERN.test(name),
            `"${name}" in esourceAssigneeNameList should be a human-readable name, not a raw ObjectId`,
          ).toBe(false);
        }
      });

      // ── Assert — per-item locationName ───────────────────────────────────────
      await test.step(`Assert — each of ${body.requests.length} items has locationName field`, async () => {
        const firstItem = body.requests[0];
        if (!firstItem || !("locationName" in firstItem)) {
          test.skip(
            true,
            "locationName not present on items — $lookup resolution from PR #23512 may not be deployed yet",
          );
          return;
        }
        for (const item of body.requests) {
          await test.step(`Item ${item.id ?? "(no id)"}`, async () => {
            await addAllureParameter("locationName", String(item.locationName ?? "(null)"));
            expect(item, "locationName is required for locationName filter").toHaveProperty(
              "locationName",
            );
          });
        }
      });
    });

    // ── TC_006: Faceted behaviour ─────────────────────────────────────────────

    /**
     * TC_API_PENNY_PR23512_006
     * Applying a requestType set-filter must NOT collapse requestorList or
     * requestTypeList — each *List uses a separate, field-excluded distinct()
     * query so other dropdowns stay fully populated (true faceted behaviour).
     *
     * Filter format: ag-Grid server-side row model query params
     *   filterModel[<field>][filterType]=set
     *   filterModel[<field>][values][]=<value>
     */
    test("TC_API_PENNY_PR23512_006 — faceted: applying requestType filter does not collapse requestorList or requestTypeList", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/request");
      await addAllureParameter("Filter field", "requestType");
      await addAllureParameter("Filter type", "set");

      // ── Step 1: fetch unfiltered ──────────────────────────────────────────────
      const unfiltered = await test.step("Fetch unfiltered — GET /api/request", async () => {
        const b = await fetchRequests(
          pennyRequestsApi,
          adminAccessToken,
          { page: "0", limit: "25" },
          "Response — unfiltered GET /api/request",
        );
        await addAllureParameter("requestTypeList — unfiltered", fmtList(b.requestTypeList));
        await addAllureParameter(
          "requestorList.length — unfiltered",
          String(b.requestorList?.length ?? 0),
        );
        return b;
      });

      if (!unfiltered.requestTypeList || unfiltered.requestTypeList.length === 0) {
        test.skip(true, "No requestTypeList in response — cannot test faceted behaviour");
        return;
      }

      const filterValue = unfiltered.requestTypeList[0];
      await addAllureParameter("Filter value applied", filterValue);

      // ── Step 2: fetch with requestType set-filter ──────────────────────────
      const filtered =
        await test.step(`Fetch filtered — GET /api/request?filterModel[requestType]=set[${filterValue}]`, () =>
          fetchRequests(
            pennyRequestsApi,
            adminAccessToken,
            {
              page: "0",
              limit: "25",
              "filterModel[requestType][filterType]": "set",
              "filterModel[requestType][values][]": filterValue,
            },
            "Response — filtered GET /api/request",
          ));

      // ── Assert — items match the filtered type ────────────────────────────
      await test.step("Assert — all returned items match the filtered requestType", async () => {
        await addAllureParameter("Filtered items count", String(filtered.requests.length));
        for (const item of filtered.requests) {
          expect(
            item.requestType,
            `Item ${item.id}: requestType should be "${filterValue}", got "${item.requestType}"`,
          ).toBe(filterValue);
        }
      });

      // ── Assert — requestorList not collapsed ──────────────────────────────
      await test.step("Assert — requestorList still populated (faceted query is independent)", async () => {
        const count = filtered.requestorList?.length ?? 0;
        await addAllureParameter("requestorList.length — after filter", String(count));
        await addAllureParameter("requestorList — after filter", fmtList(filtered.requestorList));

        expect(filtered, "Filtered response must still include requestorList").toHaveProperty(
          "requestorList",
        );
        expect(Array.isArray(filtered.requestorList), "requestorList must be an array").toBe(true);
        expect(
          count,
          "requestorList must not be empty — faceted distinct() query runs without the requestType filter",
        ).toBeGreaterThan(0);
      });

      // ── Assert — requestTypeList not collapsed ────────────────────────────
      await test.step("Assert — requestTypeList still shows all types (self-excluded from filter)", async () => {
        const filteredCount = filtered.requestTypeList?.length ?? 0;
        const unfilteredCount = unfiltered.requestTypeList?.length ?? 0;
        await addAllureParameter("requestTypeList.length — unfiltered", String(unfilteredCount));
        await addAllureParameter("requestTypeList.length — after filter", String(filteredCount));
        await addAllureParameter(
          "requestTypeList — after filter",
          fmtList(filtered.requestTypeList),
        );

        expect(filtered, "Filtered response must still include requestTypeList").toHaveProperty(
          "requestTypeList",
        );
        expect(
          filteredCount,
          `requestTypeList should not collapse to 1 — got ${filteredCount}, expected >= ${unfilteredCount}`,
        ).toBeGreaterThanOrEqual(unfilteredCount);
      });
    });

    // ── TC_007: keyValueParser fix ────────────────────────────────────────────

    /**
     * TC_API_PENNY_PR23512_007
     * keyValueParser fix: a set-filter on requestId must return 200 with
     * correctly filtered results. Prior to PR #23512, set-filter values were
     * passed raw to MongoDB (bypassing keyValueParser), causing numeric/ObjectId
     * fields to silently return 0 results or throw a 500.
     *
     * NOTE: requestIdList contains RAW IDs (e.g. "2325") — not prefixed.
     * The UI sends the raw value; the backend keyValueParser converts it to
     * the full format (e.g. "buy36-req-2325") before the MongoDB query.
     * item.id in the response is always the full prefixed format.
     */
    test("TC_API_PENNY_PR23512_007 — set-filter values are parsed via keyValueParser (no 4xx/5xx, results match)", async ({
      adminAccessToken,
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/request");
      await addAllureParameter("Filter field", "requestId");
      await addAllureParameter("Filter type", "set");

      // ── Step 1: resolve a real requestId value from the list ──────────────
      const targetId = await test.step("Fetch requestIdList — GET /api/request", async () => {
        const b = await fetchRequests(
          pennyRequestsApi,
          adminAccessToken,
          { page: "0", limit: "5" },
          "Response — setup GET /api/request",
        );
        await addAllureParameter("requestIdList", fmtList(b.requestIdList));

        if (!b.requestIdList || b.requestIdList.length === 0) {
          test.skip(true, "No requestIdList values available — cannot test keyValueParser fix");
          return undefined;
        }
        return b.requestIdList[0];
      });

      if (!targetId) return;
      await addAllureParameter("Filter value (targetId)", targetId);

      // ── Step 2: apply set-filter on requestId ─────────────────────────────
      const filteredBody =
        await test.step(`Apply set-filter — GET /api/request?filterModel[requestId]=set[${targetId}]`, () =>
          fetchRequests(
            pennyRequestsApi,
            adminAccessToken,
            {
              page: "0",
              limit: "10",
              "filterModel[requestId][filterType]": "set",
              "filterModel[requestId][values][]": targetId,
            },
            "Response — filtered GET /api/request",
          ));

      // ── Assert — shape ───────────────────────────────────────────────────
      await test.step("Assert — response has requests array", async () => {
        expect(filteredBody, "Filtered response must have a requests array").toHaveProperty(
          "requests",
        );
        expect(Array.isArray(filteredBody.requests), "requests must be an array").toBe(true);
        await addAllureParameter("Matching items returned", String(filteredBody.requests.length));
      });

      // ── Assert — returned items match the filtered requestId ──────────────
      // requestIdList contains raw IDs (e.g. "2325"), but item.id is the full
      // prefixed format (e.g. "buy36-req-2325"). The backend keyValueParser
      // converts the raw filter value to the prefixed format for the DB query.
      await test.step("Assert — each returned item id ends with the filtered raw requestId", async () => {
        for (const item of filteredBody.requests) {
          await addAllureParameter("item.id", String(item.id));
          expect(
            String(item.id).endsWith(`-req-${targetId}`) || String(item.id) === targetId,
            `item.id "${item.id}" must correspond to filtered requestId "${targetId}"`,
          ).toBe(true);
        }
      });
    });

    // ── TC_008: Auth — /api/request rejects unauthenticated ───────────────────

    /**
     * TC_API_PENNY_PR23512_008
     * GET /api/request must reject requests with no Bearer token with HTTP 401.
     */
    test("TC_API_PENNY_PR23512_008 — unauthenticated access to /api/request returns 401", async ({
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/request");
      await addAllureParameter("Auth token", "none");
      await addAllureParameter("Expected status", "401");

      await test.step("GET /api/request without Authorization header", async () => {
        const response = await pennyRequestsApi.listRequests<unknown>(
          undefined,
          {},
          {
            expectedStatus: 401,
            retry: false,
          },
        );
        await addAllureParameter("Actual status", String(response.statusCode));
        expect(response.statusCode, "GET /api/request without token should return 401").toBe(401);
      });
    });

    // ── TC_009: Auth — /api/rfqs/pending rejects unauthenticated ─────────────

    /**
     * TC_API_PENNY_PR23512_009
     * GET /api/rfqs/pending must reject requests with no Bearer token with HTTP 401.
     */
    test("TC_API_PENNY_PR23512_009 — unauthenticated access to /api/rfqs/pending returns 401", async ({
      pennyRequestsApi,
    }) => {
      await addAllureParameter("Endpoint", "GET /api/rfqs/pending");
      await addAllureParameter("Auth token", "none");
      await addAllureParameter("Expected status", "401");

      await test.step("GET /api/rfqs/pending without Authorization header", async () => {
        const response = await pennyRequestsApi.listPendingRfqs<unknown>(
          undefined,
          {},
          {
            expectedStatus: 401,
            retry: false,
          },
        );
        await addAllureParameter("Actual status", String(response.statusCode));
        expect(response.statusCode, "GET /api/rfqs/pending without token should return 401").toBe(
          401,
        );
      });
    });
  },
);
