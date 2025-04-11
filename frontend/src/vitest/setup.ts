import router from '@/router/router'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ResizeObserver from 'resize-observer-polyfill'
import { beforeEach } from 'vitest'
import 'vitest-canvas-mock'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import 'vuetify/styles'

const vuetify = createVuetify({
  components: { ...components, VTimePicker },
  directives
})

config.global.plugins.push(vuetify, router)

config.global.stubs = {
  RouterView: true,
  RouterLink: true
}

global.ResizeObserver = ResizeObserver

beforeEach(() => {
  setActivePinia(createPinia())
})
