import { i18n, SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n'
import { defineStore } from 'pinia'

export interface LanguageOption {
  code: SupportedLocale
  name: string
  nativeName: string
}

export interface LanguageState {
  currentLanguage: SupportedLocale
  hasManuallyChanged: boolean
}

const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' }
]

export const useLanguageStore = defineStore('language', {
  state: (): LanguageState => ({
    currentLanguage: 'en',
    hasManuallyChanged: false
  }),
  getters: {
    availableLanguages: () => availableLanguages,
    currentLanguageData: (state): LanguageOption =>
      availableLanguages.find((language) => language.code === state.currentLanguage) ?? availableLanguages[0]
  },
  actions: {
    // called once on app startup; respects a previous manual choice
    initializeLanguage() {
      if (!this.hasManuallyChanged) {
        const detected = this.detectBrowserLanguage()
        if (detected) {
          this.currentLanguage = detected
        }
      }
      this.applyLocale()
    },
    detectBrowserLanguage(): SupportedLocale | undefined {
      const browserLanguage = navigator.language?.split('-').at(0)
      return browserLanguage && this.isLanguageSupported(browserLanguage)
        ? (browserLanguage as SupportedLocale)
        : undefined
    },
    isLanguageSupported(languageCode: string): boolean {
      return (SUPPORTED_LOCALES as string[]).includes(languageCode)
    },
    changeLanguage(languageCode: string) {
      if (!this.isLanguageSupported(languageCode)) {
        logger.warn(`Language '${languageCode}' is not supported`)
        return
      }

      this.currentLanguage = languageCode as SupportedLocale
      this.hasManuallyChanged = true
      this.applyLocale()
    },
    // keeps UI text and number/date formatting on the same locale
    applyLocale() {
      i18n.global.locale.value = this.currentLanguage
      document.documentElement.lang = this.currentLanguage
    }
  },
  persist: true
})
