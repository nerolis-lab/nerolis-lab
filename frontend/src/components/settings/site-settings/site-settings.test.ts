import * as snackbar from '@/components/snackbar/snackbar.vue'
import { UserService } from '@/services/user/user-service'
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SiteSettings from './site-settings.vue'

vi.mock('@/stores/store-service')
vi.mock('@/stores/version-store/version-store', () => ({
  useVersionStore: vi.fn(() => ({
    version: '1.0.0'
  }))
}))
vi.mock('@/stores/user-store')
vi.mock('@/services/user/user-service')
vi.mock('@/components/snackbar/snackbar.vue', () => ({
  success: vi.fn(),
  error: vi.fn()
}))

describe('SiteSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof SiteSettings>>
  let versionStore: { version: string | null }
  let userStore: { randomizeNicknames: boolean }

  beforeEach(() => {
    vi.clearAllMocks()

    versionStore = useVersionStore() as { version: string | null }
    versionStore.version = '1.0.0'

    userStore = {
      randomizeNicknames: true
    }
    vi.mocked(useUserStore).mockReturnValue(userStore as ReturnType<typeof useUserStore>)

    wrapper = mount(SiteSettings)
  })

  it('renders the component correctly', () => {
    expect(wrapper.find('.site-settings-container').exists()).toBe(true)

    const cards = wrapper.findAllComponents({ name: 'SettingsCard' })
    expect(cards).toHaveLength(3)

    expect(cards[0].props('title')).toBe('Version Information')
    expect(cards[1].props('title')).toBe('Pokémon Name Generation')
    expect(cards[2].props('title')).toBe('Cache Settings')
  })

  it('displays version information', () => {
    const versionCard = wrapper.findAllComponents({ name: 'SettingsCard' })[0]
    expect(versionCard.find('code').text()).toBe('1.0.0')
    expect(versionCard.find('.fine-print').text()).toContain('Please provide this when reporting bugs')
  })

  it('displays pokemon name generation settings', () => {
    const nameGenCard = wrapper.findAllComponents({ name: 'SettingsCard' })[1]
    expect(nameGenCard.find('.v-switch').exists()).toBe(true)
  })

  it('displays cache settings section', () => {
    const cacheSection = wrapper.findAllComponents({ name: 'SettingsCard' })[2]

    expect(cacheSection.exists()).toBe(true)
    expect(cacheSection.text()).toContain('In case of issues please try clearing the cache')
    expect(cacheSection.find('.v-btn').text()).toContain('Clear Cache')
  })

  it('calls clearCacheKeepLogin when clear button is clicked', async () => {
    const cacheSection = wrapper.findAllComponents({ name: 'SettingsCard' })[2]
    const clearButton = cacheSection.find('.v-btn')
    await clearButton.trigger('click')
    expect(clearCacheKeepLogin).toHaveBeenCalled()
    expect(snackbar.success).toHaveBeenCalledWith('Cache cleared successfully')
  })

  it('updates randomizeNicknames setting successfully', async () => {
    vi.mocked(UserService.upsertUserSettings).mockResolvedValue({ randomizeNicknames: false })

    const nameGenCard = wrapper.findAllComponents({ name: 'SettingsCard' })[1]
    const vSwitch = nameGenCard.find('.v-switch input')

    expect(userStore.randomizeNicknames).toBe(true)

    await vSwitch.setValue(false)

    expect(UserService.upsertUserSettings).toHaveBeenCalledWith({ randomizeNicknames: false })
    expect(userStore.randomizeNicknames).toBe(false)
    expect(snackbar.error).not.toHaveBeenCalled()
  })

  it('shows error notification and reverts setting when update fails', async () => {
    const mockError = new Error('API Error')
    vi.mocked(UserService.upsertUserSettings).mockRejectedValue(mockError)

    const nameGenCard = wrapper.findAllComponents({ name: 'SettingsCard' })[1]
    const vSwitch = nameGenCard.find('.v-switch input')

    expect(userStore.randomizeNicknames).toBe(true)

    await vSwitch.setValue(false)

    // Wait for the async operation to complete
    await wrapper.vm.$nextTick()

    expect(UserService.upsertUserSettings).toHaveBeenCalledWith({ randomizeNicknames: false })
    expect(userStore.randomizeNicknames).toBe(true) // Should revert to original value
    expect(snackbar.error).toHaveBeenCalledWith('Failed to update Pokémon name settings. Please try again.')
  })

  it('logs error to console when update fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('API Error')
    vi.mocked(UserService.upsertUserSettings).mockRejectedValue(mockError)

    const nameGenCard = wrapper.findAllComponents({ name: 'SettingsCard' })[1]
    const vSwitch = nameGenCard.find('.v-switch input')

    await vSwitch.setValue(false)
    await wrapper.vm.$nextTick()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update randomizeNicknames setting:', mockError)

    consoleSpy.mockRestore()
  })
})
