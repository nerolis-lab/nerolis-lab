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
      'primary-200': '#ffedeb',
      'primary-300': '#ffb3b1',
      'primary-400': '#f87c7e',
      'primary-500': '#e63946', //main, formerly "primary"
      'primary-600': '#bb152c',
      'primary-700': '#92001c',
      'primary-800': '#54000c',
      'primary-900': '#2c0003',

      'secondary-200': '#fff5e5',
      'secondary-300': '#ffdd94',
      'secondary-400': '#ffca57',
      'secondary-500': '#ffb81f', //main, formerly "strength"
      'secondary-600': '#e09f00',
      'secondary-700': '#9d6e00',
      'secondary-800': '#5f4100',
      'secondary-900': '#422c00',

      'neutral-100': '#fafaff', //a good white for text on dark
      'neutral-200': '#ebeaf5',
      'neutral-300': '#cfceda',
      'neutral-400': '#a5a2b7',
      'neutral-500': '#817d95',
      'neutral-600': '#5e5a7f', //formerly "secondary"
      'neutral-700': '#403d58', //formerly "surface"
      'neutral-800': '#231a33',
      'neutral-900': '#191224', //formerly "background"
      'neutral-990': '#0e0e10', //a good black for text on light

      'error-200': '#ffefe5',
      'error-300': '#ffd3b6',
      'error-400': '#ffb688',
      'error-500': '#ff8e39', //good contrast on neutral-600+
      'error-600': '#c96304',
      'error-700': '#bd5c00',

      'skill-500': '#efd269',

      'berry-400': '#daccf5', //formerly "berry-light"
      'berry-500': '#b9a0e9', //main, formerly "berry"
      'berry-600': '#a986ea', //formerly "berry-dark"

      'salad-500': '#bcda62', //formerly "salad"
      'salad-600': '#99c418', //formerly "salad-dark"

      'dessert-500': '#fdb4ca', //main, formerly "dessert"
      'dessert-600': '#fe8bae', //formerly "dessert-dark"

      'curry-500': '#e7a888', //main, formerly "curry"
      'curry-600': '#f59261', //formerly "curry-dark"

      background: '#191224',
      primary: '#E63946',
      secondary: '#5E5A7F',
      'secondary-medium-dark': '#545072',
      'secondary-dark': '#4A4765',
      surface: '#403D58',
      accent: '#9A95C3',
      strength: '#FFB81F',

      'role-admin': '#E63946',
      'role-supporter': '#FFB81F',
      'role-default': '#FAFAFF',

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

      energy: '#31e571',
      help: '#ffbd2f',

      erb: '#499fff',
      hb: '#ffdf2e',

      day: '#FF9D45',
      night: '#4896FF',

      'pretty-purple': '#9771e0'
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
