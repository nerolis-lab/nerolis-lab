import { getDiffDisplayInfo } from '@/services/utils/ui-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vuetify', () => ({
  useTheme: vi.fn(() => ({
    current: {
      value: {
        colors: {
          strength: '#9C27B0',
          success: '#4CAF50',
          'error-3': '#F44336',
          secondary: '#757575'
        }
      }
    }
  }))
}))

describe('getDiffDisplayInfo', () => {
  it('should return empty text and strength color for undefined diff', () => {
    const result = getDiffDisplayInfo(undefined)

    expect(result.text).toBe('')
    expect(result.color).toBe('#9C27B0') // strength color
  })

  it('should return positive text with plus sign and success color for positive diff', () => {
    const result = getDiffDisplayInfo(5)

    expect(result.text).toBe('+5')
    expect(result.color).toBe('#4CAF50') // success color
  })

  it('should return positive text with plus sign for larger positive numbers', () => {
    const result = getDiffDisplayInfo(100)

    expect(result.text).toBe('+100')
    expect(result.color).toBe('#4CAF50') // success color
  })

  it('should return negative text without extra minus sign and error color for negative diff', () => {
    const result = getDiffDisplayInfo(-3)

    expect(result.text).toBe('-3')
    expect(result.color).toBe('#F44336') // error-3 color
  })

  it('should return negative text for larger negative numbers', () => {
    const result = getDiffDisplayInfo(-50)

    expect(result.text).toBe('-50')
    expect(result.color).toBe('#F44336') // error-3 color
  })

  it('should return "New" text and secondary color for zero diff', () => {
    const result = getDiffDisplayInfo(0)

    expect(result.text).toBe('New')
    expect(result.color).toBe('#757575') // secondary color
  })

  it('should handle decimal numbers correctly', () => {
    const positiveDecimal = getDiffDisplayInfo(2.5)
    expect(positiveDecimal.text).toBe('+2.5')
    expect(positiveDecimal.color).toBe('#4CAF50')

    const negativeDecimal = getDiffDisplayInfo(-1.7)
    expect(negativeDecimal.text).toBe('-1.7')
    expect(negativeDecimal.color).toBe('#F44336')
  })

  it('should return correct interface structure', () => {
    const result = getDiffDisplayInfo(1)

    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('color')
    expect(typeof result.text).toBe('string')
    expect(typeof result.color).toBe('string')
  })
})
