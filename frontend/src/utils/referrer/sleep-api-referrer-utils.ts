import type { LocationQuery } from 'vue-router'

/** Query param appended when linking from legacy Sleep API static pages */
export const SLEEP_API_REFERRER_QUERY_KEY = 'referrer'

/** Accepted values match case-insensitively (e.g. sleepAPI, sleepapi). */
export const SLEEP_API_REFERRER_VALUE_NORMALIZED = 'sleepapi'

/** localStorage key: user chose "Don't show this again" for Sleep API referrer links */
export const SLEEP_API_SUPPRESS_MESSAGE_KEY = 'suppressSleepApiWelcomeMessage'

export function isSleepApiReferrerQuery(query: LocationQuery): boolean {
  const raw = query[SLEEP_API_REFERRER_QUERY_KEY]
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') {
    return false
  }
  return value.toLowerCase() === SLEEP_API_REFERRER_VALUE_NORMALIZED
}
