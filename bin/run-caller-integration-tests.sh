#!/usr/bin/env bash
# Run integration tests for LLM caller providers.
#
# Usage:
#   bin/run-caller-integration-tests.sh                  # all providers
#   bin/run-caller-integration-tests.sh openai gemini    # specific providers
#   bin/run-caller-integration-tests.sh -v openai        # verbose
#
# Prerequisites:
#   Copy testdata/integration_config.yaml.example → testdata/integration_config.yaml
#   and enable the providers you want to test with real API keys.

set -euo pipefail

CALLER_PKG="./api/integration-api/internal/caller"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

ALL_PROVIDERS=(
  openai
  anthropic
  gemini
  vertexai
  azure
  cohere
  mistral
  replicate
  huggingface
  voyageai
)

VERBOSE=""
PROVIDERS=()
TIMEOUT="${INTEGRATION_TEST_TIMEOUT:-120s}"

# Parse args
for arg in "$@"; do
  case "$arg" in
    -v|--verbose)
      VERBOSE="-v"
      ;;
    -h|--help)
      echo "Usage: $0 [-v] [provider ...]"
      echo ""
      echo "Providers: ${ALL_PROVIDERS[*]}"
      echo ""
      echo "Environment variables:"
      echo "  INTEGRATION_TEST_CONFIG    Path to config YAML (default: testdata/integration_config.yaml)"
      echo "  INTEGRATION_TEST_TIMEOUT   Test timeout (default: 120s)"
      exit 0
      ;;
    *)
      PROVIDERS+=("$arg")
      ;;
  esac
done

# Default to all providers if none specified
if [ ${#PROVIDERS[@]} -eq 0 ]; then
  PROVIDERS=("${ALL_PROVIDERS[@]}")
fi

PASSED=()
FAILED=()
SKIPPED=()

echo "═══════════════════════════════════════════════════════════"
echo " LLM Caller Integration Tests"
echo "═══════════════════════════════════════════════════════════"
echo ""

for provider in "${PROVIDERS[@]}"; do
  pkg="${CALLER_PKG}/${provider}/"
  echo "─── ${provider} ───────────────────────────────────────────"

  if go test -tags=integration "$pkg" -run "TestIntegration" $VERBOSE -timeout "$TIMEOUT" 2>&1; then
    PASSED+=("$provider")
  else
    exit_code=$?
    # Check if all tests were skipped (exit 0 with skip messages)
    if [ $exit_code -eq 0 ]; then
      SKIPPED+=("$provider")
    else
      FAILED+=("$provider")
    fi
  fi
  echo ""
done

echo "═══════════════════════════════════════════════════════════"
echo " Results"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ ${#PASSED[@]} -gt 0 ]; then
  echo "  PASS: ${PASSED[*]}"
fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "  FAIL: ${FAILED[*]}"
fi

echo ""
echo "  Total: $((${#PASSED[@]} + ${#FAILED[@]}))  Pass: ${#PASSED[@]}  Fail: ${#FAILED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi
