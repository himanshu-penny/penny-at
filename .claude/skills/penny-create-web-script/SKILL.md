---
name: penny-create-web-script
description: Guided creator for Penny web Playwright test scripts in penny-at. Use when the user asks Claude to create, add, scaffold, or improve a web UI automation spec, page object, or workflow test for a Penny page — login, vendor registration, vendor review, invite panel, RFQ, purchase request, or any other UI flow.
---

# Penny Create Web Script

Create web-focused Playwright specs for `penny-at`. Always apply
`/penny-create-standard-code` for naming, folder placement, and TypeScript
conventions. Pull business vocabulary from `/penny-business`. Use
`/penny-test-data-setup` for setup/cleanup patterns.

## When To Use

- User asks for a new UI test, page object, or web workflow spec.
- User asks to convert a manual test case (Testmo, JIRA) into automation.
- User asks to extend an existing web spec with a new business step.

## Required Inputs

Ask in a single message if any are missing:

- **Business scenario** — user journey in one sentence.
- **User role / persona** — buyer, admin, supplier, unauthenticated, etc.
- **Client + env** — `ewcf`, `rcmc`, `enterprise`, `sabil` × `dev`, `fb`, `staging`.
- **Preconditions** — data that must exist before the test runs.
- **Expected business outcome** — what the user sees / can do after the flow.
- **Whether the flow should be API-set-up + UI-asserted** — usually yes.

Do not proceed if the user role or expected outcome are unclear.

## Repository Review Before Action

Before writing a spec, inspect the current pattern:

- `src/pages/web/base.page.ts` — the class every page object extends.
- `src/pages/web/<domain>/` — the domain page objects that already exist
  (e.g. `vendors/`).
- `src/tests/{client}/web/<domain>/*.spec.ts` — sample existing specs.
- `src/fixtures/web.fixture.ts` — available web fixtures (`pennyLoginPage`, etc.).
- `src/config/auth.setup.web.ts` — how storage state is generated.
- `src/core/constants/routes.ts` — `PENNY_ROUTES` + `PENNY_ROUTE_PATTERNS`.
- `src/factories/vendor.factory.ts` and `src/factories/test-data.factory.ts`.

If a page object already covers the interaction, reuse it. Only create a new
page object when a genuinely new page or panel needs coverage.

## Step-By-Step Workflow

1. **Understand the journey** — write the acceptance criteria in one sentence
   using domain language from `/penny-business`.
2. **Coverage check** — grep existing specs. If covered, stop and report.
3. **Fixture choice** — use `pennyLoginPage`, storage state, or `loginAs` from
   the API side to set the session. Never inline a login flow in the spec if a
   fixture exists.
4. **Page object choice** —
   - Reuse existing page objects when possible.
   - Add new methods to an existing page object when the interaction belongs to it.
   - Create a new page object only for a genuinely new page / panel.
5. **Locators** — top-level `const` object per file, priority
   `data-test-id > getByRole > getByLabel > CSS > XPath`. Never inline
   selectors in methods or specs.
6. **API-set / UI-assert** — use API clients to seed prerequisite data when a
   client exists (see `/penny-test-data-setup`). Only drive the UI through the
   business steps that matter.
7. **Assertions** — use Playwright web-first assertions
   (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`). Assert
   business outcomes: record created, status changed, table row appeared, etc.
8. **Cleanup** — clean via API where possible in `afterEach` / `afterAll`.
9. **Validate** — `npm run validate` and, when credentials are available,
   `npx playwright test <spec> --project=smoke --list` then the targeted run.

## Framework Standards

### Folder & File

```text
src/tests/{client}/web/<domain>/<feature>.spec.ts
src/pages/web/<domain>/<feature>.page.ts
```

`{client}` ∈ `ewcf`, `rcmc`, `enterprise`, `sabil`. Cross-client → `shared/web/`.

### Page Object Shape

Every page object extends `BasePage`. Use `this.action.*` and `this.wait.*` —
never `this.page.click` directly.

```typescript
import { Locator, Page } from "@playwright/test";
import { Step } from "@utils/decorators/step.decorator";
import { BasePage } from "@pages/web/base.page";

const VENDOR_INVITE_LOCATORS = {
  INVITE_BUTTON: 'button[data-test-id="invite-vendor"]',
  EMAIL_INPUT: 'input[data-test-id="invite-vendor-email"]',
  SUBMIT_BUTTON: 'button[data-test-id="invite-vendor-submit"]',
  SUCCESS_TOAST: '[data-test-id="toast-success"]',
} as const;

export class InviteVendorPanel extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  @Step("Open the invite vendor panel")
  async open(): Promise<void> {
    await this.action.click(VENDOR_INVITE_LOCATORS.INVITE_BUTTON);
    await this.wait.forVisible(VENDOR_INVITE_LOCATORS.EMAIL_INPUT);
  }

  @Step("Invite a vendor by email")
  async inviteVendorByEmail(email: string): Promise<void> {
    await this.action.type(VENDOR_INVITE_LOCATORS.EMAIL_INPUT, email);
    await this.action.click(VENDOR_INVITE_LOCATORS.SUBMIT_BUTTON);
  }

  successToast(): Locator {
    return this.page.locator(VENDOR_INVITE_LOCATORS.SUCCESS_TOAST);
  }
}
```

### Spec Shape

```typescript
import { test, expect } from "@fixtures";
import { InviteVendorPanel } from "@pages/web/vendors/invite-vendor-panel.page";
import { TestDataFactory } from "@factories";

test.describe("TC_WEB_VENDOR — Invite Vendors", { tag: ["@smoke", "@ui"] }, () => {
  test("TC_WEB_VENDOR_009 — a buyer can invite a new vendor by email", async ({
    page,
    pennyLoginPage,
    testData,
  }) => {
    await pennyLoginPage.loginAsBuyer();

    const panel = new InviteVendorPanel(page);
    await panel.open();
    await panel.inviteVendorByEmail(testData.uniqueEmail("qa-vendor"));

    await expect(panel.successToast(), "the buyer should see a success message").toBeVisible();
  });
});
```

### Test Titles & Comments

Business-language, not code-language. Titles look like the acceptance criterion
in plain English. `/penny-business` has the vocabulary.

## Output Format

Always deliver:

1. **Understanding** — one-line business scenario summary.
2. **Files reviewed** — page objects, fixtures, factories touched during planning.
3. **Framework pattern found** — which locator style, which fixture, which
   existing page object was reused.
4. **Proposed approach** — plan (spec path, tags, fixtures, page objects,
   assertions).
5. **Files to create or update** — full list.
6. **Generated code** — the spec + any new/updated page object.
7. **Test data setup** — factories used, unique-ID strategy, API seeding.
8. **Cleanup strategy** — API teardown, `afterEach`, or "not needed" with reason.
9. **Commands to run** — `--list` first, then a targeted run.
10. **Self-review checklist** — see below.
11. **Risks / assumptions** — anything unverified.
12. **Framework feedback** — missing fixture, missing locator, missing helper.

## Quality Checklist

- Spec starts with `import { test, expect } from "@fixtures";`.
- Page object extends `BasePage` and uses `action` / `wait`.
- Locators live in a `const` object at the top of the page object file.
- No `waitForTimeout`, no `page.waitFor(1000)` — use web-first assertions.
- No brittle XPath — role/label/data-test-id first.
- Tags include tier (`@smoke` / `@regression`) and layer (`@ui`).
- Title reads as an acceptance criterion.
- Test isolates: no cross-test data dependencies.
- Cleanup runs even if the test fails.
- No secrets, tokens, or raw credentials in spec files.

## Do Not Do

- Do not create a `describe` without tags.
- Do not inline locators inside methods or tests.
- Do not create a page object with only getter methods and no business actions.
- Do not use UI to seed data that an API client can seed faster.
- Do not tag a web test with `@api` or `@mobile`.
- Do not log or attach cookies, tokens, or `.env` values.
- Do not add `@Step` to trivial getters.
