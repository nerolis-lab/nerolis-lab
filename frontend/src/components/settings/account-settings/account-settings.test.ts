import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AccountActions from './account-actions.vue'
import AccountInfo from './account-info.vue'
import AccountSettings from './account-settings.vue'
import LinkedProviders from './linked-providers.vue'

describe('AccountSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof AccountSettings>>
  let userStore: ReturnType<typeof useUserStore>

  describe('when user is logged out', () => {
    beforeEach(() => {
      userStore = useUserStore()
      userStore.auth = null

      wrapper = mount(AccountSettings)
    })

    it('displays login message when user is not logged in', () => {
      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)

      const title = card.find('.v-card-title')
      expect(title.text()).toContain('Account Settings')

      const message = card.find('p')
      expect(message.text()).toBe('Please log in to access your account settings.')
    })

    it('does not render account management components when logged out', () => {
      expect(wrapper.findComponent(AccountInfo).exists()).toBe(false)
      expect(wrapper.findComponent(LinkedProviders).exists()).toBe(false)
      expect(wrapper.findComponent(AccountActions).exists()).toBe(false)
    })
  })

  describe('when user is logged in', () => {
    beforeEach(() => {
      userStore = useUserStore()
      userStore.auth = mocks.loginResponse().auth

      wrapper = mount(AccountSettings)
    })

    it('renders the components container', () => {
      expect(wrapper.find('.components-container').exists()).toBe(true)
    })

    it('renders all account management components when logged in', () => {
      expect(wrapper.findComponent(AccountInfo).exists()).toBe(true)
      expect(wrapper.findComponent(LinkedProviders).exists()).toBe(true)
      expect(wrapper.findComponent(AccountActions).exists()).toBe(true)
    })
  })
})
