---
name: penny-setup
description: Onboarding entry point for penny-at automation. Use when a QA engineer needs to install dependencies, configure environment variables, understand the folder layout, run API or web tests locally, debug, generate reports, or find out which other skill to use next.
---

# Penny Setup

Start here when you are new to the `penny-at` framework or when you need a
refresher on install, environment, run, or reporting commands. This skill only
tells you _how the framework works and how to run it_ — for anything that
creates or reviews code, jump to the specialized skill from the map below.

## When To Use

- First-time setup on a new machine.
- Installing dependencies after a fresh clone.
- Setting up client / environment / auth for the first run.
- Running API or web tests locally in headed, debug, UI, or CI mode.
- Opening HTML or Allure reports.
- Figuring out which skill covers a task.

## Required Inputs

Ask only if the answer is not already obvious from the request:

- Target client — `ewcf`, `rcmc`, `enterprise`, or `sabil`. (`srmg`, `voltalia`
  are enterprise subfolders, not standalone clients.)
- Target environment — the value that maps to `src/config/clients/{client}/{env}.env`.
- Layer — API, web, or both.
- Whether live credentials / URLs are available or the run is discovery-only.

If the user hasn't picked a client, assume `sabil` (largest active suite) for API,
`ewcf` for web, and mark the choice as an assumption.

## Repository Review Before Action

Before recommending any command, confirm what the repo currently ships:

- `package.json` — the `scripts` block is the source of truth for npm scripts.
- `playwright.config.ts` — projects (`api-testing`, `smoke`, `auth-setup-*`).
- `src/config/environments.ts` and `src/config/client-config.ts` — client / env
  resolution.
- `src/config/clients/{client}/*.env.example` — required env variables per client.
- `.claude/skills/playwright-cli/SKILL.md` — day-to-day CLI commands.

Never invent an npm script that isn't in `package.json`.

## Install & Baseline

```bash
npm install
npm run install:browsers   # Playwright browsers with system deps
npm run setup              # scripts/setup.sh — one-time bootstrap
```

Copy the env template for the client/env you plan to run:

```bash
cp src/config/clients/<client>/<env>.env.example src/config/clients/<client>/<env>.env
```

`.env` files under `src/config/clients/**` are gitignored — treat them as
local-only secrets. Only `*.env.example` files are shareable.

## Run Commands

Everything hangs off `CLIENT` and `TEST_ENV`:

```bash
CLIENT=<client> TEST_ENV=<env> npm run test:api      # api-testing project
CLIENT=<client> TEST_ENV=<env> npm run test:web      # smoke project (web)
CLIENT=<client> TEST_ENV=<env> npm run test:smoke    # @smoke-tagged tests
CLIENT=<client> TEST_ENV=<env> npm run test:regression
```

Targeted runs:

```bash
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec-file> --project=api-testing
CLIENT=<client> TEST_ENV=<env> npx playwright test <spec-file> --project=smoke
CLIENT=<client> TEST_ENV=<env> npx playwright test --grep "@smoke.*@api"
CLIENT=<client> TEST_ENV=<env> npm run test:api:list       # discovery only
```

Debug flavors:

```bash
CLIENT=<client> TEST_ENV=<env> npm run test:headed
CLIENT=<client> TEST_ENV=<env> npm run test:debug
CLIENT=<client> TEST_ENV=<env> npm run test:ui
```

For richer per-run detail on individual commands (headed, project, grep, tag,
report ports) use `/playwright-cli`.

## Sabil Readiness

```bash
CLIENT=sabil TEST_ENV=fb \
SABIL_ORG_CODE=<enabled-org-code> \
SABIL_PENNY_BASE_URL=https://api-sabil.tst.penny.co/api \
npx playwright test src/tests/sabil/api --project=api-testing
```

Add `SABIL_BASE_URL=<outbound-url>` to unlock outbound tests. Set
`SABIL_REQUIRE_OUTBOUND=true` when missing outbound config should _fail_ the run
instead of skipping outbound-only tests.

## Reports

```bash
npm run report                 # HTML report at artifacts/reports/html
npm run report:allure          # Allure server
```

If port `9323` is busy: `npx playwright show-report artifacts/reports/html --port 9324`.

## Quality Gates

```bash
npm run validate               # typecheck + lint + API discovery in one shot
npm run typecheck
npm run lint
npm run format:check
```

Run `npm run validate` before finishing any change, even a small one.

## Folder Tour

```text
src/
  api/           API clients + support/ (RequestHandler, api-transport, ApiError)
  config/        Environments, client-config, auth setup for web/api
  core/          Constants (urls, routes), logger, redaction, custom assertions
  factories/     Faker-based data factories (TestDataFactory, vendor.factory)
  fixtures/      Base + api + web fixtures merged via mergeTests()
  middleware/    Retry middleware
  pages/web/     BasePage + domain/feature page objects
  tests/
    {client}/api|web/     Client-owned specs (ewcf, rcmc, enterprise, sabil)
    shared/api|web/       Cross-client specs
    _support/             Spec-local helpers (nearest folder)
  types/         Interfaces, DTOs, config types
  utils/         helpers/, data-readers/, middleware pieces
test-data/       response-schemas/, static test data
```

## Skill Map

Use these to keep responsibility clear:

| Task                                | Skill                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Install / run / debug / report      | `penny-setup` (this) + `/playwright-cli`                                                              |
| CLI commands, ports, tags, grep     | `/playwright-cli`                                                                                     |
| Coding standard for any file        | `/penny-create-standard-code`                                                                         |
| Generate an API test                | `/penny-create-api-script`                                                                            |
| Generate a web test                 | `/penny-create-web-script`                                                                            |
| Review an API test                  | `/penny-review-api-script`                                                                            |
| Review a web test                   | `/penny-review-web-script`                                                                            |
| Reusable helper / node script       | `/penny-create-utility-script`                                                                        |
| Test data setup / cleanup / factory | `/penny-test-data-setup`                                                                              |
| Business vocabulary / traceability  | `/penny-business` (SoT lives under `.claude/skills/penny-business/knowledge/` — start at `README.md`) |
| Framework-wide audit                | `/penny-framework-health-check`                                                                       |
| API architecture reference          | `/penny-api-sdet`                                                                                     |

## Output Format

When invoked, respond with:

1. **Understanding** — one line describing what the user is trying to set up or run.
2. **Files reviewed** — `package.json`, `playwright.config.ts`, relevant `.env.example`.
3. **Framework pattern found** — which npm scripts / projects apply.
4. **Proposed commands** — the smallest command that answers the question.
5. **Env / secrets checklist** — what the user must set before the command works.
6. **Cleanup strategy** — usually N/A for setup; call out artifacts to gitignore.
7. **Self-review checklist** — see below.
8. **Risks / assumptions** — client/env picked without confirmation, live-run gates, etc.
9. **Framework feedback** — flag missing env examples, broken scripts, or unclear docs.

## Quality Checklist

- All commands come from `package.json` or from documented Playwright CLI flags.
- `CLIENT` and `TEST_ENV` are set explicitly on every run command.
- Never suggest destructive commands (`git clean`, `rm -rf`, `db drop`) without an
  explicit user request.
- Never print, echo, cat, or attach `.env`, `.auth`, tokens, cookies, or passwords.
- Point the user to `/playwright-cli` when they need more advanced CLI flags.
- Confirm live-credential prerequisites (org codes, URLs) before recommending live runs.

## Do Not Do

- Do not invent npm scripts that aren't in `package.json`.
- Do not tell users to set `CLIENT=srmg` or `CLIENT=voltalia` — these are enterprise
  subfolders, not standalone clients.
- Do not overwrite an existing `src/config/clients/**/*.env` file.
- Do not run scripts that mutate remote Penny data as part of "setup".
