# CI/CD Guide

The workflow at `.github/workflows/ci.yml` runs static checks first, then executes
the Penny Playwright projects in parallel.

## Required Secrets

Set these in GitHub repository settings under **Secrets and variables → Actions**:

| Secret           | Required | Description                           |
| ---------------- | -------- | ------------------------------------- |
| `USER_EMAIL`     | Yes      | Standard test user email              |
| `USER_PASSWORD`  | Yes      | Standard test user password           |
| `ADMIN_EMAIL`    | Yes      | Admin test user email                 |
| `ADMIN_PASSWORD` | Yes      | Admin test user password              |
| `WEB_BASE_URL`   | Optional | Override the configured Penny web URL |
| `API_BASE_URL`   | Optional | Override the configured Penny API URL |

The framework also supports local credential files at
`src/config/clients/{client}/{env}.env`. In CI, secrets are enough when those
files are not present.

## Pipeline Jobs

`quality` runs:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
```

`test` runs a matrix over:

```text
api-testing
smoke
```

The `smoke` project installs Chromium because it executes browser tests. The
`api-testing` project does not install browsers.

## Inputs

Manual runs support:

| Input       | Values                                                      |
| ----------- | ----------------------------------------------------------- |
| `client`    | `ewcf`, `rcmc`, `enterprise`, `sabil`                       |
| `test_env`  | `dev`, `test`, `fb`, `fb-<number>`, `demo`, `prod`          |
| `test_grep` | Optional Playwright grep, such as `@smoke` or `@regression` |

Scheduled runs use `@smoke`. Push and pull request runs use no grep filter by
default, so each selected project runs its full matching suite.

## Local CI Simulation

```bash
CLIENT=ewcf TEST_ENV=test npm run validate
CLIENT=ewcf TEST_ENV=test npm run test:api
CLIENT=ewcf TEST_ENV=test npm run test:web
CLIENT=ewcf TEST_ENV=fb-5 npm run test:api
```

Use environment variables instead of local credential files when simulating CI:

```bash
CLIENT=ewcf TEST_ENV=test \
USER_EMAIL=user@example.com USER_PASSWORD='***' \
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='***' \
npm run test:api
```

## Artifacts

Each matrix job uploads:

- HTML, JSON, JUnit, and Allure report output under `artifacts/reports/`
- Playwright traces, videos, screenshots, and raw test output under
  `artifacts/test-results/`

These outputs are generated artifacts and must stay ignored by git.

Allure generation includes `environment.properties`, `executor.json`, and
`categories.json` from global setup. In GitHub Actions, executor metadata uses
the workflow run URL automatically when `GITHUB_*` variables are available.
