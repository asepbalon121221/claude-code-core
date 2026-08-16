# 💻 Claude Code Core (fork)

Source dump of Claude Code rebuilt as a **core Linux x64** Bun binary with a default VPS Docker Anthropic-Messages router (`model=main`).

<img src="./assets/demo.gif" />

## Supported (core)

- Chat / streaming via Anthropic Messages API (`/v1/messages`)
- Shell + file tools (read/write/edit/glob/grep)
- Basic MCP
- Terminal UI + print mode (`-p`)

## Not included / stubbed

Private Anthropic packages and missing dump modules are stubbed or feature-disabled: voice, Chrome/computer-use, Bedrock/Vertex/Foundry, bridge/daemon internals, swarm/team internals, classifier internals.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2.23
- Linux x64 (glibc) to run the compiled binary
- System `rg` (ripgrep) — set `USE_BUILTIN_RIPGREP=0`
- Router auth: `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_API_KEY` (never commit)

## Build

```bash
bun install
bun run check:secrets
bun run check:imports
bun run check:router
bun run build:linux-x64   # -> dist/claude (ELF)
```

JS diagnostic bundle:

```bash
bun run build:js          # -> dist/claude.js
bun dist/claude.js --version
```

## Default API router

Safe defaults only (no secrets in Git):

| Env | Default |
| --- | --- |
| `ANTHROPIC_BASE_URL` | `https://xd-vps-production.up.railway.app/v1` |
| `ANTHROPIC_MODEL` | `main` |
| `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_API_KEY` | **required** at runtime |

Set only one of `ANTHROPIC_AUTH_TOKEN` or `ANTHROPIC_API_KEY` — setting both makes the CLI warn about conflicting auth.

See [OPENAI_ROUTER_PROMPT.md](OPENAI_ROUTER_PROMPT.md) and [`.env.example`](.env.example).

## First run

When the base URL and a key both come from the environment, the CLI treats the setup as done: no theme picker, no OAuth step, and the key is pre-approved, so `claude` opens straight at the prompt. Set `CLAUDE_CODE_FORCE_ONBOARDING=1` to get the setup screens back, or run `/theme` to change the theme later.

Workspace trust is deliberately left alone — it still asks once per folder tree, since it gates whether settings and CLAUDE.md includes from that folder are applied. Pre-accept a folder by adding it to `~/.claude.json`:

```json
{ "projects": { "/root": { "hasTrustDialogAccepted": true } } }
```

## Deploy (VPS)

```bash
export DEPLOY_HOST=... DEPLOY_PORT=... DEPLOY_USER=root
export DEPLOY_SSH_KEY=~/.ssh/id_ed25519   # or DEPLOY_PASS
export ANTHROPIC_AUTH_TOKEN=...
bash scripts/deploy-vps.sh
```

This installs `/opt/claude-code/claude`, a `claude` wrapper that loads `/etc/claude-code-router.env`, and `claude-set-key` for rotating the key (`sudo claude-set-key <key>`).

## Smoke (Linux)

```bash
export ANTHROPIC_AUTH_TOKEN=...
export USE_BUILTIN_RIPGREP=0
bash scripts/smoke-linux.sh
```

## Legal

Educational / research reconstruction of leaked source. Anthropic retains rights to the original product. Do not use commercially without authorization. See [LICENSE](LICENSE).
