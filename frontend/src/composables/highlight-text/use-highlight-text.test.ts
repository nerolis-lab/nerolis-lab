import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { describe, expect, it, vi } from 'vitest'

describe('useHighlightText', () => {
  it('should select the text of the input element on focus', () => {
    const { highlightText } = useHighlightText()
    const mockEvent = {
      target: {
        select: vi.fn()
      }
    } as unknown as FocusEvent

    highlightText(mockEvent)

    setTimeout(() => {
      if (mockEvent.target) {
        expect((mockEvent.target as HTMLInputElement).select).toHaveBeenCalled()
      }
    }, 1)
  })
})
