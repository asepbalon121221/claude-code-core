#!/usr/bin/env bash
# Linux smoke tests for dist/claude (run on Linux host or in Docker).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${ROOT}/dist/claude"
export USE_BUILTIN_RIPGREP=0
export ANTHROPIC_BASE_URL="${ANTHROPIC_BASE_URL:-https://xd-vps-production.up.railway.app/v1}"
export ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-main}"

if [[ ! -x "$BIN" && ! -f "$BIN" ]]; then
  echo "missing binary: $BIN" >&2
  exit 1
fi
chmod +x "$BIN" || true

echo "== --version =="
"$BIN" --version

echo "== --help =="
"$BIN" --help >/tmp/claude-help.txt
head -n 5 /tmp/claude-help.txt

if [[ -z "${ANTHROPIC_AUTH_TOKEN:-${ANTHROPIC_API_KEY:-}}" ]]; then
  echo "SKIP router prompt: no ANTHROPIC_AUTH_TOKEN/API_KEY"
  exit 0
fi

echo "== router print prompt =="
# Non-interactive; allow long router latency
set +e
OUT="$("$BIN" -p "Reply with exactly: OK" --output-format text 2>/tmp/claude-err.txt)"
CODE=$?
set -e
echo "$OUT" | head -n 20
if ! echo "$OUT" | grep -q "OK"; then
  echo "router prompt failed (exit=$CODE)" >&2
  cat /tmp/claude-err.txt >&2 || true
  exit 1
fi

echo "== tool smoke (tmpdir) =="
TMP="$(mktemp -d)"
cd "$TMP"
echo "hello" > note.txt
set +e
OUT2="$("$BIN" -p "Read note.txt and reply with its contents only" --output-format text 2>/tmp/claude-err2.txt)"
CODE2=$?
set -e
echo "$OUT2" | head -n 40
if ! echo "$OUT2" | grep -qi "hello"; then
  echo "tool smoke failed (exit=$CODE2)" >&2
  cat /tmp/claude-err2.txt >&2 || true
  exit 1
fi

echo "OK: smoke-linux passed"
