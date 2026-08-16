/**
 * Runnable self-check for router defaults.
 *
 *   bun run src/utils/routerDefaults.check.ts
 *   ROUTER_LIVE_CHECK=1 bun run src/utils/routerDefaults.check.ts
 *
 * Live check requires ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY in the environment.
 */
import {
  applyRouterDefaultsIfUnset,
  getRouterDefaults,
  isRouterDefaultBaseUrl,
  isRouterPreconfigured,
  ROUTER_DEFAULT_BASE_URL,
  ROUTER_DEFAULT_MODEL,
} from './routerDefaults.js'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`)
}

function snapshotEnv(keys: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const k of keys) out[k] = process.env[k]
  return out
}

function restoreEnv(
  snap: Record<string, string | undefined>,
  keys: string[],
): void {
  for (const k of keys) {
    const v = snap[k]
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
}

function authToken(): string {
  const token =
    process.env.ANTHROPIC_AUTH_TOKEN?.trim() ||
    process.env.ANTHROPIC_API_KEY?.trim()
  assert(
    token,
    'ROUTER_LIVE_CHECK needs ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY',
  )
  return token
}

async function liveCheck(): Promise<void> {
  const token = authToken()
  const body = JSON.stringify({
    model: ROUTER_DEFAULT_MODEL,
    max_tokens: 32,
    stream: false,
    messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
  })
  const res = await fetch(`${ROUTER_DEFAULT_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': token,
    },
    body,
    signal: AbortSignal.timeout(60_000),
  })
  assert(res.status === 200, `live /v1/messages expected 200, got ${res.status}`)
  const reader = res.body?.getReader()
  let raw = ''
  if (reader) {
    const decoder = new TextDecoder()
    const deadline = Date.now() + 45_000
    while (Date.now() < deadline) {
      const { done, value } = await reader.read()
      if (value) raw += decoder.decode(value, { stream: !done })
      if (
        done ||
        raw.includes('"type":"message"') ||
        raw.includes('message_start') ||
        /"text"\s*:\s*"OK"/.test(raw)
      ) {
        break
      }
    }
    await reader.cancel().catch(() => {})
  } else {
    raw = await res.text()
  }
  const looksOk =
    raw.includes('"type":"message"') ||
    raw.includes('message_start') ||
    /"text"\s*:\s*"OK"/.test(raw) ||
    /\bOK\b/.test(raw)
  assert(looksOk, `expected Anthropic message/OK in body, got: ${raw.slice(0, 400)}`)
  console.log('live check: OK')
}

async function main(): Promise<void> {
  const defaults = getRouterDefaults()
  assert(
    defaults.ANTHROPIC_BASE_URL === ROUTER_DEFAULT_BASE_URL,
    'base URL mismatch',
  )
  assert(defaults.ANTHROPIC_MODEL === ROUTER_DEFAULT_MODEL, 'model mismatch')
  assert(
    !('ANTHROPIC_API_KEY' in defaults),
    'defaults must not embed API key',
  )
  assert(
    !('ANTHROPIC_AUTH_TOKEN' in defaults),
    'defaults must not embed auth token',
  )
  assert(
    isRouterDefaultBaseUrl(ROUTER_DEFAULT_BASE_URL),
    'isRouterDefaultBaseUrl(default) should be true',
  )
  assert(
    !isRouterDefaultBaseUrl('https://api.anthropic.com'),
    'isRouterDefaultBaseUrl(anthropic) should be false',
  )

  const keys = Object.keys(defaults)
  const snap = snapshotEnv([
    ...keys,
    'ANTHROPIC_API_KEY',
    'ANTHROPIC_AUTH_TOKEN',
  ])

  for (const k of keys) delete process.env[k]
  applyRouterDefaultsIfUnset()
  for (const [k, v] of Object.entries(defaults)) {
    assert(process.env[k] === v, `expected ${k}=${v}, got ${process.env[k]}`)
  }

  for (const k of keys) delete process.env[k]
  process.env.ANTHROPIC_BASE_URL = 'https://example.com/v1'
  process.env.ANTHROPIC_MODEL = 'custom-model'
  applyRouterDefaultsIfUnset()
  assert(
    process.env.ANTHROPIC_BASE_URL === 'https://example.com/v1',
    'must not overwrite ANTHROPIC_BASE_URL',
  )
  assert(
    process.env.ANTHROPIC_MODEL === 'custom-model',
    'must not overwrite ANTHROPIC_MODEL',
  )

  const preconfKeys = [
    'ANTHROPIC_BASE_URL',
    'ANTHROPIC_AUTH_TOKEN',
    'ANTHROPIC_API_KEY',
    'CLAUDE_CODE_FORCE_ONBOARDING',
  ]
  for (const k of preconfKeys) delete process.env[k]
  assert(!isRouterPreconfigured(), 'no base URL and no key must not be preconfigured')

  applyRouterDefaultsIfUnset()
  assert(!isRouterPreconfigured(), 'base URL without a key must not be preconfigured')

  process.env.ANTHROPIC_AUTH_TOKEN = 'test-token'
  assert(isRouterPreconfigured(), 'base URL plus auth token must be preconfigured')

  delete process.env.ANTHROPIC_AUTH_TOKEN
  process.env.ANTHROPIC_API_KEY = 'test-key'
  assert(isRouterPreconfigured(), 'base URL plus API key must be preconfigured')

  process.env.CLAUDE_CODE_FORCE_ONBOARDING = '1'
  assert(!isRouterPreconfigured(), 'CLAUDE_CODE_FORCE_ONBOARDING must restore onboarding')
  process.env.CLAUDE_CODE_FORCE_ONBOARDING = '0'
  assert(isRouterPreconfigured(), 'CLAUDE_CODE_FORCE_ONBOARDING=0 must stay preconfigured')

  restoreEnv(snap, Object.keys(snap))
  for (const k of preconfKeys) {
    if (!(k in snap)) delete process.env[k]
  }
  console.log('assert check: OK')

  if (process.env.ROUTER_LIVE_CHECK === '1') {
    await liveCheck()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
