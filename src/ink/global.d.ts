import type React from 'react'
import type { DOMElement } from './dom.js'
import type { ClickEvent } from './events/click-event.js'
import type { FocusEvent } from './events/focus-event.js'
import type { KeyboardEvent } from './events/keyboard-event.js'
import type { Styles, TextStyles } from './styles.js'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ink-box': {
        children?: React.ReactNode
        ref?: React.Ref<DOMElement>
        style?: Styles
        tabIndex?: number
        autoFocus?: boolean
        onClick?: (event: ClickEvent) => void
        onFocus?: (event: FocusEvent) => void
        onFocusCapture?: (event: FocusEvent) => void
        onBlur?: (event: FocusEvent) => void
        onBlurCapture?: (event: FocusEvent) => void
        onKeyDown?: (event: KeyboardEvent) => void
        onKeyDownCapture?: (event: KeyboardEvent) => void
        onMouseEnter?: () => void
        onMouseLeave?: () => void
      }

      'ink-text': {
        children?: React.ReactNode
        style?: Styles
        textStyles?: TextStyles
      }

      'ink-link': {
        children?: React.ReactNode
        href: string
      }

      'ink-raw-ansi': {
        rawText: string
        rawWidth: number
        rawHeight: number
      }
    }
  }
}

export {}
