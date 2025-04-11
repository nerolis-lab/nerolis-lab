import { TimeUtils } from '@/services/utils/time-utils'
import type { Time } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

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

describe('prettifyTime', () => {
  it('shall format Time to hh:mm:ss', () => {
    const time: Time = { hour: 1, minute: 1, second: 1 }
    expect(TimeUtils.prettifyTime(time)).toBe('01:01:01')
  })

  it('shall format correctly if hours 0', () => {
    const time: Time = { hour: 0, minute: 1, second: 1 }
    expect(TimeUtils.prettifyTime(time)).toBe('00:01:01')
  })

  it('shall format correctly if minutes 0', () => {
    const time: Time = { hour: 0, minute: 0, second: 1 }
    expect(TimeUtils.prettifyTime(time)).toBe('00:00:01')
  })

  it('shall format correctly if only minutes 0', () => {
    const time: Time = { hour: 1, minute: 0, second: 1 }
    expect(TimeUtils.prettifyTime(time)).toBe('01:00:01')
  })

  it('shall format correctly if 0', () => {
    const time: Time = { hour: 0, minute: 0, second: 0 }
    expect(TimeUtils.prettifyTime(time)).toBe('00:00:00')
  })
})

describe('sleepScore', () => {
  it('calculates sleep score correctly for 8 hours', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '06:00'
      })
    ).toBe(94) // 8 hours of sleep
  })

  it('calculates sleep score correctly for 4 hours and 15 minutes', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '02:15'
      })
    ).toBe(50) // 4 hours and 15 minutes of sleep
  })

  it('calculates sleep score correctly for full night', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '06:30'
      })
    ).toBe(100) // 8.5 hours of sleep
  })

  it('calulcates sleep score for sleepless night', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '22:00'
      })
    ).toBe(0) // no sleep
  })

  it('caps sleep score at 100', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '10:00'
      })
    ).toBe(100) // 12 hours of sleep
  })

  it('calculates sleep score correctly for 1 hour and 15 minutes', () => {
    expect(
      Math.round(
        TimeUtils.sleepScore({
          bedtime: '22:00',
          wakeup: '23:15'
        })
      )
    ).toBe(15) // 1 hour and 15 minutes of sleep
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
  it('formats 8 hours correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '06:00'
      })
    ).toBe('8 hours')
  })

  it('formats 4 hours and 15 minutes correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '02:15'
      })
    ).toBe('4 hours and 15 minutes')
  })

  it('formats 8 hours and 30 minutes correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '06:30'
      })
    ).toBe('8 hours and 30 minutes')
  })

  it('formats no sleep correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '22:00'
      })
    ).toBe('0 minutes')
  })

  it('formats long sleep correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '10:00'
      })
    ).toBe('12 hours')
  })

  it('formats 1 hour and 15 minutes correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '23:15'
      })
    ).toBe('1 hour and 15 minutes')
  })

  it('handles crossing midnight correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '23:30',
        wakeup: '00:15'
      })
    ).toBe('45 minutes')
  })

  it('formats single hour correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '23:00'
      })
    ).toBe('1 hour')
  })

  it('formats single minute correctly', () => {
    expect(
      TimeUtils.calculateSleepDuration({
        bedtime: '22:00',
        wakeup: '22:01'
      })
    ).toBe('1 minute')
  })
})
