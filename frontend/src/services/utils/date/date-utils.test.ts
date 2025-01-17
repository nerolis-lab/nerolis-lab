import { describe, expect, it } from 'vitest'
import { DateUtils } from './date-utils'

describe('DateUtils', () => {
  it('should format date correctly', () => {
    const dateString = '2023-10-05T14:48:00.000Z'
    const formattedDate = DateUtils.formatDate(dateString)
    expect(formattedDate).toBe('10/05/2023, 14:48:00')
  })

  it('should handle invalid date string', () => {
    const dateString = 'invalid-date'
    expect(() => DateUtils.formatDate(dateString)).toThrow(RangeError)
  })
})
