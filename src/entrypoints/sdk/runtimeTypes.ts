/**
 * Runtime SDK types — reconstructed stubs for missing sdk/runtimeTypes.ts.
 * Methods/callbacks are typed loosely so the core CLI can compile.
 */
import type { z } from 'zod/v4'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type {
  SDKMessage,
  SDKUserMessage,
  SDKSessionInfo,
} from './coreTypes.js'

export type AnyZodRawShape = Record<string, z.ZodType>

export type InferShape<T extends AnyZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>
}

export type SdkMcpToolDefinition<Schema extends AnyZodRawShape = AnyZodRawShape> =
  {
    name: string
    description: string
    inputSchema: Schema
    handler: (
      args: InferShape<Schema>,
      extra: unknown,
    ) => Promise<CallToolResult>
  }

export type McpSdkServerConfigWithInstance = {
  type: 'sdk'
  name: string
  instance: unknown
}

export type Options = Record<string, unknown>
export type InternalOptions = Options & { internal?: true }

export type Query = AsyncGenerator<SDKMessage, void> & {
  interrupt?: () => void
  close?: () => void
}

export type InternalQuery = Query

export type ListSessionsOptions = {
  dir?: string
  limit?: number
  offset?: number
}

export type GetSessionInfoOptions = { dir?: string }
export type SessionMutationOptions = { dir?: string }

export type ForkSessionOptions = {
  dir?: string
  upToMessageId?: string
  title?: string
}

export type ForkSessionResult = { sessionId: string }

export type GetSessionMessagesOptions = {
  dir?: string
  limit?: number
  offset?: number
  includeSystemMessages?: boolean
}

export type SessionMessage = {
  type: string
  uuid?: string
  parentUuid?: string | null
  [key: string]: unknown
}

export type SDKSessionOptions = {
  model?: string
  [key: string]: unknown
}

export type SDKSession = {
  send(message: string | SDKUserMessage): Promise<void>
  close(): Promise<void>
  [key: string]: unknown
}
