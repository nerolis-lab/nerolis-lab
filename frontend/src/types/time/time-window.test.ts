import { describe, expect, it } from 'vitest'
import { timeWindowFactor, type TimeWindowWeek } from './time-window'

describe('timeWindowFactor', () => {
  it('returns 7 for WEEK time window', () => {
    expect(timeWindowFactor('WEEK')).toBe(7)
  })

  it('returns 1 for 24H time window', () => {
    expect(timeWindowFactor('24H')).toBe(1)
  })

  it('returns 1/3 for 8H time window', () => {
    expect(timeWindowFactor('8H')).toBe(1 / 3)
  })

  it('returns 1 for default case when invalid value is passed', () => {
    // @ts-expect-error - testing invalid input
    expect(timeWindowFactor('INVALID')).toBe(1)
  })

  it('handles all valid TimeWindowWeek values', () => {
    const validWindows: TimeWindowWeek[] = ['8H', '24H', 'WEEK']
    const expectedFactors = [1 / 3, 1, 7]

    validWindows.forEach((window, index) => {
      expect(timeWindowFactor(window)).toBe(expectedFactors[index])
    })
  })
})
