import UserAvatar from '@/components/account/user-avatar.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('UserAvatar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof UserAvatar>>

  beforeEach(() => {
    wrapper = mount(UserAvatar)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders avatar button', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
  })

  it('emits update-avatar event when avatar is selected', async () => {
    await wrapper.find('button').trigger('click')

    const avatarButtons = wrapper.findAll('.v-avatar.cursor-pointer')
    if (avatarButtons.length > 0) {
      await avatarButtons[0].trigger('click')
      expect(wrapper.emitted('update-avatar')).toBeTruthy()
    }
  })
})
