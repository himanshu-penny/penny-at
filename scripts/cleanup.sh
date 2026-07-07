#!/usr/bin/env bash
# =============================================================================
# Penny AT Framework — Cleanup Script
# =============================================================================
# Wipes all generated artifacts. Storage states are preserved by default
# so you don't have to re-authenticate after every cleanup.
# Usage: bash scripts/cleanup.sh   OR   npm run cleanup
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
step()    { echo -e "\n${BOLD}▶  $1${RESET}"; }

guard_generated_path() {
  local target="$1"

  case "$target" in
    "$ROOT_DIR"/artifacts/*|"$ROOT_DIR"/allure-results|"$ROOT_DIR"/allure-results/*) ;;
    *)
      echo "Refusing to delete outside generated artifact paths: $target" >&2
      exit 1
      ;;
  esac
}

clean_dir() {
  local dir="$1"
  mkdir -p "$dir"

  local abs_dir
  abs_dir="$(cd "$dir" && pwd -P)"
  guard_generated_path "$abs_dir"

  find "$abs_dir" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
}

remove_generated_path() {
  local target="$1"
  local parent
  parent="$(dirname "$target")"
  mkdir -p "$parent"

  local abs_parent abs_target
  abs_parent="$(cd "$parent" && pwd -P)"
  abs_target="$abs_parent/$(basename "$target")"
  guard_generated_path "$abs_target"

  rm -rf "$abs_target"
}

echo ""
step "Cleaning up test artifacts"

clean_dir artifacts/test-results
clean_dir artifacts/reports/html
clean_dir artifacts/reports/allure-results
clean_dir artifacts/reports/allure-html
remove_generated_path allure-results
# Remove stale allure output dirs if they reappear
remove_generated_path artifacts/reports/allure
remove_generated_path artifacts/reports/allure-report
clean_dir artifacts/reports/meta
remove_generated_path artifacts/reports/results.json
remove_generated_path artifacts/reports/junit.xml
clean_dir artifacts/screenshots
clean_dir artifacts/videos
clean_dir artifacts/traces

success "Artifacts cleaned"

# Storage states are intentionally left intact.
# Delete manually if you need to force a fresh login:
#   rm -f .auth/user-web.json .auth/user-api.json
echo ""
echo -e "  ${CYAN}Note:${RESET} .auth/ was not cleared (preserves login sessions)."
echo -e "  To force a fresh login: ${CYAN}rm -f .auth/*.json${RESET}"
echo ""
echo -e "${BOLD}Cleanup complete.${RESET}"
echo ""
