import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { RouteName } from '@/router/router'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import SettingsPage from './settings-page.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    name: RouteName.SettingsGame
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false),
    isLargeDesktop: ref(false),
    viewportWidth: ref(1024)
  }))
}))

describe('SettingsPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof SettingsPage>>
  const mockRouter = { push: vi.fn() } as unknown as Router

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsGame
    } as unknown as RouteLocationNormalizedLoaded)
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    wrapper = mount(SettingsPage)
  })

  it('renders desktop navigation when not mobile', () => {
    vi.mocked(useBreakpoint).mockReturnValue({
      isMobile: ref(false),
      isLargeDesktop: ref(true),
      viewportWidth: ref(375)
    })
    wrapper = mount(SettingsPage)

    expect(wrapper.find('.v-list').exists()).toBe(true)
    expect(wrapper.find('.v-tabs').exists()).toBe(false)
  })

  it('renders mobile navigation when on mobile', () => {
    vi.mocked(useBreakpoint).mockReturnValue({
      isMobile: ref(true),
      isLargeDesktop: ref(false),
      viewportWidth: ref(375)
    })
    wrapper = mount(SettingsPage)

    expect(wrapper.find('.v-list').exists()).toBe(false)
    expect(wrapper.find('.v-tabs').exists()).toBe(true)
  })

  it('displays correct number of tabs', () => {
    const tabs = wrapper.vm.tabs
    expect(tabs).toHaveLength(3)
    expect(tabs.map((tab) => tab.value)).toEqual(['game', 'account', 'site'])
    expect(wrapper.vm.activeTab).toBe('game')
  })

  it('calls router.push when tab is clicked', async () => {
    // Ensure we're in desktop mode to see the list items
    vi.mocked(useBreakpoint).mockReturnValue({
      isMobile: ref(false),
      isLargeDesktop: ref(true),
      viewportWidth: ref(1024)
    })
    wrapper = mount(SettingsPage)

    const listItems = wrapper.findAll('.v-list-item')
    expect(listItems.length).toBeGreaterThan(0)

    // Click on the account tab
    await listItems[1].trigger('click')
    expect(mockRouter.push).toHaveBeenCalledWith({ name: RouteName.SettingsAccount })
  })

  it('sets activeTab based on current route', () => {
    // Game route
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsGame
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.vm.activeTab).toBe('game')

    // Account route
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsAccount
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.vm.activeTab).toBe('account')

    // Site route
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsSite
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.vm.activeTab).toBe('site')
  })

  it('renders the correct component based on the route', () => {
    // Game tab - shows GameSettings
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsGame
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.findComponent({ name: 'GameSettings' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AccountSettings' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'SiteSettings' }).exists()).toBe(false)

    // Account tab - shows AccountSettings
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsAccount
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.findComponent({ name: 'GameSettings' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'AccountSettings' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SiteSettings' }).exists()).toBe(false)

    // Site tab - shows SiteSettings
    vi.mocked(useRoute).mockReturnValue({
      name: RouteName.SettingsSite
    } as unknown as RouteLocationNormalizedLoaded)
    wrapper = mount(SettingsPage)
    expect(wrapper.findComponent({ name: 'GameSettings' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'AccountSettings' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'SiteSettings' }).exists()).toBe(true)
  })
})
