/**
 * Default VPS Docker Anthropic-Messages / OpenAI-compatible gateway for this fork.
 * (Deploy URL may be on Railway hosting; the app is the Docker router.)
 * Env vars already set by the user always win (apply-if-unset only).
 *
 * Auth tokens are NEVER hardcoded — set ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY.
 */

export const ROUTER_DEFAULT_BASE_URL =
  'https://xd-vps-production.up.railway.app/v1'
export const ROUTER_DEFAULT_MODEL = 'main'
export const ROUTER_DEFAULT_HOST = 'xd-vps-production.up.railway.app'

/** Safe defaults only — no secrets. Auth must come from the environment. */
const ROUTER_ENV_DEFAULTS: Readonly<Record<string, string>> = {
  ANTHROPIC_BASE_URL: ROUTER_DEFAULT_BASE_URL,
  ANTHROPIC_MODEL: ROUTER_DEFAULT_MODEL,
}

export function getRouterDefaults(): Readonly<Record<string, string>> {
  return ROUTER_ENV_DEFAULTS
}

function isUnset(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

/** True when aimed at this fork's default VPS Docker router host. */
export function isRouterDefaultBaseUrl(
  baseUrl: string | undefined = process.env.ANTHROPIC_BASE_URL,
): boolean {
  if (!baseUrl) return false
  try {
    return new URL(baseUrl).hostname === ROUTER_DEFAULT_HOST
  } catch {
    return baseUrl.includes(ROUTER_DEFAULT_HOST)
  }
}

/**
 * Fill safe ANTHROPIC_* defaults only when unset. Call before settings env apply
 * so trusted settings can still override afterwards.
 */
export function applyRouterDefaultsIfUnset(): void {
  for (const [key, value] of Object.entries(ROUTER_ENV_DEFAULTS)) {
    if (isUnset(process.env[key])) {
      process.env[key] = value
    }
  }
}
