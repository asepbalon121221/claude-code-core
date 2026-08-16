/** Tool progress payloads — reconstructed from call sites. */

export type ShellProgress = {
  type?: 'shell_progress'
  output: string
  fullOutput: string
  elapsedTimeSeconds: number
  totalLines: number
  totalBytes?: number
  timeoutMs?: number
  taskId?: string
  status?: string
}

export type BashProgress = ShellProgress & { type?: 'bash_progress' }
export type PowerShellProgress = ShellProgress & {
  type?: 'powershell_progress'
}

export type AgentToolProgress = {
  type?: 'agent_progress'
  agentId?: string
  message?: string
  toolUseID?: string
  [key: string]: unknown
}

export type MCPProgress = {
  type?: 'mcp_progress'
  serverName?: string
  toolName?: string
  message?: string
  [key: string]: unknown
}

export type REPLToolProgress = {
  type?: 'repl_progress'
  output?: string
  [key: string]: unknown
}

export type SkillToolProgress = {
  type?: 'skill_progress'
  skillName?: string
  message?: string
  [key: string]: unknown
}

export type TaskOutputProgress = {
  type?: 'task_output_progress'
  taskId?: string
  output?: string
  [key: string]: unknown
}

export type WebSearchProgress = {
  type?: 'web_search_progress'
  query?: string
  results?: unknown[]
  [key: string]: unknown
}

export type SdkWorkflowProgress = {
  type?: 'workflow_progress'
  workflowId?: string
  step?: string
  message?: string
  [key: string]: unknown
}

export type ToolProgressData =
  | AgentToolProgress
  | BashProgress
  | PowerShellProgress
  | MCPProgress
  | REPLToolProgress
  | SkillToolProgress
  | TaskOutputProgress
  | WebSearchProgress
  | ShellProgress
  | SdkWorkflowProgress
  | Record<string, unknown>
