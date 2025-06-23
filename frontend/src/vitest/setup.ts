import { darkTheme } from '@/assets/theme'
import router from '@/router/router'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'
import { beforeEach } from 'vitest'
import 'vitest-canvas-mock'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import 'vuetify/styles'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'darkTheme',
    themes: {
      darkTheme
    }
  },
  components: { ...components, VTimePicker },
  directives
})

config.global.plugins.push(vuetify, router)

// Stub VImg component to avoid "window is not defined" error
const VImgStub = defineComponent({
  name: 'VImg',
  props: {
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    width: { type: [String, Number], default: null },
    height: { type: [String, Number], default: null },
    class: { type: String, default: '' }
  },
  render() {
    return h('img', this.$props)
  }
})

config.global.stubs = {
  VImg: VImgStub,
  RouterView: true,
  RouterLink: true
}

vi.stubGlobal('visualViewport', new EventTarget())

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
vi.stubGlobal('IntersectionObserver', intersectionObserverMock)

// Add missing window properties that components might need
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768
  })
}

global.ResizeObserver = ResizeObserver
global.requestAnimationFrame = vi.fn(() => 123)
global.cancelAnimationFrame = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.clearAllTimers()
  vi.clearAllMocks()
})
