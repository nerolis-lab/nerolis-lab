import router from '@/router/router'
import { GOOGLE_REDIRECT_URI } from '@/services/login/google-service'
import { useUserStore } from '@/stores/user-store'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { Logger } from 'sleepapi-common'
import { AuthProvider } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouter } from 'vue-router'
import GooglePage from './google-page.vue'

vi.mock('vue-router')

vi.mocked(useRouter).mockReturnValue({
  ...router,
  push: vi.fn()
})

describe('GooglePage', () => {
  let wrapper: VueWrapper<InstanceType<typeof GooglePage>>
  let userStore: ReturnType<typeof useUserStore>

  const mountComponent = (query = {}) => {
    return mount(GooglePage, {
      props: {
        originalRoute: '/calculator'
      },
      global: {
        mocks: {
          $route: {
            query
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter().push).mockReset()
    userStore = useUserStore()
    userStore.login = vi.fn()
    userStore.logout = vi.fn()
    global.logger = {
      debug: vi.fn(),
      error: vi.fn()
    } as unknown as Logger
  })

  it('should display loading message', () => {
    wrapper = mountComponent()

    expect(wrapper.text()).toContain('Logging in with Google...')
    expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
  })

  it('should redirect to home if error is present in query', async () => {
    wrapper = mountComponent({ error: 'access_denied' })

    expect(global.logger.error).toHaveBeenCalledWith('Google authentication error: access_denied')
    expect(useRouter().push).toHaveBeenCalledWith('/')
  })

  it('should redirect to home if no code is present', async () => {
    wrapper = mountComponent({})

    expect(global.logger.error).toHaveBeenCalledWith('No Google authorization code provided')
    expect(useRouter().push).toHaveBeenCalledWith('/')
  })

  it('should attempt login with correct parameters when code is present', async () => {
    wrapper = mountComponent({ code: 'test-auth-code' })

    expect(userStore.login).toHaveBeenCalledWith({
      authCode: 'test-auth-code',
      provider: AuthProvider.Google,
      originalRoute: '/calculator',
      redirectUri: GOOGLE_REDIRECT_URI
    })
  })

  it('should handle login failure correctly', async () => {
    userStore.login = vi.fn().mockImplementation(() => {
      throw new Error('Login failed')
    })
    wrapper = mountComponent({ code: 'test-auth-code' })

    expect(userStore.logout).toHaveBeenCalled()
    expect(useRouter().push).toHaveBeenCalledWith('/')
  })
})
