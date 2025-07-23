import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import 'vuetify/styles'

import App from '@/app.vue'
import { darkTheme } from '@/assets/theme'
import router from '@/router/router'

import { registerChartJS } from '@/components/custom-components/charts/register-charts'
import { migrateSite } from '@/stores/store-service'
import { locales, type Translation } from 'sleepapi-common'
import { createI18n } from 'vue-i18n'

async function initializeApp() {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  const app = createApp(App)
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'darkTheme',
      themes: {
        darkTheme
      }
    },
    components: {
      VTimePicker
    }
  })

  app.use(pinia)
  try {
    await migrateSite()
  } catch (error) {
    logger.error('Migration failed during startup. Application might be in an inconsistent state. ' + error)
  }
  registerChartJS()

  const i18n = createI18n<[Translation], 'en'>({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: locales,
    globalInjection: true
  })

  app.use(vuetify)
  app.use(i18n)
  app.use(router)

  app.mount('#app')
}

initializeApp()
