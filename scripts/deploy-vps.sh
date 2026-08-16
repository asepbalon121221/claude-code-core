#!/usr/bin/env bash
# Deploy dist/claude to a Linux VPS. Credentials via env only.
# Required: DEPLOY_HOST DEPLOY_PORT DEPLOY_USER
# Auth: DEPLOY_SSH_KEY (preferred) or DEPLOY_PASS (sshpass)
# Router: ANTHROPIC_AUTH_TOKEN (written to remote env file)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="$ROOT/dist/claude"
: "${DEPLOY_HOST:?}"
: "${DEPLOY_PORT:?}"
: "${DEPLOY_USER:?}"
: "${ANTHROPIC_AUTH_TOKEN:?set router token}"
[[ -f "$BIN" ]] || { echo "missing $BIN"; exit 1; }

SHA="$(sha256sum "$BIN" | awk '{print $1}')"
REMOTE_DIR=/opt/claude-code
ENV_FILE=/etc/claude-code-router.env
WRAPPER=/usr/local/bin/claude

SSH=(ssh -p "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
SCP=(scp -P "$DEPLOY_PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH+=( -i "$DEPLOY_SSH_KEY" )
  SCP+=( -i "$DEPLOY_SSH_KEY" )
elif [[ -n "${DEPLOY_PASS:-}" ]]; then
  command -v sshpass >/dev/null || { echo "install sshpass or use DEPLOY_SSH_KEY"; exit 1; }
  SSH=(sshpass -p "$DEPLOY_PASS" "${SSH[@]}")
  SCP=(sshpass -p "$DEPLOY_PASS" "${SCP[@]}")
else
  echo "set DEPLOY_SSH_KEY or DEPLOY_PASS" >&2
  exit 1
fi

TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
echo "Deploying to $TARGET (sha256=$SHA)"

"${SSH[@]}" "$TARGET" "mkdir -p '$REMOTE_DIR' && if [[ -f '$REMOTE_DIR/claude' ]]; then cp -a '$REMOTE_DIR/claude' '$REMOTE_DIR/claude.bak.\$(date +%Y%m%d%H%M%S)'; fi"
"${SCP[@]}" "$BIN" "$TARGET:$REMOTE_DIR/claude.new"
"${SSH[@]}" "$TARGET" bash -s <<EOF
set -euo pipefail
mv '$REMOTE_DIR/claude.new' '$REMOTE_DIR/claude'
chmod 755 '$REMOTE_DIR/claude'
echo '$SHA  $REMOTE_DIR/claude' | sha256sum -c -
cat > '$ENV_FILE' <<'ENV'
ANTHROPIC_BASE_URL=https://xd-vps-production.up.railway.app/v1
ANTHROPIC_MODEL=main
ANTHROPIC_AUTH_TOKEN=${ANTHROPIC_AUTH_TOKEN}
USE_BUILTIN_RIPGREP=0
CLAUDE_CODE_DISABLE_MIN_VERSION=1
ENV
chmod 600 '$ENV_FILE'
cat > '$WRAPPER' <<'WRAP'
#!/bin/bash
set -euo pipefail
ENV_FILE=/etc/claude-code-router.env
if [[ ! -r "\$ENV_FILE" ]]; then
  echo "Missing \$ENV_FILE. Run: sudo claude-set-key" >&2
  exit 1
fi
set -a
. "\$ENV_FILE"
set +a
if [[ -z "\${ANTHROPIC_AUTH_TOKEN:-\${ANTHROPIC_API_KEY:-}}" ]]; then
  echo "Router API key is empty. Run: sudo claude-set-key" >&2
  exit 1
fi
exec /opt/claude-code/claude "\$@"
WRAP
chmod 755 '$WRAPPER'
cat > /usr/local/bin/claude-set-key <<'SETKEY'
#!/bin/bash
# Set or rotate the router API key used by the \`claude\` wrapper.
set -euo pipefail
ENV_FILE=/etc/claude-code-router.env
KEY="\${1:-}"
if [[ -z "\$KEY" ]]; then
  read -rsp "Router API key: " KEY
  echo
fi
if [[ -z "\$KEY" ]]; then
  echo "No key given." >&2
  exit 1
fi
touch "\$ENV_FILE"
chmod 600 "\$ENV_FILE"
sed -i '/^ANTHROPIC_AUTH_TOKEN=/d;/^ANTHROPIC_API_KEY=/d' "\$ENV_FILE"
printf 'ANTHROPIC_AUTH_TOKEN=%s\n' "\$KEY" >> "\$ENV_FILE"
echo "Saved to \$ENV_FILE"
SETKEY
chmod 755 /usr/local/bin/claude-set-key
command -v rg >/dev/null || (apt-get update && apt-get install -y ripgrep) || true
claude --version
claude --help | head -n 5
EOF

echo "OK: deployed. Rollback: restore newest $REMOTE_DIR/claude.bak.*"
