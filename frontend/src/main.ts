import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import 'vuetify/styles'

import App from '@/app.vue'
import router from '@/router/router'

import { registerChartJS } from '@/components/custom-components/charts/register-charts'
import { migrateSite } from '@/stores/store-service'
import { type ThemeDefinition } from 'vuetify'

async function initializeApp() {
  // colors duplicated in colors.scss
  const darkTheme: ThemeDefinition = {
    dark: true,
    colors: {
      background: '#191224',
      primary: '#E63946',
      secondary: '#5E5A7F',
      'secondary-medium-dark': '#545072',
      'secondary-dark': '#4A4765',
      surface: '#403D58',
      accent: '#9A95C3',
      strength: '#FFB81F',

      admin: '#E63946',
      supporter: '#FFB81F',

      natureUp: 'FF683A',
      natureDown: '2BA0ED',

      subskillWhite: '#FAFAFA',
      subskillSilver: '#DCF2FF',
      subskillGold: '#FFE570',

      curry: '#E7A888',
      salad: '#BCDA62',
      dessert: '#FDB4CA',

      'curry-dark': '#F59261',
      'salad-dark': '#99C418',
      'dessert-dark': '#FE8BAE',

      ingredient: '#FDB4CA',
      berry: '#B9A0E9',
      'berry-light': '#DACCF5',
      skill: '#EFD269',
      all: '#ffffff',

      energy: '#31e571',
      help: '#ffbd2f',

      erb: '#499fff',
      hb: '#ffdf2e',

      day: '#FF9D45',
      night: '#4896FF',

      'pretty-purple': '#9771e0',

      'error-3': '#E97612',

      'on-background': '#ffffff',
      'on-surface': '#ffffff',
      'on-primary': '#ffffff',
      'on-secondary': '#ffffff'
    }
  }

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

  app.use(vuetify)
  app.use(router)

  app.mount('#app')
}

initializeApp()
