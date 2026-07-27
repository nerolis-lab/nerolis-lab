import { SUPPORTED_LOCALES, type SupportedLocale } from 'sleepapi-common'
import { createI18n } from 'vue-i18n'

import en from '@/i18n/locales/en.json'
import ja from '@/i18n/locales/ja.json'

export type MessageSchema = typeof en
export { SUPPORTED_LOCALES, type SupportedLocale }

// integer strips decimals for displayed strength/production totals
const numberFormats = {
  en: { integer: { maximumFractionDigits: 0 } },
  ja: { integer: { maximumFractionDigits: 0 } }
}

const datetimeFormats = {
  en: {
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }
  },
  ja: {
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    }
  }
} as const

export const i18n = createI18n<MessageSchema, SupportedLocale, false>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  // ja is intentionally incomplete in places (e.g. nav.admin, some
  // profilepage strings) - those keys fall back to English at runtime via
  // fallbackLocale rather than being fabricated here; the schema cast below
  // just tells the compiler that's expected, it doesn't add missing keys.
  messages: { en, ja: ja as MessageSchema },
  numberFormats,
  datetimeFormats,
  globalInjection: true
})
