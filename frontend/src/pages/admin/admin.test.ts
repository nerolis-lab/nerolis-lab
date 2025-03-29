import AdminPage from '@/pages/admin/admin.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the imported components
vi.mock('@/components/admin/user-table/user-table.vue', () => ({
  default: {
    name: 'UserTable',
    template: '<div data-testid="user-table">User Table Component</div>'
  }
}))

vi.mock('@/components/admin/news-editor/announcements.vue', () => ({
  default: {
    name: 'Announcements',
    template: '<div data-testid="announcements">Announcements Component</div>'
  }
}))

describe('AdminPage.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof AdminPage>>

  beforeEach(() => {
    wrapper = mount(AdminPage)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.resetAllMocks()
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.v-container').exists()).toBe(true)
    expect(wrapper.find('.v-card.frosted-glass').exists()).toBe(true)
    expect(wrapper.find('.v-tabs.frosted-glass-light').exists()).toBe(true)
  })

  it('renders two tabs: Users and Announcements', () => {
    const tabs = wrapper.findAll('.v-tab')
    expect(tabs.length).toBe(2)
    expect(tabs[0].text()).toBe('Users')
    expect(tabs[1].text()).toBe('Announcements')
  })

  it('renders the UserTable component by default', async () => {
    expect(wrapper.vm.adminTab).toBe('users')

    const windowItems = wrapper.findAll('.v-window-item')
    expect(windowItems.length).toBe(2)

    expect(wrapper.find('[data-testid="user-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="announcements"]').exists()).toBe(false)
  })

  it('maintains consistent tab state when switching between tabs', async () => {
    const tabs = wrapper.findAll('.v-tab')

    // Initial state
    expect(wrapper.vm.adminTab).toBe('users')

    // Switch to Announcements
    await tabs[1].trigger('click')
    expect(wrapper.vm.adminTab).toBe('announcements')

    // Switch back to Users
    await tabs[0].trigger('click')
    expect(wrapper.vm.adminTab).toBe('users')

    // Switch to Announcements again
    await tabs[1].trigger('click')
    expect(wrapper.vm.adminTab).toBe('announcements')
  })
})
