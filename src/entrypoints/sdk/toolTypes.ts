/** Tool type stand-in for SDK builders (missing from dump). */
export type SdkToolDefinition = {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}
