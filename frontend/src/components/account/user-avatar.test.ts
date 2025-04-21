import UserAvatar from '@/components/account/user-avatar.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('UserAvatar.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof UserAvatar>>

  beforeEach(() => {
    wrapper = mount(UserAvatar)
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('opens edit dialog on button click', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isEditDialogOpen).toBe(true)
  })
})
