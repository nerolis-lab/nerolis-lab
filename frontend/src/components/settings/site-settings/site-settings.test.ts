import { clearCacheKeepLogin } from '@/stores/store-service'
import { useVersionStore } from '@/stores/version-store/version-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SiteSettings from './site-settings.vue'

vi.mock('@/stores/store-service')
vi.mock('@/stores/version-store/version-store', () => ({
  useVersionStore: vi.fn(() => ({
    version: '1.0.0'
  }))
}))

describe('SiteSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof SiteSettings>>
  let versionStore: { version: string | null }

  beforeEach(() => {
    versionStore = useVersionStore() as { version: string | null }
    versionStore.version = '1.0.0'

    wrapper = mount(SiteSettings)
  })

  it('renders the component correctly', () => {
    expect(wrapper.find('.site-settings-container').exists()).toBe(true)

    const cards = wrapper.findAll('.v-card')
    expect(cards).toHaveLength(2)

    const cardTitles = wrapper.findAll('.v-card-title')
    expect(cardTitles[0].text()).toBe('Version Information')
    expect(cardTitles[1].text()).toBe('Cache Settings')
  })

  it('displays version information', () => {
    expect(wrapper.find('code').text()).toBe('1.0.0')
    expect(wrapper.find('.fine-print').text()).toContain('Please provide this when reporting bugs')
  })

  it('displays cache settings section', () => {
    const cacheSection = wrapper.findAll('.v-card')[1]

    expect(cacheSection.exists()).toBe(true)
    expect(cacheSection.text()).toContain('In case of issues please try clearing the cache')
    expect(cacheSection.find('.v-btn').text()).toContain('Clear Cache')
  })

  it('calls clearCacheKeepLogin when clear button is clicked', async () => {
    const clearButton = wrapper.find('.v-btn')
    await clearButton.trigger('click')
    expect(clearCacheKeepLogin).toHaveBeenCalled()
  })
})
