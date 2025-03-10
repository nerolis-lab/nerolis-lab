import { clearCacheKeepLogin } from '@/stores/store-service'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsPage from './settings-page.vue'

vi.mock('@/stores/store-service', () => ({
  clearCacheKeepLogin: vi.fn()
}))

vi.mock('@/components/snackbar/snackbar.vue', () => ({
  success: vi.fn()
}))

vi.mock('@/services/login/google-service', () => ({
  GoogleService: {
    delete: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('SettingsPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof SettingsPage>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(SettingsPage)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders correctly with tabs', () => {
    expect(wrapper.exists()).toBe(true)

    // Check tabs
    const tabs = wrapper.findAll('.v-list-item')
    expect(tabs.length).toBe(3) // Game, Account, Site tabs

    // Verify tab text content
    const tabTexts = tabs.map((tab) => tab.text())
    expect(tabTexts).toContain('Game')
    expect(tabTexts).toContain('Account')
    expect(tabTexts).toContain('Site')

    // By default, the Game tab should be active
    expect(wrapper.vm.activeTab).toBe('game')
  })

  it('handles clear cache button click', async () => {
    // Switch to site tab
    await wrapper.setData({ activeTab: 'site' })

    // Find all buttons and find the clear cache button by text
    const clearButton = wrapper.findAll('button').find((button) => button.text().includes('Clear cache'))

    expect(clearButton).toBeDefined()
    await clearButton?.trigger('click')
    expect(clearCacheKeepLogin).toHaveBeenCalled()
  })

  it('handles logout button click', async () => {
    // Mock logout method
    const logoutSpy = vi.spyOn(wrapper.vm.userStore, 'logout').mockImplementation(() => {})

    // Switch to account tab
    await wrapper.setData({ activeTab: 'account' })

    // Find all buttons and find the logout button by text
    const logoutButton = wrapper.findAll('button').find((button) => button.text().includes('Logout'))

    expect(logoutButton).toBeDefined()
    await logoutButton?.trigger('click')
    expect(logoutSpy).toHaveBeenCalled()
  })

  it('displays site version disclaimer in site tab', async () => {
    // Switch to site tab
    await wrapper.setData({ activeTab: 'site' })

    // Check for the disclaimer text in the entire component
    const textContent = wrapper.text()
    expect(textContent).toContain('Please provide this when you bug report')
  })

  it('shows delete account confirmation dialog', async () => {
    // Switch to account tab
    await wrapper.setData({ activeTab: 'account' })

    // Initially dialog should be closed
    expect(wrapper.vm.deleteDialog).toBe(false)

    // Find all buttons and find the delete account button by text
    const deleteButton = wrapper.findAll('button').find((button) => button.text().includes('Delete account'))

    expect(deleteButton).toBeDefined()
    await deleteButton?.trigger('click')
    expect(wrapper.vm.deleteDialog).toBe(true)
  })

  it('properly initializes with the expected tabs configuration', () => {
    expect(wrapper.vm.tabs).toEqual([
      { value: 'game', text: 'Game' },
      { value: 'account', text: 'Account' },
      { value: 'site', text: 'Site' }
    ])
  })
})
