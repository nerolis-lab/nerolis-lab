import 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLanguageStore } from './language-store'

const mockLocale = { value: 'en' }
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: mockLocale
  })
}))

const mockNavigator = {
  language: 'en-US'
}
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
})

Object.defineProperty(document.documentElement, 'lang', {
  writable: true,
  value: 'en'
})

describe('Language Store', () => {
  beforeEach(() => {
    mockLocale.value = 'en'
    document.documentElement.lang = 'en'
  })

  it('should initialize with default language', () => {
    const store = useLanguageStore()

    expect(store.currentLanguage).toBe('en')
    expect(store.hasManuallyChanged).toBe(false)
  })

  it('should auto-detect browser language on first initialization', () => {
    mockNavigator.language = 'ja-JP'
    const store = useLanguageStore()

    store.initializeLanguage()

    expect(store.currentLanguage).toBe('ja')
    expect(store.hasManuallyChanged).toBe(false)
  })

  it('should not auto-detect if user has manually changed language', () => {
    mockNavigator.language = 'ja-JP'
    const store = useLanguageStore()

    // Simulate manual change
    store.changeLanguage('en')
    expect(store.hasManuallyChanged).toBe(true)

    // Reset browser language
    mockNavigator.language = 'ja-JP'
    store.initializeLanguage()

    // Should stay English since user manually changed it
    expect(store.currentLanguage).toBe('en')
  })

  it('should fall back to English for unsupported browser languages', () => {
    mockNavigator.language = 'fr-FR'
    const store = useLanguageStore()

    store.initializeLanguage()

    expect(store.currentLanguage).toBe('en')
  })

  it('should change language and mark as manually changed', () => {
    const store = useLanguageStore()

    store.changeLanguage('ja')

    expect(store.currentLanguage).toBe('ja')
    expect(store.hasManuallyChanged).toBe(true)
    expect(document.documentElement.lang).toBe('ja')
  })

  it('should warn and not change to unsupported language', () => {
    const loggerSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const store = useLanguageStore()

    store.changeLanguage('fr')

    expect(store.currentLanguage).toBe('en') // Should remain unchanged
    expect(loggerSpy).toHaveBeenCalledWith("Language 'fr' is not supported")

    loggerSpy.mockRestore()
  })

  it('should detect browser language correctly', () => {
    mockNavigator.language = 'ja-JP'
    const store = useLanguageStore()

    expect(store.detectBrowserLanguage()).toBe('ja')

    mockNavigator.language = 'en-US'
    expect(store.detectBrowserLanguage()).toBe('en')
  })

  it('should check language support correctly', () => {
    const store = useLanguageStore()

    expect(store.isLanguageSupported('en')).toBe(true)
    expect(store.isLanguageSupported('ja')).toBe(true)
    expect(store.isLanguageSupported('fr')).toBe(false)
    expect(store.isLanguageSupported('es')).toBe(false)
  })

  it('should return correct current language data', () => {
    const store = useLanguageStore()

    store.currentLanguage = 'ja'
    const langData = store.currentLanguageData

    expect(langData.code).toBe('ja')
    expect(langData.name).toBe('Japanese')
    expect(langData.nativeName).toBe('日本語')
  })

  it('should return available languages', () => {
    const store = useLanguageStore()
    const languages = store.availableLanguages

    expect(languages).toHaveLength(2)
    expect(languages[0]).toEqual({
      code: 'en',
      name: 'English',
      nativeName: 'English'
    })
    expect(languages[1]).toEqual({
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語'
    })
  })
})
