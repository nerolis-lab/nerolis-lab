import AccountMenu from '@/components/account/account-menu.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { Roles } from 'sleepapi-common'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('vue3-google-login', () => ({
  GoogleLogin: {
    template: '<div></div>'
  },
  googleLogout: vi.fn(),
  decodeCredential: vi.fn()
}))

describe('AccountMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof AccountMenu>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    setActivePinia(createPinia())
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
    await wrapper.vm.$nextTick()
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

    userStore.name = 'John Doe'
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: 10
    })

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

    userStore.setUserData({
      name: 'some name',
      email: 'some email',
      externalId: 'some id',
      role: Roles.Default
    })
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: 10
    })

    expect(wrapper.vm.userStore.loggedIn).toBe(true)
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
        "avatar": "default",
        "email": "some email",
        "externalId": "some id",
        "name": "some name",
        "potSize": 69,
        "role": "default",
        "tokens": {
          "accessToken": "access token",
          "expiryDate": 10,
          "refreshToken": "refresh token",
        },
      }
    `)

    const openMenuButton = wrapper.find('#navBarIcon')
    await openMenuButton.trigger('click')

    const logoutButton = document.querySelector('#logoutButton')
    expect(logoutButton).not.toBeNull()
    ;(logoutButton as HTMLElement).click()

    expect(wrapper.vm.userStore.loggedIn).toBe(false)
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "potSize": 69,
        "role": "default",
        "tokens": null,
      }
    `)
  })
})
