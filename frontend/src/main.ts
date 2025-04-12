import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import 'vuetify/styles'

import App from '@/app.vue'
import router from '@/router/router'

import { registerChartJS } from '@/components/custom-components/charts/register-charts'
import { migrateStores } from '@/stores/store-service'
import { type ThemeDefinition } from 'vuetify'

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

    natureUp: 'FF683A',
    natureDown: '2BA0ED',

    subskillWhite: '#FAFAFA',
    subskillSilver: '#DCF2FF',
    subskillGold: '#FFE570',

    curry: '#ff9f4b',
    'curry-dark': '#e66b00',
    salad: '#a8cf5c',
    'salad-dark': '#81b616',
    dessert: '#f2d95f',
    'dessert-dark': '#dbb700',

    ingredient: '#fbe346',
    berry: '#b297e7',
    'berry-light': '#d9ccf5',
    skill: '#ff616e',

    energy: '#31e571',
    help: '#ffbd2f',

    erb: '#499fff',
    hb: '#ffdf2e',

    day: '#FF9D45',
    night: '#4896FF',

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
migrateStores()
registerChartJS()

app.use(vuetify)
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: '849977224646-h959gvbile1kobn2gehe31o4m8lbm52m.apps.googleusercontent.com'
})

app.mount('#app')
