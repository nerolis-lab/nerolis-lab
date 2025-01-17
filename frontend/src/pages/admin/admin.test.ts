import AdminConsole from '@/pages/admin/admin.vue'
import { AdminService } from '@/services/admin/admin-service'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

vi.mock('@/services/admin/admin-service')

describe('AdminConsole.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof AdminConsole>>
  beforeEach(() => {
    setActivePinia(createPinia())

    AdminService.getUsers = vi.fn().mockImplementation(() => ({
      getUsers: vi.fn().mockResolvedValue({ users: [] })
    }))
  })

  beforeEach(() => {
    wrapper = mount(AdminConsole)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct title', () => {
    const title = wrapper.find('.v-card-title')
    expect(title.text()).toBe('User Management Console')
  })

  it('fetches users on mount', async () => {
    expect(AdminService.getUsers).toHaveBeenCalled()
  })

  it('displays the data table when not loading', async () => {
    expect(wrapper.findComponent({ name: 'VDataTable' }).exists()).toBe(true)
  })

  it('refreshes users when refresh button is clicked', async () => {
    const refreshButton = wrapper.find('button')
    await refreshButton.trigger('click')
    expect(AdminService.getUsers).toHaveBeenCalledTimes(2)
  })
})
