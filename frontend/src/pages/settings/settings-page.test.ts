import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import SettingsPage from './settings-page.vue'

vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false),
    isLargeDesktop: ref(false),
    viewportWidth: ref(1024)
  }))
}))

describe('SettingsPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof SettingsPage>>

  beforeEach(() => {
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

  it('renders mobile navigation when on mobile', async () => {
    vi.mocked(useBreakpoint).mockReturnValue({
      isMobile: ref(true),
      isLargeDesktop: ref(false),
      viewportWidth: ref(375)
    })
    wrapper = mount(SettingsPage)

    expect(wrapper.find('.v-list').exists()).toBe(false)
    expect(wrapper.find('.v-tabs').exists()).toBe(true)
  })

  it('starts with game tab active', () => {
    expect(wrapper.vm.activeTab).toBe('game')
  })

  it('switches tabs correctly on desktop', async () => {
    vi.mocked(useBreakpoint).mockReturnValue({
      isMobile: ref(false),
      isLargeDesktop: ref(true),
      viewportWidth: ref(375)
    })

    wrapper = mount(SettingsPage)

    const listItems = wrapper.findAll('.v-list-item')

    await listItems[1].trigger('click')
    expect(wrapper.vm.activeTab).toBe('account')

    await listItems[2].trigger('click')
    expect(wrapper.vm.activeTab).toBe('site')
  })

  it('displays correct number of tabs', () => {
    const tabs = wrapper.vm.tabs
    expect(tabs).toHaveLength(3)
    expect(tabs.map((tab) => tab.value)).toEqual(['game', 'account', 'site'])
  })

  it('renders all settings components', () => {
    expect(wrapper.html()).toContain('Game Settings')
    expect(wrapper.html()).toContain('Account')
    expect(wrapper.html()).toContain('Site')
  })
})
