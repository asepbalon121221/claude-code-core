import type { APIError } from '@anthropic-ai/sdk'
import type {
  BetaContentBlock,
  BetaMessage,
  BetaRawMessageStreamEvent,
} from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'
import type {
  ContentBlockParam,
  ToolUseBlock,
} from '@anthropic-ai/sdk/resources/messages.mjs'
import type { UUID } from 'crypto'
import type { Progress } from '../Tool.js'
import type { Attachment } from '../utils/attachments.js'
import type { PermissionMode } from './permissions.js'

export type MessageOrigin =
  | { kind: 'human' }
  | { kind: 'task-notification' }
  | { kind: 'coordinator' }
  | { kind: 'channel'; server: string }

export type PartialCompactDirection = 'from' | 'up_to'

export type CompactMetadata = {
  trigger: 'manual' | 'auto'
  preTokens: number
  userContext?: string
  messagesSummarized?: number
  preservedSegment?: {
    headUuid: string
    anchorUuid: string
    tailUuid: string
  }
}

export type MicrocompactMetadata = {
  trigger: 'auto'
  preTokens: number
  tokensSaved: number
  compactedToolIds: string[]
  clearedAttachmentUUIDs: string[]
}

type MessageBase = {
  uuid: UUID | string
  timestamp: string
  logicalParentUuid?: UUID | string
}

export type AssistantMessage = MessageBase & {
  type: 'assistant'
  message: BetaMessage
  requestId?: string
  apiError?: 'max_output_tokens'
  error?:
    | 'authentication_failed'
    | 'billing_error'
    | 'rate_limit'
    | 'invalid_request'
    | 'server_error'
    | 'unknown'
    | 'max_output_tokens'
  errorDetails?: string
  isApiErrorMessage?: boolean
  isVirtual?: true
}

export type UserMessage = MessageBase & {
  type: 'user'
  message: {
    role: 'user'
    content: string | ContentBlockParam[]
  }
  isMeta?: true
  isVisibleInTranscriptOnly?: true
  isVirtual?: true
  isCompactSummary?: true
  summarizeMetadata?: {
    messagesSummarized: number
    userContext?: string
    direction?: PartialCompactDirection
  }
  toolUseResult?: unknown
  mcpMeta?: {
    _meta?: Record<string, unknown>
    structuredContent?: Record<string, unknown>
  }
  imagePasteIds?: number[]
  sourceToolUseID?: string
  sourceToolAssistantUUID?: UUID
  permissionMode?: PermissionMode
  origin?: MessageOrigin
}

export type NormalizedAssistantMessage<
  T extends BetaContentBlock = BetaContentBlock,
> = Omit<AssistantMessage, 'message'> & {
  message: Omit<BetaMessage, 'content'> & { content: [T] }
}

export type NormalizedUserMessage<
  T extends ContentBlockParam = ContentBlockParam,
> = Omit<UserMessage, 'message'> & {
  message: { role: 'user'; content: [T] }
}

export type ProgressMessage<P extends Progress = Progress> = MessageBase & {
  type: 'progress'
  data: P
  toolUseID: string
  parentToolUseID: string
}

export type AttachmentMessage = MessageBase & {
  type: 'attachment'
  attachment: Attachment
}

export type HookResultMessage = AttachmentMessage

export type SystemMessageLevel = 'info' | 'warning' | 'error'

type SystemBase<S extends string> = MessageBase & {
  type: 'system'
  subtype: S
  isMeta?: boolean
  level?: SystemMessageLevel
  content?: string
  toolUseID?: string
}

export type SystemInformationalMessage = SystemBase<'informational'> & {
  content: string
  level: SystemMessageLevel
  preventContinuation?: boolean
}

export type SystemThinkingMessage = SystemBase<'thinking'> & {
  content?: string
}

export type SystemPermissionRetryMessage = SystemBase<'permission_retry'> & {
  content: string
  commands: string[]
  level: 'info'
}

export type SystemBridgeStatusMessage = SystemBase<'bridge_status'> & {
  content: string
  url: string
  upgradeNudge?: string
}

export type SystemScheduledTaskFireMessage =
  SystemBase<'scheduled_task_fire'> & {
    content: string
  }

export type StopHookInfo = {
  command: string
  promptText?: string
  durationMs?: number
}

export type SystemStopHookSummaryMessage = SystemBase<'stop_hook_summary'> & {
  hookCount: number
  hookInfos: StopHookInfo[]
  hookErrors: string[]
  preventedContinuation: boolean
  stopReason?: string
  hasOutput: boolean
  level: SystemMessageLevel
  hookLabel?: string
  totalDurationMs?: number
}

export type SystemTurnDurationMessage = SystemBase<'turn_duration'> & {
  durationMs: number
  budgetTokens?: number
  budgetLimit?: number
  budgetNudges?: number
  messageCount?: number
}

export type SystemAwaySummaryMessage = SystemBase<'away_summary'> & {
  content: string
}

export type SystemMemorySavedMessage = SystemBase<'memory_saved'> & {
  writtenPaths: string[]
}

export type SystemAgentsKilledMessage = SystemBase<'agents_killed'>

export type SystemApiMetricsMessage = SystemBase<'api_metrics'> & {
  ttftMs: number
  otps: number
  isP50?: boolean
  hookDurationMs?: number
  turnDurationMs?: number
  toolDurationMs?: number
  classifierDurationMs?: number
  toolCount?: number
  hookCount?: number
  classifierCount?: number
  configWriteCount?: number
}

export type SystemLocalCommandMessage = SystemBase<'local_command'> & {
  content: string
  level: 'info'
}

export type SystemCompactBoundaryMessage = SystemBase<'compact_boundary'> & {
  content: string
  level: 'info'
  compactMetadata: CompactMetadata
}

export type SystemMicrocompactBoundaryMessage =
  SystemBase<'microcompact_boundary'> & {
    content: string
    level: 'info'
    microcompactMetadata: MicrocompactMetadata
  }

export type SystemAPIErrorMessage = SystemBase<'api_error'> & {
  level: 'error'
  error: APIError
  cause?: Error
  retryInMs: number
  retryAttempt: number
  maxRetries: number
}

export type SystemMessage =
  | SystemInformationalMessage
  | SystemThinkingMessage
  | SystemPermissionRetryMessage
  | SystemBridgeStatusMessage
  | SystemScheduledTaskFireMessage
  | SystemStopHookSummaryMessage
  | SystemTurnDurationMessage
  | SystemAwaySummaryMessage
  | SystemMemorySavedMessage
  | SystemAgentsKilledMessage
  | SystemApiMetricsMessage
  | SystemLocalCommandMessage
  | SystemCompactBoundaryMessage
  | SystemMicrocompactBoundaryMessage
  | SystemAPIErrorMessage

export type Message =
  | AssistantMessage
  | UserMessage
  | ProgressMessage
  | AttachmentMessage
  | SystemMessage

export type NormalizedMessage =
  | NormalizedAssistantMessage
  | NormalizedUserMessage
  | ProgressMessage
  | AttachmentMessage
  | SystemMessage

export type GroupedToolUseMessage = MessageBase & {
  type: 'grouped_tool_use'
  toolName: string
  messages: NormalizedAssistantMessage[]
  results: NormalizedUserMessage[]
  displayMessage: NormalizedAssistantMessage
  messageId: string
}

export type CollapsibleMessage =
  | NormalizedAssistantMessage
  | NormalizedUserMessage
  | GroupedToolUseMessage

export type CollapsedReadSearchGroup = MessageBase & {
  type: 'collapsed_read_search'
  searchCount: number
  readCount: number
  listCount: number
  replCount: number
  memorySearchCount: number
  memoryReadCount: number
  memoryWriteCount: number
  teamMemorySearchCount?: number
  teamMemoryReadCount?: number
  teamMemoryWriteCount?: number
  readFilePaths: string[]
  searchArgs: string[]
  latestDisplayHint?: string
  messages: CollapsibleMessage[]
  displayMessage: CollapsibleMessage
  mcpCallCount?: number
  mcpServerNames?: string[]
  bashCount?: number
  gitOpBashCount?: number
  commits?: { sha: string; kind: string }[]
  pushes?: { branch: string }[]
  branches?: { ref: string; action: string }[]
  prs?: { number: number; url?: string; action: string }[]
  hookTotalMs?: number
  hookCount?: number
  hookInfos?: StopHookInfo[]
  relevantMemories?: { path: string; content: string; mtimeMs: number }[]
}

export type RenderableMessage =
  | NormalizedMessage
  | GroupedToolUseMessage
  | CollapsedReadSearchGroup

export type StreamEvent = {
  type: 'stream_event'
  event: BetaRawMessageStreamEvent
  ttftMs?: number
}

export type RequestStartEvent = {
  type: 'stream_request_start'
}

export type TombstoneMessage = {
  type: 'tombstone'
  message: AssistantMessage
}

export type ToolUseSummaryMessage = MessageBase & {
  type: 'tool_use_summary'
  summary: string
  precedingToolUseIds: string[]
}

export type ToolUseRequestMessage = NormalizedAssistantMessage<ToolUseBlock>
