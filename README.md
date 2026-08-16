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

See [OPENAI_ROUTER_PROMPT.md](OPENAI_ROUTER_PROMPT.md) and [`.env.example`](.env.example).

## Smoke (Linux)

```bash
export ANTHROPIC_AUTH_TOKEN=...
export USE_BUILTIN_RIPGREP=0
bash scripts/smoke-linux.sh
```

## Legal

Educational / research reconstruction of leaked source. Anthropic retains rights to the original product. Do not use commercially without authorization. See [LICENSE](LICENSE).
