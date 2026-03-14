#!/usr/bin/env bash
# Run integration tests for STT/TTS transformer providers.
#
# Usage:
#   bin/run-transformer-integration-tests.sh                      # all providers
#   bin/run-transformer-integration-tests.sh deepgram rime        # specific providers
#   bin/run-transformer-integration-tests.sh -v google            # verbose
#   bin/run-transformer-integration-tests.sh --tts-only deepgram  # TTS tests only
#   bin/run-transformer-integration-tests.sh --stt-only deepgram  # STT tests only
#
# Prerequisites:
#   Copy api/assistant-api/internal/transformer/testdata/integration_config.yaml.example
#   → integration_config.yaml and enable the providers you want to test with real API keys.

set -euo pipefail

TRANSFORMER_PKG="./api/assistant-api/internal/transformer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# Provider → package directory mapping
declare -A PROVIDER_PKG=(
  [deepgram]="deepgram"
  [google]="google"
  [sarvam]="sarvam"
  [elevenlabs]="elevenlabs"
  [cartesia]="cartesia"
  [assemblyai]="assembly-ai"
  [azure]="azure"
  [rime]="rime"
  [resemble]="resemble"
)

# Provider capabilities: tts, stt, or both
declare -A PROVIDER_CAP=(
  [deepgram]="both"
  [google]="both"
  [sarvam]="both"
  [elevenlabs]="tts"
  [cartesia]="both"
  [assemblyai]="stt"
  [azure]="both"
  [rime]="tts"
  [resemble]="tts"
)

ALL_PROVIDERS=(deepgram google sarvam elevenlabs cartesia assemblyai azure rime)

VERBOSE=""
PROVIDERS=()
FILTER=""
TIMEOUT="${INTEGRATION_TEST_TIMEOUT:-300s}"

# Parse args
for arg in "$@"; do
  case "$arg" in
    -v|--verbose)
      VERBOSE="-v"
      ;;
    --tts-only)
      FILTER="TTS"
      ;;
    --stt-only)
      FILTER="STT"
      ;;
    -h|--help)
      echo "Usage: $0 [-v] [--tts-only|--stt-only] [provider ...]"
      echo ""
      echo "Providers: ${ALL_PROVIDERS[*]}"
      echo ""
      echo "Flags:"
      echo "  -v, --verbose    Verbose test output"
      echo "  --tts-only       Run only TTS integration tests"
      echo "  --stt-only       Run only STT integration tests"
      echo ""
      echo "Environment variables:"
      echo "  TRANSFORMER_TEST_CONFIG    Path to config YAML (default: testdata/integration_config.yaml)"
      echo "  INTEGRATION_TEST_TIMEOUT   Test timeout (default: 300s)"
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

# Build test name filter based on --tts-only / --stt-only
RUN_FILTER=""
if [ "$FILTER" = "TTS" ]; then
  RUN_FILTER="-run TTS"
elif [ "$FILTER" = "STT" ]; then
  RUN_FILTER="-run STT"
fi

PASSED=()
FAILED=()
SKIPPED=()

echo "═══════════════════════════════════════════════════════════"
echo " Transformer Integration Tests (STT/TTS)"
echo "═══════════════════════════════════════════════════════════"
echo ""

for provider in "${PROVIDERS[@]}"; do
  pkg_dir="${PROVIDER_PKG[$provider]:-}"
  cap="${PROVIDER_CAP[$provider]:-}"

  if [ -z "$pkg_dir" ]; then
    echo "─── ${provider} ──────────────────────────────────────────"
    echo "  SKIP: unknown provider \"${provider}\""
    SKIPPED+=("$provider")
    echo ""
    continue
  fi

  # Skip if filter doesn't match capability
  if [ "$FILTER" = "TTS" ] && [ "$cap" = "stt" ]; then
    echo "─── ${provider} ──────────────────────────────────────────"
    echo "  SKIP: ${provider} is STT-only (--tts-only requested)"
    SKIPPED+=("$provider")
    echo ""
    continue
  fi
  if [ "$FILTER" = "STT" ] && [ "$cap" = "tts" ]; then
    echo "─── ${provider} ──────────────────────────────────────────"
    echo "  SKIP: ${provider} is TTS-only (--stt-only requested)"
    SKIPPED+=("$provider")
    echo ""
    continue
  fi

  pkg="${TRANSFORMER_PKG}/${pkg_dir}/"
  echo "─── ${provider} ──────────────────────────────────────────"

  # shellcheck disable=SC2086
  if go test -tags=integration "$pkg" $RUN_FILTER $VERBOSE -count=1 -timeout "$TIMEOUT" 2>&1; then
    PASSED+=("$provider")
  else
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
      SKIPPED+=("$provider")
    else
      FAILED+=("$provider")
    fi
  fi
  echo ""
done

# Also run the cross-provider integration tests
echo "─── cross-provider ─────────────────────────────────────────"
CROSS_FILTER=""
if [ "$FILTER" = "TTS" ]; then
  CROSS_FILTER="-run TestTTS"
elif [ "$FILTER" = "STT" ]; then
  CROSS_FILTER="-run TestSTT"
fi

# shellcheck disable=SC2086
if go test -tags=integration "${TRANSFORMER_PKG}/" $CROSS_FILTER $VERBOSE -count=1 -timeout "$TIMEOUT" 2>&1; then
  PASSED+=("cross-provider")
else
  exit_code=$?
  if [ $exit_code -eq 0 ]; then
    SKIPPED+=("cross-provider")
  else
    FAILED+=("cross-provider")
  fi
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo " Results"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ ${#PASSED[@]} -gt 0 ]; then
  echo "  PASS: ${PASSED[*]}"
fi
if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "  SKIP: ${SKIPPED[*]}"
fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "  FAIL: ${FAILED[*]}"
fi

echo ""
echo "  Total: $((${#PASSED[@]} + ${#FAILED[@]} + ${#SKIPPED[@]}))  Pass: ${#PASSED[@]}  Fail: ${#FAILED[@]}  Skip: ${#SKIPPED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
  exit 1
fi
