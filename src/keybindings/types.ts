export type KeybindingContextName =
  | 'Global'
  | 'Chat'
  | 'Autocomplete'
  | 'Confirmation'
  | 'Help'
  | 'Transcript'
  | 'HistorySearch'
  | 'Task'
  | 'ThemePicker'
  | 'Settings'
  | 'Tabs'
  | 'Attachments'
  | 'Footer'
  | 'MessageSelector'
  | 'MessageActions'
  | 'DiffDialog'
  | 'ModelPicker'
  | 'Select'
  | 'Plugin'
  | 'Scroll'

export type KeybindingAction = string | null

export type KeybindingBlock = {
  context: KeybindingContextName
  bindings: Record<string, KeybindingAction>
}

export type ParsedKeystroke = {
  key: string
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  super: boolean
}

export type Chord = ParsedKeystroke[]

export type ParsedBinding = {
  chord: Chord
  action: KeybindingAction
  context: KeybindingContextName
}
