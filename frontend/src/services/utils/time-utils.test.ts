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
  it('calculates sleep score correctly', () => {
    expect(
      TimeUtils.sleepScore({
        bedtime: '22:00',
        wakeup: '06:00'
      })
    ).toBe(94) // 8 hours of sleep
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
