import AccountMenu from '@/components/account/account-menu.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { AuthProvider, commonMocks, Roles } from 'sleepapi-common'

import { clearCacheAndLogout } from '@/stores/store-service'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('vue3-google-login', () => ({
  GoogleLogin: {
    template: '<div></div>'
  },
  googleLogout: vi.fn(),
  decodeCredential: vi.fn()
}))

vi.mock('@/stores/store-service', () => ({
  clearCacheAndLogout: vi.fn()
}))

describe('AccountMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof AccountMenu>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.syncUserSettings = vi.fn().mockResolvedValue(undefined)

    wrapper = mount(AccountMenu)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('syncs user settings on mount', async () => {
    // Set tokens before mounting
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    wrapper = mount(AccountMenu)

    expect(userStore.syncUserSettings).toHaveBeenCalled()
  })

  it('clicking activator should open menu', async () => {
    expect(document.querySelector('#accountMenu')).toBeNull()

    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    await nextTick()
    await flushPromises()

    const menuContainer = document.querySelector('#accountMenu')
    expect(menuContainer).not.toBeNull()

    if (menuContainer) {
      const style = window.getComputedStyle(menuContainer)
      expect(style.display).not.toBe('none')
    }
  })

  it('renders correctly when logged in', async () => {
    expect(wrapper.find('.mdi-account-circle').exists()).toBe(true)

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse({ name: 'John Doe' }))

    await nextTick()
    await flushPromises()

    expect(wrapper.find('#navBarIcon').exists()).toBe(true)
    expect(wrapper.find('.mdi-account-circle').exists()).toBe(false)
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toContain('/images/avatar/default.png')

    const openMenuButton = wrapper.find('#navBarIcon')
    await openMenuButton.trigger('click')

    const menuContainer = document.querySelector('#accountMenu')
    expect(menuContainer).not.toBeNull()

    if (menuContainer) {
      const h6 = menuContainer.querySelector('h6')
      expect(h6).not.toBeNull()
      expect(h6!.textContent).toBe('John Doe')

      expect(menuContainer.querySelector('#logoutButton')).not.toBeNull()
      expect(menuContainer.querySelector('.mdi-logout')).not.toBeNull()
    }
  })

  it('resets user information when logged out', async () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(
      commonMocks.loginResponse({
        name: 'some name',
        externalId: 'some id',
        role: Roles.Default,
        auth: {
          activeProvider: AuthProvider.Google,
          linkedProviders: {
            [AuthProvider.Google]: {
              linked: true,
              identifier: 'some-email'
            },
            [AuthProvider.Discord]: {
              linked: false
            },
            [AuthProvider.Patreon]: {
              linked: false
            }
          },
          tokens: {
            accessToken: 'access token',
            refreshToken: 'refresh token',
            expiryDate: 10
          }
        }
      })
    )

    wrapper = mount(AccountMenu)

    expect(userStore.loggedIn).toBe(true)
    expect(userStore.auth).toMatchInlineSnapshot(`
      {
        "activeProvider": "google",
        "linkedProviders": {
          "discord": {
            "linked": false,
          },
          "google": {
            "identifier": "some-email",
            "linked": true,
          },
          "patreon": {
            "linked": false,
          },
        },
        "tokens": {
          "accessToken": "access token",
          "expiryDate": 10,
          "refreshToken": "refresh token",
        },
      }
    `)
    expect(userStore.name).toBe('some name')
    expect(userStore.externalId).toBe('some id')

    const openMenuButton = wrapper.find('#navBarIcon')
    await openMenuButton.trigger('click')

    const logoutButton = document.querySelector('#logoutButton')
    expect(logoutButton).not.toBeNull()
    ;(logoutButton as HTMLElement).click()

    expect(clearCacheAndLogout).toHaveBeenCalled()
  })
})
