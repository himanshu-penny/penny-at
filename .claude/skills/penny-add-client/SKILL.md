---
name: penny-add-client
description: Onboard a new standalone client to the penny-at framework. Use when a user asks to add a new client tenant (e.g. newco) as a first-class CLIENT value, wire up its env configs, test folder layout, business knowledge variant file, and update the framework guardrails that enumerate valid clients. Do NOT use this to promote existing sub-clients like tahakom, voltalia, modern_mills, srmg, or nhc without explicit confirmation — those are documented as enterprise sub-clients or knowledge variants.
---

# Penny Add Client

Add a new standalone client to `penny-at` without missing any of the six wiring
points. This is a scaffold-only skill — the tests that consume the new client go
through `/penny-create-api-script` and `/penny-create-web-script` afterward.

## When To Use

- The team is onboarding a new tenant that needs its own auth, URLs, and test
  folders (e.g., promoting `voltalia` from an enterprise subfolder to a
  standalone client, or adding a brand-new client like `newco`).
- A client currently under `enterprise/*` needs to become top-level.
- Existing docs list a client that isn't wired end-to-end.

## Do Not Use For

- Adding a _variant_ under an existing client (e.g., a new environment for
  `ewcf`) — that's a `.env.example` copy, no scaffold needed.
- Renaming `srmg` / `voltalia` / `modern_mills` / `tahakom` / `nhc` to
  top-level without confirming with the team; some of those are deliberately
  enterprise sub-clients per `knowledge/variants/*.md`.

## Required Inputs

- **Client short name** — snake-case, matches folder + env prefix (e.g., `newco`).
- **Which envs are needed** — usually `dev`, `fb`, and one of
  `test`/`demo`/`prod`.
- **Web URL + API URL per env**.
- **Layers to seed** — API only, web only, or both.
- **Business context source** — where the domain rules for this client live
  (usually a KB doc or Slack thread; captured into `knowledge/variants/<client>.md`).

## Repository Review Before Action

Read before making a single edit:

- `src/config/client-config.ts` — `ClientName` union + `CLIENT_NAMES` array.
- `src/config/environments.ts` — how the client + env resolve to
  `EnvironmentConfig`.
- `src/config/clients/<existing-client>/` — env template shape (`*.env.example`).
- Existing client test folders under `src/tests/<client>/` for the layout to mirror.
- `.claude/skills/penny-create-standard-code/SKILL.md` — the "valid standalone
  clients" list you must update.
- `.claude/skills/penny-api-sdet/SKILL.md`, `playwright-cli/SKILL.md`,
  `penny-business/SKILL.md` — same list, must stay consistent.
- `.claude/skills/penny-business/knowledge/variants/` — variant docs shape.
- `.claude/skills/penny-business/knowledge/variants/variant-matrix.md` — the
  matrix that gains a new column.

## Step-By-Step Workflow

Six edits. All required. Do them in order — later steps depend on earlier ones.

**1. Add the client to `client-config.ts`.**

```typescript
export type ClientName = "ewcf" | "rcmc" | "enterprise" | "sabil" | "newco";
const CLIENT_NAMES: ClientName[] = ["ewcf", "rcmc", "enterprise", "sabil", "newco"];
```

Add URL resolution for `newco` in `resolveUrls` (mirror an existing client's shape).

**2. Add env templates.**

```bash
mkdir -p src/config/clients/newco
cp src/config/clients/ewcf/fb.env.example src/config/clients/newco/fb.env.example
# Repeat for other envs. Never copy real `.env` files — only `*.env.example`.
```

Update the URLs and any client-specific vars in the new `*.env.example` files.

**3. Scaffold the test folders.**

```bash
mkdir -p src/tests/newco/api/_support
mkdir -p src/tests/newco/web
# .gitkeep files if your gitignore drops empty folders.
```

Add a placeholder helper under `_support/` documenting where lifecycle data goes
(see `src/tests/sabil/api/_support/sabil-integration.helpers.ts` for the reference).

**4. Add the business knowledge variant file.**

```bash
touch .claude/skills/penny-business/knowledge/variants/newco.md
```

Populate with the client's differences from enterprise (feature flags, workflow
tweaks, module scoping) using the `variants/<client>.md` template. Add a row
to `variants/variant-matrix.md`.

**5. Update the skill guardrails.** Every skill that lists valid clients needs
the new name added. As of this writing:

- `.claude/skills/penny-create-standard-code/SKILL.md`
- `.claude/skills/penny-api-sdet/SKILL.md`
- `.claude/skills/penny-business/SKILL.md`
- `.claude/skills/playwright-cli/SKILL.md`
- `.claude/skills/penny-setup/SKILL.md` (Skill Map + Required Inputs)
- `CLAUDE.md` — the "About This Project" / valid client list, if enumerated.

**6. Verify.** Run:

```bash
npm run validate
CLIENT=newco TEST_ENV=fb npx playwright test src/tests/newco --project=api-testing --list
```

The list command must succeed (even with zero tests) — that proves the
config loads.

## Framework Standards Reference

`/penny-create-standard-code` is the source of truth for folder + naming. The
new client's tests must follow `src/tests/newco/{api,web}/<domain>/<feature>.spec.ts`
exactly.

## Output Format

1. **Understanding** — client name + envs + layers requested.
2. **Files reviewed** — the six touchpoints above.
3. **Framework pattern found** — which existing client the scaffold mirrors.
4. **Proposed edits** — enumerated per-file diff summary.
5. **Files to create or update** — the full list.
6. **Test-data setup** — placeholder `_support/` helper stub if applicable.
7. **Cleanup strategy** — none needed for scaffolding.
8. **Commands to run** — validate + list.
9. **Self-review checklist** — see below.
10. **Risks / assumptions** — URLs, env names, whether the client should really
    be top-level or stay under enterprise.
11. **Framework feedback** — surface any inconsistency between the six
    touchpoints (e.g., one skill still lists the old client set).

## Quality Checklist

- Client name is snake-case and consistent across all six edits.
- No real `.env` file committed — only `*.env.example`.
- `client-config.ts` `ClientName` union + `CLIENT_NAMES` array both updated.
- `resolveUrls` covers every env for the new client.
- `variants/<client>.md` exists and is linked from `variant-matrix.md`.
- Every skill that lists valid clients has been updated.
- `npm run validate` passes.
- `--list` succeeds for the new client + at least one env.

## Do Not Do

- Do not add `srmg` / `voltalia` / `tahakom` / `modern_mills` / `nhc` back as
  top-level clients without team + knowledge-folder confirmation — they are
  documented as enterprise sub-clients or variants.
- Do not commit real credentials in any `*.env` file.
- Do not skip step 5 — a client that isn't in every skill guardrail will trigger
  confusing "unknown client" errors in future automation runs.
- Do not create the folder scaffold without a plan for at least one real spec
  within the next sprint — empty client folders are dead weight.

## Related Skills

- `/penny-setup` — env variables and run commands.
- `/penny-create-standard-code` — folder + naming baseline.
- `/penny-business` — capture the variant knowledge before writing tests.
- `/penny-create-api-script`, `/penny-create-web-script` — first real specs.
- `/penny-framework-health-check` — audit the six touchpoints stay in sync.
