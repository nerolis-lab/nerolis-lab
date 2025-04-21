import { success } from '@/components/snackbar/snackbar.vue'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { Roles } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'
import AccountInfo from './account-info.vue'

vi.mock('@/components/snackbar/snackbar.vue', () => ({
  success: vi.fn()
}))

vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: false
  }))
}))

describe('AccountInfo', () => {
  let wrapper: VueWrapper<InstanceType<typeof AccountInfo>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.auth = mocks.loginResponse().auth
    userStore.name = 'Test User'
    userStore.avatar = 'test-avatar'
    userStore.externalId = 'test-id-123'
    userStore.role = Roles.Default

    vi.useFakeTimers()

    wrapper = mount(AccountInfo)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays user profile information', () => {
    const avatarStore = useAvatarStore()
    avatarStore.avatars = {
      'test-avatar': 'test-avatar.png'
    }

    wrapper = mount(AccountInfo)

    expect(wrapper.find('.text-h6').text()).toBe('Test User')
    expect(wrapper.find('.v-avatar img').attributes('src')).toBe('/images/avatar/test-avatar.png')
  })

  it('displays user ID with copy button', () => {
    const userIdSection = wrapper.find('.profile-value')
    expect(userIdSection.text()).toBe('test-id-123')
    expect(wrapper.find('.v-btn .v-icon.mdi-content-copy').exists()).toBe(true)
  })

  it('displays formatted role', () => {
    const roleSection = wrapper.findAll('.profile-value').find((el) => el.text().includes('Member'))
    expect(roleSection?.text()).toBe('Member')

    // Test supporter role
    userStore.role = Roles.Supporter
    wrapper = mount(AccountInfo)
    const supporterRoleSection = wrapper.findAll('.profile-value').find((el) => el.text().includes('Supporter'))
    expect(supporterRoleSection?.text()).toBe('Supporter')
  })

  it('copies user ID to clipboard when copy button is clicked', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    const copyButton = wrapper.find('.v-btn .v-icon.mdi-content-copy')
    await copyButton.trigger('click')

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test-id-123')
    expect(success).toHaveBeenCalledWith('User ID copied to clipboard!')
  })

  it('shows success icon after copying', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
    Object.assign(navigator, { clipboard: mockClipboard })

    const copyButton = wrapper.find('.v-btn .v-icon.mdi-content-copy')
    await copyButton.trigger('click')

    expect(wrapper.find('.v-icon.mdi-check').exists()).toBe(true)

    // Wait for success icon to disappear
    vi.advanceTimersByTime(2100)
    await flushPromises()
    expect(wrapper.find('.v-icon.mdi-check').exists()).toBe(false)
  })

  it('handles missing user information gracefully', () => {
    userStore.externalId = null
    userStore.avatar = null

    wrapper = mount(AccountInfo)

    expect(wrapper.find('.profile-value').text()).toBe('Unknown')
    expect(wrapper.find('.v-avatar img').attributes('src')).toBe('/images/avatar/default.png')
  })
})
