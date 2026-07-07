# Onboarding — Penny AT

Welcome. This doc gets a new QA engineer from cloning the repo to shipping their
first real test in about a week. If you get lost at any point, invoke
`/penny-starthere` in Claude Code and it will route you back here.

For a dense reference of what the framework provides, read `README.md`. This
file is the _path_, not the reference.

---

## Day 1 — Get the framework running

**Goal:** `npm run validate` passes on your machine and you can list one test
against a real environment.

1. **Prereqs.** Node 20+, npm 10+, git. macOS or Linux is best supported.
2. **Install.**
   ```bash
   npm install
   npm run install:browsers        # Playwright browsers with system deps
   npm run setup                   # scripts/setup.sh
   ```
3. **Pick a client + env.** Ask your team lead. Default for API work: `sabil`
   or `ewcf` × `fb`.
4. **Copy the env template.** Never commit the real file.
   ```bash
   cp src/config/clients/<client>/<env>.env.example \
      src/config/clients/<client>/<env>.env
   ```
   Ask your lead for the credentials that go inside — they live in a password
   manager, not in chat.
5. **Sanity check.**
   ```bash
   npm run validate                                            # typecheck + lint + discovery
   CLIENT=<client> TEST_ENV=<env> npm run test:api:list        # confirm ~45 tests discovered
   ```
6. **Bookmark `/playwright-cli`.** You'll use it every day for "how do I run
   just this one test".

**Done when:** `npm run validate` is green and the `--list` output shows tests.

**Stuck?** Invoke `/penny-setup` — it walks through everything above and knows
this repo's exact scripts.

---

## Day 2–3 — Understand what Penny actually is

**Goal:** you can explain the procure-to-pay flow to a colleague and know what
"RFP", "GRN", "sealed bid", and "MFA contract" mean.

1. Open `.claude/skills/penny-business/knowledge/README.md` — navigation guide.
2. Read `.claude/skills/penny-business/knowledge/glossary.md` cover to cover.
3. Pick the module you'll be testing first and read its file:
   `.claude/skills/penny-business/knowledge/modules/<module>.md`.
4. Read the variant doc for your target client:
   `.claude/skills/penny-business/knowledge/variants/<client>.md`.
5. Skim `.claude/skills/penny-business/knowledge/personas/buyer-roles.md`.

Every knowledge entry carries a provenance label (`**Verified:**`,
`**Verified by user:**`, `**Imported evidence:**`, `**Source:**`, or
`**Status: unverified**`) — trust local `Verified` entries first; treat imported
or unverified ones as "ask your lead".

**Done when:** you can pick a test from `src/tests/**` and describe what
business outcome it verifies without reading the code.

**Stuck?** Invoke `/penny-business` — it can answer specific questions and
point at the exact knowledge file.

---

## Day 4–5 — Read three existing tests, then write one

**Goal:** your first PR is a small, focused API or web test.

1. **Read three specs of the layer you'll write.**
   - API: `src/tests/shared/api/requests/pr23512-filter-fields.spec.ts`,
     `src/tests/sabil/api/integrations/full-cycle.spec.ts`,
     `src/tests/sabil/api/integrations/negative.spec.ts`.
   - Web: `src/tests/ewcf/web/vendors/registration.spec.ts`,
     `src/tests/sabil/web/vendors/registration.spec.ts`.
2. **Open the coding standard.** `/penny-create-standard-code` — keep the tab open.
3. **Pick a small scenario.** Something like "an authenticated admin can list
   purchase requests" — one happy path, one negative. Confirm the business
   rule against `knowledge/modules/<module>.md`.
4. **Write it.**
   - API: `/penny-create-api-script`
   - Web: `/penny-create-web-script`
5. **Handle test data.** `/penny-test-data-setup` — factories, unique IDs,
   cleanup patterns.
6. **Self-review.**
   - API: `/penny-review-api-script`
   - Web: `/penny-review-web-script`
7. **Validate before pushing.**
   ```bash
   npm run validate
   CLIENT=<client> TEST_ENV=<env> npx playwright test <your-spec> --project=<p> --list
   CLIENT=<client> TEST_ENV=<env> npx playwright test <your-spec> --project=<p>
   ```

**Done when:** your test is green locally, self-reviewed, and open as a PR.

**Stuck?** If the test fails, use `/penny-debug-triage`. If a review comment is
about framework code you touched, hand it to your reviewer with
`/penny-review-framework-change`.

---

## Skill map (pick the right one, fast)

| I want to…                                   | Skill                            |
| -------------------------------------------- | -------------------------------- |
| Set up the repo, run tests, open reports     | `/penny-setup`                   |
| CLI recipes — grep, headed, debug, ports     | `/playwright-cli`                |
| Know what a Penny term means / business flow | `/penny-business`                |
| Understand the coding standard               | `/penny-create-standard-code`    |
| Write an API test                            | `/penny-create-api-script`       |
| Write a web test                             | `/penny-create-web-script`       |
| Review an API test                           | `/penny-review-api-script`       |
| Review a web test                            | `/penny-review-web-script`       |
| Design test data setup / cleanup             | `/penny-test-data-setup`         |
| Debug a red test / interpret a trace         | `/penny-debug-triage`            |
| Write a Node / shell utility                 | `/penny-create-utility-script`   |
| Add a new BaseApiClient subclass             | `/penny-create-api-client`       |
| Add / update a JSON schema                   | `/penny-schema`                  |
| Onboard a new client (tenant)                | `/penny-add-client`              |
| Configure CI                                 | `/penny-ci`                      |
| Review a framework-core change               | `/penny-review-framework-change` |
| Audit the framework as a whole               | `/penny-framework-health-check`  |
| Audit business knowledge for drift           | `/penny-knowledge-audit`         |
| Deep API framework reference                 | `/penny-api-sdet`                |
| Lost — where do I start?                     | `/penny-starthere`               |

---

## Common pitfalls

- **Real `.env` files are gitignored.** Never commit `src/config/clients/**/*.env`.
  Only `*.env.example` files are shareable.
- **`srmg`, `voltalia`, `tahakom`, `modern_mills`, `nhc` are NOT top-level
  clients.** They're enterprise sub-clients or knowledge variants. Valid
  standalone `CLIENT` values: `ewcf`, `rcmc`, `enterprise`, `sabil`.
- **`@types/*` tsconfig alias is broken.** It collides with TypeScript's
  `.d.ts` scope. Import `EnvironmentConfig` and friends via the concrete path:
  `../../../../types/interfaces/config.interface`. Documented in
  `/penny-create-standard-code`.
- **No `waitForTimeout`, no arbitrary sleeps.** Use Playwright web-first
  assertions and locator auto-wait. If a UI test needs a sleep, the underlying
  UI needs an explicit "loaded" marker instead.
- **Do not retry to hide flake.** Setting `--retries=5` locally to make CI
  green hides real bugs. Bring the failure to `/penny-debug-triage`.
- **Never log or attach `.env`, `.auth/*.json`, tokens, cookies, or raw auth
  responses.** Allure is redacted; console isn't.
- **Sabil outbound tests skip when `SABIL_BASE_URL` isn't set** — this is
  intentional. If a readiness run requires them to run, set
  `SABIL_REQUIRE_OUTBOUND=true` so missing config fails instead of skips.

---

## Getting help

- **Domain question** ("what does gating committee do?") → `/penny-business`.
- **Code / framework question** → `/penny-api-sdet` for API, code around
  `src/pages/web/base.page.ts` for web.
- **Test broke and I don't know why** → `/penny-debug-triage`.
- **Human help** — ask your team lead. Every skill can point you at the right
  file, but only a human can tell you which business scenario to test next.

---

## After your first PR

Not everything applies on day one. Pick these up when you meet them:

- `/penny-create-api-client` — when you find yourself writing the same
  `requestHandler` chain in three specs.
- `/penny-schema` — when your test asserts a response contract that should
  be enforced framework-wide.
- `/penny-add-client` — if your team spins up a new client tenant.
- `/penny-ci` — if you own or touch the CI pipeline.
- `/penny-review-framework-change` — when your PR touches
  `src/api/**`, `src/fixtures/**`, `src/middleware/**`, or `src/core/**`.
- `/penny-knowledge-audit` — quarterly, in coordination with a senior QA.
- `/penny-framework-health-check` — quarterly or after big refactors.
