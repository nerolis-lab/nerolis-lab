import { describe, expect, it } from 'vitest'
import type { LocationQuery } from 'vue-router'

import { SLEEP_API_REFERRER_QUERY_KEY, isSleepApiReferrerQuery } from '@/utils/referrer/sleep-api-referrer-utils'

describe('sleep-api-referrer-utils', () => {
  it('returns true for sleepAPI referrer case variants', () => {
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: 'sleepAPI' } as LocationQuery)).toBe(true)
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: 'sleepapi' } as LocationQuery)).toBe(true)
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: 'SLEEPAPI' } as LocationQuery)).toBe(true)
  })

  it('returns false for missing or wrong referrer', () => {
    expect(isSleepApiReferrerQuery({})).toBe(false)
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: 'other' } as LocationQuery)).toBe(false)
  })

  it('returns false when referrer is an empty string', () => {
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: '' } as LocationQuery)).toBe(false)
  })

  it('uses first value when referrer is duplicated in query', () => {
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: ['sleepapi', 'x'] } as LocationQuery)).toBe(true)
    expect(isSleepApiReferrerQuery({ [SLEEP_API_REFERRER_QUERY_KEY]: ['nope'] } as LocationQuery)).toBe(false)
  })
})
