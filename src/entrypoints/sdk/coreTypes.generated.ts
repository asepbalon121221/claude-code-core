/**
 * Generated-type stand-in: infer public SDK types from Zod schemas.
 * (Original coreTypes.generated.ts was not present in the source dump.)
 */
import type { z } from 'zod/v4'
import * as schemas from './coreSchemas.js'

type InferSchema<T> = T extends () => z.ZodType<infer O> ? O : never

type SchemaMap = typeof schemas

type SchemaName = {
  [K in keyof SchemaMap]: K extends `${infer Name}Schema` ? Name : never
}[keyof SchemaMap]

export type ModelUsage = InferSchema<SchemaMap['ModelUsageSchema']>
export type OutputFormat = InferSchema<SchemaMap['OutputFormatSchema']>
export type ApiKeySource = InferSchema<SchemaMap['ApiKeySourceSchema']>
export type ConfigScope = InferSchema<SchemaMap['ConfigScopeSchema']>
export type SdkBeta = InferSchema<SchemaMap['SdkBetaSchema']>
export type ThinkingConfig = InferSchema<SchemaMap['ThinkingConfigSchema']>
export type PermissionMode = InferSchema<SchemaMap['PermissionModeSchema']>
export type PermissionResult = InferSchema<SchemaMap['PermissionResultSchema']>
export type HookEvent = InferSchema<SchemaMap['HookEventSchema']>
export type HookInput = InferSchema<SchemaMap['HookInputSchema']>
export type HookJSONOutput = InferSchema<SchemaMap['HookJSONOutputSchema']>
export type ExitReason = InferSchema<SchemaMap['ExitReasonSchema']>
export type SDKPartialAssistantMessage = InferSchema<
  SchemaMap['SDKPartialAssistantMessageSchema']
>
export type SDKMessage = InferSchema<SchemaMap['SDKMessageSchema']>
export type SDKResultMessage = InferSchema<SchemaMap['SDKResultMessageSchema']>
export type SDKUserMessage = InferSchema<SchemaMap['SDKUserMessageSchema']>
export type SDKSessionInfo = InferSchema<SchemaMap['SDKSessionInfoSchema']>

// Catch-all for remaining schema-derived names used across the tree.
export type AnySdkSchemaType = {
  [K in SchemaName]: K extends keyof never ? never : unknown
}

// Allow `export *` consumers to resolve arbitrary generated names as unknown.
export type {
  SchemaName,
}
