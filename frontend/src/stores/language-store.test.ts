import { i18n } from '@/i18n'
import { useLanguageStore } from '@/stores/language-store'
import 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function setBrowserLanguage(language: string) {
  Object.defineProperty(navigator, 'language', { value: language, configurable: true })
}

describe('Language Store', () => {
  beforeEach(() => {
    setBrowserLanguage('en-US')
  })

  it('defaults to English with no persisted choice', () => {
    const store = useLanguageStore()

    expect(store.currentLanguage).toBe('en')
    expect(store.hasManuallyChanged).toBe(false)
  })

  it('auto-detects a supported browser language on a fresh session (no cached choice)', () => {
    setBrowserLanguage('ja-JP')
    const store = useLanguageStore()

    store.initializeLanguage()

    expect(store.currentLanguage).toBe('ja')
    expect(store.hasManuallyChanged).toBe(false)
    // number/date formatting must follow the same detected locale as the UI text
    expect(i18n.global.locale.value).toBe('ja')
  })

  it('falls back to English for an unsupported browser language', () => {
    setBrowserLanguage('fr-FR')
    const store = useLanguageStore()

    store.initializeLanguage()

    expect(store.currentLanguage).toBe('en')
    expect(i18n.global.locale.value).toBe('en')
  })

  it('does not override a manual choice on re-initialization', () => {
    const store = useLanguageStore()
    store.changeLanguage('en')
    expect(store.hasManuallyChanged).toBe(true)

    setBrowserLanguage('ja-JP')
    store.initializeLanguage()

    expect(store.currentLanguage).toBe('en')
  })

  it('changes language, marks it manual, and updates i18n locale + document lang', () => {
    const store = useLanguageStore()

    store.changeLanguage('ja')

    expect(store.currentLanguage).toBe('ja')
    expect(store.hasManuallyChanged).toBe(true)
    expect(i18n.global.locale.value).toBe('ja')
    expect(document.documentElement.lang).toBe('ja')
  })

  it('warns and ignores an unsupported language code', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
    const store = useLanguageStore()

    store.changeLanguage('fr')

    expect(store.currentLanguage).toBe('en')
    expect(warnSpy).toHaveBeenCalledWith("Language 'fr' is not supported")

    warnSpy.mockRestore()
  })

  it('exposes the available languages', () => {
    const store = useLanguageStore()

    expect(store.availableLanguages).toEqual([
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' }
    ])
  })

  it('returns the current language data', () => {
    const store = useLanguageStore()
    store.changeLanguage('ja')

    expect(store.currentLanguageData).toEqual({ code: 'ja', name: 'Japanese', nativeName: '日本語' })
  })
})
