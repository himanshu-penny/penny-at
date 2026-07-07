---
name: penny-create-utility-script
description: Creator for Penny framework utility scripts in penny-at. Use when the user asks Claude to create, improve, or review Node.js scripts, shell scripts, setup/cleanup helpers, schema/report generators, or local automation utilities.
---

# Penny Create Utility Script

Create safe local utility scripts for this workspace. This is for framework helper
scripts, not Playwright test specs. For API tests, use `penny-create-api-script`.

## Before Editing

Inspect the existing script style:

- `scripts/setup.sh`
- `scripts/cleanup.sh`
- `scripts/generate-schema.js`
- `scripts/strip-ansi-allure.js`

State a short plan before writing when the script can affect external systems,
delete files, create tasks, or call network APIs.

## Script Rules

- Keep scripts local to `penny-at`; do not read or copy from another repo unless asked.
- Load secrets from environment variables or `.env`; never hardcode tokens.
- Treat real client credential files under `src/config/clients/**/*.env` as
  local-only secrets; only `*.env.example` files are shareable.
- Valid standalone clients are `ewcf`, `rcmc`, `enterprise`, and `sabil`.
  `srmg` and `voltalia` belong under enterprise, not client config.
- Print clear usage when required arguments are missing.
- Add `--yes` or another explicit confirmation bypass for scripts that create or mutate external records.
- Validate input formats before calling external APIs.
- Fail fast with actionable errors and non-zero exit codes.
- Redact tokens, passwords, cookies, and auth headers from logs.
- Avoid destructive file operations unless scoped to generated outputs.
- Keep generated outputs under ignored locations such as `artifacts/`.

## Node Script Pattern

Use `.mjs` for new Node utilities unless the repo already has a better pattern.

```javascript
const { config } = await import("dotenv");
config();

const token = process.env.PENNY_ACCESS_TOKEN ?? process.env.API_AUTH_TOKEN;
if (!token) {
  console.error("Error: PENNY_ACCESS_TOKEN or API_AUTH_TOKEN is not set.");
  process.exit(1);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node scripts/example.mjs <id> [--yes]");
  process.exit(1);
}
```

Prefer small pure helpers for formatting, validation, and API payload creation.
Keep side effects in clearly named functions such as `createTask()` or `writeReport()`.

## Shell Script Pattern

For `.sh` scripts:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

Quote paths and variables. Print what will happen before deleting or overwriting
generated outputs. Keep cleanup targets aligned with `.gitignore`.

## Validation

Run the smallest safe check:

```bash
node <script>.mjs --help
bash -n scripts/<script>.sh
npm run validate
npm run format:check
```

Do not run scripts that mutate Penny data, call external systems, or delete files
without explicit user approval.

## Related Skills

- `/penny-setup` — env variables and run gates.
- `/penny-create-standard-code` — naming and TypeScript baseline.
- `/penny-test-data-setup` — for setup / cleanup scripts.
- `/penny-framework-health-check` — flags when a utility should be promoted
  into `src/utils/**` or into a fixture.
