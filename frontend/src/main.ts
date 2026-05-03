import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

import App from '@/app.vue'
import { darkTheme } from '@/assets/theme'
import router from '@/router/router'

import { registerChartJS } from '@/components/custom-components/charts/register-charts'
import { migrateSite } from '@/stores/store-service'

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
    display: {
      thresholds: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
        xxl: 2560
      }
    }
  })

  app.use(pinia)
  try {
    await migrateSite()
  } catch (error) {
    logger.error('Migration failed during startup. Application might be in an inconsistent state. ' + error)
  }
  registerChartJS()

  app.use(vuetify)
  app.use(router)

  app.mount('#app')
}

initializeApp()
