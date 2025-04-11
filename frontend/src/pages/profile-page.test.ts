import ProfilePage from '@/pages/profile-page.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { Roles } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ProfilePage', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProfilePage>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    wrapper = mount(ProfilePage)
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays profile header', () => {
    const header = wrapper.find('.text-h4')
    expect(header.exists()).toBe(true)
    expect(header.text()).toBe('Profile')
  })

  it('displays user externalId correctly', () => {
    userStore.externalId = "Abunzu's external id"
    wrapper = mount(ProfilePage)
    const externalId = wrapper.findAll('.text-center').find((el) => el.text() === "Abunzu's external id")
    expect(externalId).toBeDefined()
  })

  describe('Supporter Status', () => {
    it('displays inactive supporter status for non-supporters', () => {
      const statusText = wrapper.findAll('.text-center').find((el) => el.text() === 'Inactive')
      expect(statusText?.classes()).toContain('text-grey')
      expect(wrapper.find('.supporter-card').exists()).toBe(false)
      expect(wrapper.find('.text-supporter').exists()).toBe(false)
    })

    describe('when user is a supporter', () => {
      beforeEach(async () => {
        userStore.role = Roles.Supporter
        userStore.supporterSince = '2024-01-01'

        wrapper = mount(ProfilePage)
      })

      it('displays active supporter status', () => {
        const statusText = wrapper.findAll('.text-center').find((el) => el.text() === 'Active')
        expect(statusText?.classes()).toContain('text-supporter')
      })

      it('displays supporter since date', () => {
        const supporterSince = wrapper.findAll('.text-center').find((el) => el.text() === '2024-01-01')
        expect(supporterSince?.classes()).toContain('text-supporter')
      })

      it('applies supporter styling to the card', () => {
        expect(wrapper.find('.supporter-card').exists()).toBe(true)
      })

      it('displays thank you message', () => {
        const thankYouMessage = wrapper.find('.font-weight-bold.text-supporter')
        expect(thankYouMessage.exists()).toBe(true)
        expect(thankYouMessage.text()).toBe('Thank you for your support!')
      })
    })
  })
})
