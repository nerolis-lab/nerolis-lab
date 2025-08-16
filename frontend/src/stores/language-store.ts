import { defineStore } from 'pinia'
import 'sleepapi-common'

export interface LanguageState {
  currentLanguage: string
  hasManuallyChanged: boolean
}

const availableLanguages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語'
  }
]

export const useLanguageStore = defineStore('language', {
  state: (): LanguageState => {
    return {
      currentLanguage: 'en', // Default fallback
      hasManuallyChanged: false
    }
  },
  getters: {
    availableLanguages: () => availableLanguages,
    currentLanguageData: (state) => {
      return availableLanguages.find((lang) => lang.code === state.currentLanguage) || availableLanguages[0]
    }
  },
  actions: {
    initializeLanguage() {
      // Only auto-detect if user hasn't manually changed language before
      if (!this.hasManuallyChanged) {
        const browserLanguage = this.detectBrowserLanguage()
        if (browserLanguage && this.isLanguageSupported(browserLanguage)) {
          this.currentLanguage = browserLanguage
        }
      }

      // Update document language attribute for accessibility
      document.documentElement.lang = this.currentLanguage
    },
    detectBrowserLanguage(): string | undefined {
      // Get browser language, strip region (e.g., 'en-US' -> 'en')
      const browserLang = navigator.language?.split('-').at(0)
      return browserLang
    },
    isLanguageSupported(languageCode: string): boolean {
      return this.availableLanguages.some((lang) => lang.code === languageCode)
    },
    changeLanguage(languageCode: string) {
      if (!this.isLanguageSupported(languageCode)) {
        logger.warn(`Language '${languageCode}' is not supported`)
        return
      }

      this.currentLanguage = languageCode
      this.hasManuallyChanged = true

      // Update document language attribute for accessibility
      document.documentElement.lang = languageCode
    }
  },
  persist: true
})
