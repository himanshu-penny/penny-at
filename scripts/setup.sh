#!/usr/bin/env bash
# =============================================================================
# Penny AT Framework — Setup Script
# =============================================================================
# Usage: bash scripts/setup.sh   OR   npm run setup
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }
step()    { echo -e "\n${BOLD}▶  $1${RESET}"; }

echo ""
echo -e "${BOLD}================================================${RESET}"
echo -e "${BOLD}   Penny AT Framework — Setup                  ${RESET}"
echo -e "${BOLD}================================================${RESET}"
echo ""

# ── 1. Node.js version check ──────────────────────────────────────────────────
step "Checking Node.js"
if ! command -v node &>/dev/null; then
  error "Node.js not found. Install Node.js 18 LTS or later from https://nodejs.org"
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node)")
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  error "Node.js $NODE_VERSION found, but 18+ is required. Please upgrade: https://nodejs.org"
fi
success "Node.js $NODE_VERSION — OK"

# ── 2. npm version check ──────────────────────────────────────────────────────
step "Checking npm"
if ! command -v npm &>/dev/null; then
  error "npm not found. It should ship with Node.js — please reinstall Node."
fi

NPM_VERSION=$(npm --version)
NPM_MAJOR=$(echo "$NPM_VERSION" | cut -d. -f1)

if [ "$NPM_MAJOR" -lt 9 ]; then
  warn "npm $NPM_VERSION found. npm 9+ is recommended. Run: npm install -g npm@latest"
else
  success "npm $NPM_VERSION — OK"
fi

# ── 3. Install npm dependencies ───────────────────────────────────────────────
step "Installing npm dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
success "npm dependencies installed"

# ── 4. Install Playwright browsers ───────────────────────────────────────────
step "Installing Playwright browsers (chromium, firefox, webkit + system deps)"
npx playwright install --with-deps
success "Playwright browsers installed"

# ── 5. TypeScript compilation check ──────────────────────────────────────────
step "Running TypeScript type-check"
if npx tsc --noEmit 2>&1; then
  success "TypeScript — no type errors found"
else
  warn "TypeScript reported type errors above. Review before running tests."
fi

# ── 6. Allure CLI check (optional) ───────────────────────────────────────────
step "Checking Allure CLI (optional — needed for npm run report:allure)"
if command -v allure &>/dev/null; then
  ALLURE_VERSION=$(allure --version 2>/dev/null || echo "unknown")
  success "Allure CLI $ALLURE_VERSION — OK"
else
  warn "Allure CLI not found. 'npm run report:allure' will not work."
  warn "  To install:  npm install -g allure-commandline"
  warn "  On macOS:    brew install allure"
fi

# ── 7. Create required directories ───────────────────────────────────────────
step "Creating artifact and workspace directories"

# Playwright outputDir — must exist before first run
mkdir -p artifacts/test-results

# Reports
mkdir -p artifacts/reports/html
mkdir -p artifacts/reports/allure-results
mkdir -p artifacts/reports/allure-html
mkdir -p artifacts/reports/meta

# Screenshots, video, traces (Playwright writes here on failure)
mkdir -p artifacts/screenshots
mkdir -p artifacts/videos
mkdir -p artifacts/traces

# Auth state — Playwright stores login session cookies here
mkdir -p .auth

# Test data — API request bodies and AJV schema files
mkdir -p test-data/request-objects
mkdir -p test-data/response-schemas

# Keep .auth in git (empty placeholder) — actual *.json are gitignored
touch .auth/.gitkeep

success "All directories created"

# ── 8. Set up client credential files ────────────────────────────────────────
step "Setting up client credential files"
CLIENTS_DIR="src/config/clients"
CREATED=0
shopt -s globstar nullglob
example_files=("$CLIENTS_DIR"/**/*.env.example)

if [ "${#example_files[@]}" -eq 0 ]; then
  warn "No credential template files found under $CLIENTS_DIR"
fi

for example_file in "${example_files[@]}"; do
  target="${example_file%.example}"
  if [ ! -f "$target" ]; then
    cp "$example_file" "$target"
    success "Created $target"
    CREATED=$((CREATED + 1))
  fi
done
if [ "$CREATED" -eq 0 ]; then
  success "All credential files already exist — skipping"
else
  warn "ACTION REQUIRED: Fill in credentials in the files created above"
  warn "  They live under $CLIENTS_DIR/{client}/{env}.env"
fi

# ── 9. Verify Playwright is runnable ─────────────────────────────────────────
step "Verifying Playwright installation"
PW_VERSION=$(npx playwright --version 2>/dev/null || echo "unknown")
success "Playwright $PW_VERSION — ready"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}================================================${RESET}"
echo -e "${GREEN}${BOLD}   Setup complete!${RESET}"
echo -e "${BOLD}================================================${RESET}"
echo ""
echo -e "  ${BOLD}Next steps:${RESET}"
echo -e "  1.  Fill in credentials in ${CYAN}src/config/clients/{client}/{env}.env${RESET}"
echo -e "  2.  Set ${CYAN}CLIENT${RESET} and ${CYAN}TEST_ENV${RESET} before running (e.g. ${CYAN}CLIENT=ewcf TEST_ENV=test${RESET})"
echo ""
echo -e "  ${BOLD}Run tests:${RESET}"
echo -e "  CLIENT=ewcf TEST_ENV=test npm test          — all tests"
echo -e "  npm run test:smoke                          — smoke suite only"
echo -e "  npm run test:api                            — API tests only"
echo -e "  npm run test:web                            — web UI tests (Chromium)"
echo -e "  npm run test:headed                         — run with visible browser"
echo -e "  npm run test:debug                          — step-through debug mode"
echo ""
echo -e "  ${BOLD}Reports:${RESET}"
echo -e "  npm run report            — open HTML report"
echo -e "  npm run report:allure     — open Allure report (requires Allure CLI)"
echo ""
echo -e "  ${BOLD}Utilities:${RESET}"
echo -e "  npm run typecheck         — TypeScript type-check only"
echo -e "  npm run lint              — ESLint"
echo -e "  npm run cleanup           — wipe all artifacts"
echo ""
