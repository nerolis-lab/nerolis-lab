import UserName from '@/components/account/user-name.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('UserName.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof UserName>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()

    userStore.name = 'John Doe'
    Object.defineProperty(userStore, 'loggedIn', { value: true, writable: true })

    wrapper = mount(UserName)
  })

  it('renders user name button', () => {
    expect(wrapper.find('button').text()).toContain(userStore.name)
  })

  it('opens edit dialog on button click', async () => {
    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isEditDialogOpen).toBe(true)
  })

  it('emits update-name event with edited name', async () => {
    await wrapper.setData({ editedName: 'Jane Doe' })
    await wrapper.vm.saveEditDialog()
    expect(wrapper.emitted('update-name')![0]).toEqual(['Jane Doe'])
  })
})
