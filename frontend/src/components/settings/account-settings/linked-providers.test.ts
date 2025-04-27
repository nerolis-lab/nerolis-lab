import { success } from '@/components/snackbar/snackbar.vue'
import { loginWithDiscord } from '@/services/login/discord-service'
import { loginWithGoogle } from '@/services/login/google-service'
import { loginWithPatreon } from '@/services/login/patreon-service'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { AuthProvider } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'
import LinkedProviders from './linked-providers.vue'

vi.mock('@/components/snackbar/snackbar.vue', () => ({
  success: vi.fn()
}))
vi.mock('@/services/login/discord-service')
vi.mock('@/services/login/google-service')
vi.mock('@/services/login/patreon-service')

const mockRoute = {
  query: {}
}

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute)
}))

describe('LinkedProviders', () => {
  let wrapper: VueWrapper<InstanceType<typeof LinkedProviders>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.auth = mocks.loginResponse({
      auth: {
        linkedProviders: {
          [AuthProvider.Google]: { linked: true },
          [AuthProvider.Discord]: { linked: true },
          [AuthProvider.Patreon]: { linked: false }
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiryDate: Date.now() + 1000 * 60 * 60 * 24 * 30
        },
        activeProvider: AuthProvider.Google
      }
    }).auth

    wrapper = mount(LinkedProviders)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  it('renders all providers', async () => {
    const providers = wrapper.findAll('.provider-info')
    expect(providers).toHaveLength(3)

    const providerNames = providers.map((provider) => provider.text())
    expect(providerNames).toContain('Google')
    expect(providerNames).toContain('Discord')
    expect(providerNames).toContain('Patreon')
  })

  it('shows correct button states for linked and unlinked providers', async () => {
    userStore.auth!.linkedProviders[AuthProvider.Google].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Discord].linked = true
    userStore.auth!.linkedProviders[AuthProvider.Patreon].linked = false

    wrapper = mount(LinkedProviders)

    const buttons = wrapper.findAll('.provider-action-btn')

    // Discord is linked
    const discordButton = buttons[1]
    expect(discordButton.text()).toBe('UNLINK')
    expect(discordButton.classes()).toContain('text-error-3')
    expect(discordButton.classes()).toContain('v-btn--variant-outlined')

    // Google is unlinked
    const googleButton = buttons[0]
    expect(googleButton.text()).toBe('LINK')
    expect(googleButton.classes()).toContain('v-btn--variant-elevated')
    expect(googleButton.classes()).toContain('bg-secondary')
  })

  it('disables unlink button when only one provider is linked', async () => {
    userStore.auth!.linkedProviders[AuthProvider.Google].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Discord].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Patreon].linked = true

    wrapper = mount(LinkedProviders)

    const linkedButton = wrapper.findAll('.provider-action-btn').find((btn) => btn.text() === 'UNLINK')
    expect(linkedButton?.attributes('disabled')).toBeDefined()
  })

  it('shows help text when only one provider is linked', async () => {
    userStore.auth!.linkedProviders[AuthProvider.Google].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Discord].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Patreon].linked = true

    wrapper = mount(LinkedProviders)

    const helpText = wrapper.find('.help-text')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toContain("You can't unlink your only login option")
  })

  it('hides help text when multiple providers are linked', async () => {
    userStore.auth!.linkedProviders[AuthProvider.Google].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Discord].linked = true
    userStore.auth!.linkedProviders[AuthProvider.Patreon].linked = true

    wrapper = mount(LinkedProviders)

    const helpText = wrapper.find('.help-text')
    expect(helpText.exists()).toBe(false)
  })

  it('calls appropriate login method when link button is clicked', async () => {
    userStore.auth!.linkedProviders[AuthProvider.Google].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Discord].linked = false
    userStore.auth!.linkedProviders[AuthProvider.Patreon].linked = false

    wrapper = mount(LinkedProviders)

    const googleButton = wrapper.findAll('.provider-action-btn')[0]
    await googleButton.trigger('click')
    expect(loginWithGoogle).toHaveBeenCalled()

    const discordButton = wrapper.findAll('.provider-action-btn')[1]
    await discordButton.trigger('click')
    expect(loginWithDiscord).toHaveBeenCalled()

    const patreonButton = wrapper.findAll('.provider-action-btn')[2]
    await patreonButton.trigger('click')
    expect(loginWithPatreon).toHaveBeenCalled()
  })

  describe('unlink dialog', () => {
    beforeEach(() => {
      vi.spyOn(userStore, 'unlinkProvider').mockResolvedValue()
    })

    it('opens unlink dialog with correct provider when unlink is clicked', async () => {
      const unlinkButton = wrapper.findAll('.provider-action-btn')[0]
      await unlinkButton.trigger('click')

      const dialog = document.querySelector('.v-dialog')
      expect(dialog).toBeTruthy()
      expect(wrapper.vm.unlinkDialog).toBe(true)
      expect(wrapper.vm.providerToUnlink).toBe(AuthProvider.Google)

      const dialogTitle = dialog?.querySelector('.v-card-title')
      expect(dialogTitle?.textContent).toContain('Unlink Account')

      const dialogContent = dialog?.querySelector('.v-card-text')
      expect(dialogContent?.textContent).toContain('Google')
    })

    it('closes dialog when cancel is clicked', async () => {
      const unlinkButton = wrapper.findAll('.provider-action-btn')[0]
      await unlinkButton.trigger('click')
      expect(wrapper.vm.unlinkDialog).toBe(true)

      const dialog = document.querySelector('.v-dialog')
      expect(dialog).toBeTruthy()

      const buttons = dialog?.querySelectorAll('.v-btn')
      const cancelButton = Array.from(buttons || []).find((btn) => btn.textContent?.includes('Cancel'))
      expect(cancelButton).toBeTruthy()

      cancelButton?.dispatchEvent(new Event('click'))

      expect(wrapper.vm.unlinkDialog).toBe(false)
      expect(wrapper.vm.providerToUnlink).toBe(AuthProvider.Google)
      expect(userStore.unlinkProvider).not.toHaveBeenCalled()
    })

    it('unlinks provider when unlink is confirmed', async () => {
      const unlinkButton = wrapper.findAll('.provider-action-btn')[0]
      await unlinkButton.trigger('click')

      const dialog = document.querySelector('.v-dialog')
      expect(dialog).toBeTruthy()

      // Find the Unlink button by looking for a button with "Unlink" text
      const buttons = dialog?.querySelectorAll('.v-btn')
      const confirmButton = Array.from(buttons || []).find((btn) => btn.textContent?.includes('Unlink'))
      expect(confirmButton).toBeTruthy()

      confirmButton?.dispatchEvent(new Event('click'))

      await vi.waitFor(() => {
        expect(userStore.unlinkProvider).toHaveBeenCalledWith(AuthProvider.Google)
        expect(success).toHaveBeenCalledWith('Google account unlinked successfully!')
      })
      expect(wrapper.vm.unlinkDialog).toBe(false)
      expect(wrapper.vm.providerToUnlink).toBe(null)
    })
  })

  it('calls correct login method when clicking link button', async () => {
    userStore.auth!.linkedProviders = {
      [AuthProvider.Google]: { linked: false },
      [AuthProvider.Discord]: { linked: false },
      [AuthProvider.Patreon]: { linked: false }
    }

    wrapper.unmount()
    wrapper = mount(LinkedProviders)

    const buttons = wrapper.findAll('.provider-action-btn')
    expect(buttons).toHaveLength(3)

    // Test Google login
    await buttons[0].trigger('click')
    expect(loginWithGoogle).toHaveBeenCalledWith(mockRoute)

    // Test Discord login
    await buttons[1].trigger('click')
    expect(loginWithDiscord).toHaveBeenCalledWith(mockRoute)

    // Test Patreon login
    await buttons[2].trigger('click')
    expect(loginWithPatreon).toHaveBeenCalledWith(mockRoute)
  })
})
