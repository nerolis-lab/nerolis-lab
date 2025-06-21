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

vi.stubGlobal('visualViewport', new EventTarget())

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
vi.stubGlobal('IntersectionObserver', intersectionObserverMock)

if (typeof window === 'undefined') {
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    location: { href: 'http://localhost:3000/' }
  })
}

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

  vi.mock('vuetify/components', async () => {
    const actual = await vi.importActual('vuetify/components')
    return {
      ...actual,
      VImg: { name: 'VImg', template: '<div class="v-img"><slot /></div>' }
    }
  })
})

afterEach(() => {
  vi.clearAllTimers()
  vi.clearAllMocks()
})
