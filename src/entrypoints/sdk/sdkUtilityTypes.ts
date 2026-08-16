import type { BetaUsage } from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'

export type NonNullableUsage = Omit<
  BetaUsage,
  | 'server_tool_use'
  | 'service_tier'
  | 'cache_creation'
  | 'inference_geo'
  | 'iterations'
  | 'speed'
> & {
  input_tokens: number
  cache_creation_input_tokens: number
  cache_read_input_tokens: number
  output_tokens: number
  server_tool_use: {
    web_search_requests: number
    web_fetch_requests: number
  }
  service_tier: NonNullable<BetaUsage['service_tier']>
  cache_creation: {
    ephemeral_1h_input_tokens: number
    ephemeral_5m_input_tokens: number
  }
  inference_geo: NonNullable<BetaUsage['inference_geo']>
  iterations: NonNullable<BetaUsage['iterations']>
  speed: NonNullable<BetaUsage['speed']>
}
