import ProfilePage from '@/pages/profile-page.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockUserStoreData = {
  externalId: '12345',
  name: 'John Doe',
  avatar: 'avatar-url.jpg'
}

describe('ProfilePage', () => {
  let wrapper: VueWrapper<InstanceType<typeof ProfilePage>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    userStore = useUserStore()
    userStore.$patch(mockUserStoreData)
    wrapper = mount(ProfilePage)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
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
    const externalId = wrapper.findAll('.text-center').find((el) => el.text() === mockUserStoreData.externalId)
    expect(externalId).toBeDefined()
  })
})
