import type { z } from 'zod/v4'
import type * as S from './controlSchemas.js'

type Infer<T extends () => z.ZodType> = z.infer<ReturnType<T>>

export type SDKHookCallbackMatcher = Infer<
  typeof S.SDKHookCallbackMatcherSchema
>

export type SDKControlInitializeRequest = Infer<
  typeof S.SDKControlInitializeRequestSchema
>
export type SDKControlInitializeResponse = Infer<
  typeof S.SDKControlInitializeResponseSchema
>
export type SDKControlInterruptRequest = Infer<
  typeof S.SDKControlInterruptRequestSchema
>
export type SDKControlPermissionRequest = Infer<
  typeof S.SDKControlPermissionRequestSchema
>
export type SDKControlSetPermissionModeRequest = Infer<
  typeof S.SDKControlSetPermissionModeRequestSchema
>
export type SDKControlSetModelRequest = Infer<
  typeof S.SDKControlSetModelRequestSchema
>
export type SDKControlSetMaxThinkingTokensRequest = Infer<
  typeof S.SDKControlSetMaxThinkingTokensRequestSchema
>
export type SDKControlMcpStatusRequest = Infer<
  typeof S.SDKControlMcpStatusRequestSchema
>
export type SDKControlMcpStatusResponse = Infer<
  typeof S.SDKControlMcpStatusResponseSchema
>
export type SDKControlGetContextUsageRequest = Infer<
  typeof S.SDKControlGetContextUsageRequestSchema
>
export type SDKControlGetContextUsageResponse = Infer<
  typeof S.SDKControlGetContextUsageResponseSchema
>
export type SDKControlRewindFilesRequest = Infer<
  typeof S.SDKControlRewindFilesRequestSchema
>
export type SDKControlRewindFilesResponse = Infer<
  typeof S.SDKControlRewindFilesResponseSchema
>
export type SDKControlCancelAsyncMessageRequest = Infer<
  typeof S.SDKControlCancelAsyncMessageRequestSchema
>
export type SDKControlCancelAsyncMessageResponse = Infer<
  typeof S.SDKControlCancelAsyncMessageResponseSchema
>
export type SDKControlSeedReadStateRequest = Infer<
  typeof S.SDKControlSeedReadStateRequestSchema
>
export type SDKHookCallbackRequest = Infer<
  typeof S.SDKHookCallbackRequestSchema
>
export type SDKControlMcpMessageRequest = Infer<
  typeof S.SDKControlMcpMessageRequestSchema
>
export type SDKControlMcpSetServersRequest = Infer<
  typeof S.SDKControlMcpSetServersRequestSchema
>
export type SDKControlMcpSetServersResponse = Infer<
  typeof S.SDKControlMcpSetServersResponseSchema
>
export type SDKControlReloadPluginsRequest = Infer<
  typeof S.SDKControlReloadPluginsRequestSchema
>
export type SDKControlReloadPluginsResponse = Infer<
  typeof S.SDKControlReloadPluginsResponseSchema
>
export type SDKControlMcpReconnectRequest = Infer<
  typeof S.SDKControlMcpReconnectRequestSchema
>
export type SDKControlMcpToggleRequest = Infer<
  typeof S.SDKControlMcpToggleRequestSchema
>
export type SDKControlStopTaskRequest = Infer<
  typeof S.SDKControlStopTaskRequestSchema
>
export type SDKControlApplyFlagSettingsRequest = Infer<
  typeof S.SDKControlApplyFlagSettingsRequestSchema
>
export type SDKControlGetSettingsRequest = Infer<
  typeof S.SDKControlGetSettingsRequestSchema
>
export type SDKControlGetSettingsResponse = Infer<
  typeof S.SDKControlGetSettingsResponseSchema
>
export type SDKControlElicitationRequest = Infer<
  typeof S.SDKControlElicitationRequestSchema
>
export type SDKControlElicitationResponse = Infer<
  typeof S.SDKControlElicitationResponseSchema
>

export type SDKControlRequestInner = Infer<
  typeof S.SDKControlRequestInnerSchema
>
export type SDKControlRequest = Infer<typeof S.SDKControlRequestSchema>
export type SDKControlResponse = Infer<typeof S.SDKControlResponseSchema>
export type SDKControlCancelRequest = Infer<
  typeof S.SDKControlCancelRequestSchema
>
export type SDKKeepAliveMessage = Infer<typeof S.SDKKeepAliveMessageSchema>
export type SDKUpdateEnvironmentVariablesMessage = Infer<
  typeof S.SDKUpdateEnvironmentVariablesMessageSchema
>
export type StdoutMessage = Infer<typeof S.StdoutMessageSchema>
export type StdinMessage = Infer<typeof S.StdinMessageSchema>

export type { SDKPartialAssistantMessage } from './coreTypes.js'
