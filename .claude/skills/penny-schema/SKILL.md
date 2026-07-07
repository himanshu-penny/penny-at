---
name: penny-schema
description: Add or update AJV response schemas in penny-at. Use when the user asks to validate an API response contract, generate a schema from a live response, decide whether a field should be required vs optional, or refactor an existing schema that's overfitting to volatile data.
---

# Penny Schema

Define and maintain JSON Schemas under `test-data/response-schemas/`. Schemas
enforce API contracts without freezing volatile fields. Pair with
`/penny-create-api-script` when writing new specs and with
`/penny-review-api-script` when reviewing schema drift.

## When To Use

- A new API endpoint gains a spec and the response shape is stable.
- An existing spec relies on shallow `Array.isArray(...)` checks that a schema
  would replace with a real contract.
- A production contract change was noticed (new field, renamed field, removed
  field) and the schema needs updating.
- A schema is over-strict and failing on legitimate response variance.

## Do Not Use For

- Volatile data (timestamps, generated IDs, counts, sort orders) — do not add
  `required` for those.
- Endpoints without a stable contract (early prototypes, feature flags in flight).
- Business rule validation — that's what assertions in the spec are for.

## Required Inputs

- **Endpoint** — path + verb.
- **Consumer** — which spec(s) will call `validateSchema`.
- **Sample response** — a real captured payload (from Postman, Allure attachment,
  or a manual curl).
- **Fields that are truly required** — the caller code MUST have them, versus
  fields that are nice-to-have.

## Repository Review Before Action

Read every one of these:

- `src/api/schema-validator.ts` — the AJV wrapper (`validateSchema`,
  `validateApiResponseSchema`).
- `test-data/response-schemas/` — layout, naming, existing schemas.
- `scripts/generate-schema.js` — the schema generator entry point.
- One existing spec that calls `validateSchema` (grep `validateSchema\|validateApiResponseSchema`).
- The Postman collection or Penny KB entry for the endpoint (business truth).

## Step-By-Step Workflow

1. **Capture a real response.** Run the existing spec with logging on or copy
   a Postman example. Do not invent shape — capture it.
2. **Generate a draft.** `npm run generate:schema` on the captured payload,
   or hand-write for a small response.
3. **Strip volatile fields.** Remove `required` for timestamps, generated IDs,
   pagination counts, sort keys, feature-flag-gated fields.
4. **Confirm truly-required fields** against the consumer's need. A field is
   `required` only if the spec would fail meaningfully without it.
5. **Save under `test-data/response-schemas/<domain>/<endpoint>.schema.json`.**
6. **Wire the spec.**

   ```typescript
   import requestsListSchema from "@test-data/response-schemas/requests/list.schema.json";
   import { validateApiResponseSchema } from "@api/schema-validator";

   const response = await pennyRequestsApi.listRequests<...>(adminAccessToken);
   validateApiResponseSchema(response, requestsListSchema, "GET /api/request");
   ```

7. **Validate.**
   ```bash
   npm run validate
   ```

## Framework Standards

### File Placement

```text
test-data/response-schemas/
  <domain>/
    <endpoint-or-flow>.schema.json
```

- Domain matches Penny business vocabulary (`requests`, `vendors`, `orders`,
  `bills`, `sabil`).
- Filenames use verb-object form when useful: `list.schema.json`,
  `create-response.schema.json`, `payment-confirmation.schema.json`.

### Schema Content Rules

- Use JSON Schema draft-07 (matches AJV default).
- `additionalProperties: false` on nested objects that are _strictly_ contract;
  leave `true` (or omit) on payloads where the backend legitimately adds fields.
- Prefer `type` unions (`["string", "null"]`) over `type: "any"`.
- Use `enum` for stable status values from `knowledge/cross-cutting/state-transitions.md`.
- Do NOT put example values in `default` unless the endpoint truly returns them
  as a fallback.

### Assertion Style

```typescript
// For BaseApiClient responses (ApiResponse<T>):
validateApiResponseSchema(response, schema, "GET /api/vendors");

// For requestHandler results (raw body):
validateSchema(body, schema, "GET /api/vendors");
```

Always pass a context string — schema failures surface it in the error message.

### Generation

```bash
npm run generate:schema
```

Then hand-edit the output. Do not commit auto-generated schemas without a
`required` pass — generators over-require by default.

## Output Format

1. **Understanding** — endpoint + consumer + why a schema.
2. **Files reviewed** — schema-validator + one reference schema.
3. **Framework pattern found** — the domain folder to use, the naming style.
4. **Proposed schema** — inline JSON preview, `required` list, decisions made.
5. **Files to create or update** — schema + spec wiring.
6. **Generated code** — schema JSON + spec import + `validateSchema` call.
7. **Test data setup** — N/A (schemas validate, not seed).
8. **Cleanup strategy** — N/A.
9. **Commands to run** — `npm run validate` + targeted `--list`.
10. **Self-review checklist** — below.
11. **Risks / assumptions** — which fields might drift, whether backend team
    should own the schema too.
12. **Framework feedback** — flag if the domain folder is missing or if the
    endpoint really needs the constant in `API_PATHS` first.

## Quality Checklist

- Schema is grounded in a real captured response, not invented.
- Only truly-required fields are in `required`.
- No volatile fields (`createdAt`, `updatedAt`, generated IDs) are required.
- `enum` values match `knowledge/cross-cutting/state-transitions.md`.
- Schema file lives under the correct domain folder.
- Schema is imported with `@test-data/response-schemas/...` alias, not relative.
- Consumer spec calls `validateSchema` / `validateApiResponseSchema` with a
  meaningful context string.
- `npm run validate` passes.

## Do Not Do

- Do not require every field the backend happens to return today.
- Do not include timestamps, cursor tokens, or feature-flag-gated fields in
  `required`.
- Do not use `additionalProperties: false` at the top level unless the contract
  is genuinely closed.
- Do not create a schema per test — one schema per endpoint contract.
- Do not commit auto-generated schemas without a review pass.
- Do not use schema validation as a substitute for business-rule assertions.

## Related Skills

- `/penny-api-sdet` — where schema validation fits in the transport pattern.
- `/penny-create-api-script` — first consumer of a new schema.
- `/penny-review-api-script` — flags overfitting / underfitting.
- `/penny-business` — for `enum` values grounded in state-transition rules.
- `/penny-review-framework-change` — when a schema-validator change lands.
