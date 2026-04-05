import { TimeUtils } from '@/services/utils/time-utils'
import { sleepDurationMinutesBetweenBedAndWake, sleepScoreFromBedAndWake } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sleepapi-common', async () => {
  const actual = await vi.importActual('sleepapi-common')
  return {
    ...actual,
    sleepScoreFromBedAndWake: vi.fn(),
    sleepDurationMinutesBetweenBedAndWake: vi.fn()
  }
})

describe('formatTime', () => {
  it('shall format seconds to hh:mm:ss', () => {
    expect(TimeUtils.formatTime(3661)).toBe('01:01:01')
  })

  it('shall format correctly if hours 0', () => {
    expect(TimeUtils.formatTime(3599)).toBe('00:59:59')
  })

  it('shall format correctly if minutes 0', () => {
    expect(TimeUtils.formatTime(59)).toBe('00:00:59')
  })

  it('shall format correctly if 0', () => {
    expect(TimeUtils.formatTime(0)).toBe('00:00:00')
  })
})

describe('sleepScore', () => {
  beforeEach(() => {
    vi.mocked(sleepScoreFromBedAndWake).mockReset()
  })

  it('delegates to sleepScoreFromBedAndWake from sleepapi-common', () => {
    vi.mocked(sleepScoreFromBedAndWake).mockReturnValue(94)
    const params = { bedtime: '22:00', wakeup: '06:00' }
    expect(TimeUtils.sleepScore(params)).toBe(94)
    expect(sleepScoreFromBedAndWake).toHaveBeenCalledWith(params)
  })
})

describe('prettifySeconds', () => {
  it('shall format seconds to hh:mm:ss', () => {
    expect(TimeUtils.prettifySeconds(3661)).toBe('01h 01m 01s')
  })

  it('shall format correctly if hours 0', () => {
    expect(TimeUtils.prettifySeconds(3599)).toBe('59m 59s')
  })

  it('shall format correctly if minutes 0', () => {
    expect(TimeUtils.prettifySeconds(59)).toBe('00m 59s')
  })

  it('shall format correctly if 0', () => {
    expect(TimeUtils.prettifySeconds(0)).toBe('00m 00s')
  })

  it('shall format correctly if only minutes 0', () => {
    expect(TimeUtils.prettifySeconds(3601)).toBe('01h 00m 01s')
  })
})

describe('calculateSleepDuration', () => {
  beforeEach(() => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReset()
  })

  it('formats 8 hours correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(480)
    const params = { bedtime: '22:00', wakeup: '06:00' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('8 hours')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats 4 hours and 15 minutes correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(255)
    const params = { bedtime: '22:00', wakeup: '02:15' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('4 hours and 15 minutes')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats 8 hours and 30 minutes correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(510)
    const params = { bedtime: '22:00', wakeup: '06:30' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('8 hours and 30 minutes')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats no sleep correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(0)
    const params = { bedtime: '22:00', wakeup: '22:00' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('0 minutes')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats long sleep correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(720)
    const params = { bedtime: '22:00', wakeup: '10:00' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('12 hours')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats 1 hour and 15 minutes correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(75)
    const params = { bedtime: '22:00', wakeup: '23:15' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('1 hour and 15 minutes')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('handles crossing midnight correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(45)
    const params = { bedtime: '23:30', wakeup: '00:15' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('45 minutes')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats single hour correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(60)
    const params = { bedtime: '22:00', wakeup: '23:00' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('1 hour')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })

  it('formats single minute correctly', () => {
    vi.mocked(sleepDurationMinutesBetweenBedAndWake).mockReturnValue(1)
    const params = { bedtime: '22:00', wakeup: '22:01' }
    expect(TimeUtils.calculateSleepDuration(params)).toBe('1 minute')
    expect(sleepDurationMinutesBetweenBedAndWake).toHaveBeenCalledWith(params)
  })
})

describe('extractDate', () => {
  const originalNavigator = global.navigator
  const mockISOString = '2024-04-15T19:13:55.579+00:00'

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true
    })
  })

  it('formats date using default en-US locale', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'en-US' },
      writable: true,
      configurable: true
    })

    const result = TimeUtils.extractDate(mockISOString)
    expect(result).toBe('April 15, 2024')
  })

  it('formats date using en-GB locale', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'en-GB' },
      writable: true,
      configurable: true
    })

    const result = TimeUtils.extractDate(mockISOString)
    expect(result).toBe('15 April 2024')
  })

  it('formats date using de-DE locale', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'de-DE' },
      writable: true,
      configurable: true
    })

    const result = TimeUtils.extractDate(mockISOString)
    expect(result).toBe('15. April 2024')
  })

  it('formats date using ja-JP locale', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'ja-JP' },
      writable: true,
      configurable: true
    })

    const result = TimeUtils.extractDate(mockISOString)
    expect(result).toBe('2024年4月15日')
  })

  it('falls back to en-US when navigator.language is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: undefined },
      writable: true,
      configurable: true
    })

    const result = TimeUtils.extractDate(mockISOString)
    expect(result).toBe('April 15, 2024')
  })
})
