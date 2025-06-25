import AdminPage from '@/pages/admin/admin.vue'
import { AdminService } from '@/services/admin/admin-service'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/admin/admin-service')

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AdminPage.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof AdminPage>>

  beforeEach(() => {
    vi.clearAllMocks()
    AdminService.getUsers = vi.fn().mockResolvedValue({ users: [] })
    mockFetch.mockImplementation(() => new Promise(() => {}))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    wrapper = mount(AdminPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays all admin tabs', () => {
    wrapper = mount(AdminPage)
    const tabs = wrapper.findAll('.v-tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0].text()).toBe('Users')
    expect(tabs[1].text()).toBe('Announcements')
    expect(tabs[2].text()).toBe('Changelog')
  })

  it('displays users tab by default', () => {
    wrapper = mount(AdminPage)
    const userTableComponent = wrapper.findComponent({ name: 'UserTable' })
    expect(userTableComponent.exists()).toBe(true)
  })

  it('switches to announcements tab when clicked', async () => {
    wrapper = mount(AdminPage)
    const announcementsTab = wrapper.findAll('.v-tab')[1]
    await announcementsTab.trigger('click')

    await wrapper.vm.$nextTick()
    const announcementsComponent = wrapper.findComponent({ name: 'Announcements' })
    expect(announcementsComponent.exists()).toBe(true)
  })

  it('switches to changelog tab when clicked', async () => {
    wrapper = mount(AdminPage)
    const changelogTab = wrapper.findAll('.v-tab')[2]
    await changelogTab.trigger('click')

    await wrapper.vm.$nextTick()
    const changelogComponent = wrapper.findComponent({ name: 'Changelog' })
    expect(changelogComponent.exists()).toBe(true)
  })

  it('has correct tab model binding', () => {
    wrapper = mount(AdminPage)
    expect(wrapper.vm.adminTab).toBe('users')
  })

  it('exposes correct components in setup', () => {
    wrapper = mount(AdminPage)
    expect(wrapper.vm.UserTable).toBeDefined()
    expect(wrapper.vm.Announcements).toBeDefined()
    expect(wrapper.vm.Changelog).toBeDefined()
  })
})
