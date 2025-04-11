import { success } from '@/components/snackbar/snackbar.vue'
import { AuthService } from '@/services/login/auth-service'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AccountActions from './account-actions.vue'

vi.mock('@/components/snackbar/snackbar.vue')
vi.mock('@/services/login/auth-service', () => ({
  AuthService: {
    delete: vi.fn()
  }
}))

vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: false
  }))
}))

describe('AccountActions', () => {
  let wrapper: VueWrapper<InstanceType<typeof AccountActions>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.auth = mocks.loginResponse().auth

    wrapper = mount(AccountActions)
  })

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })

  it('renders logout and delete buttons', () => {
    const buttons = wrapper.findAll('.v-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('LOGOUT')
    expect(buttons[1].text()).toBe('DELETE ACCOUNT')
  })

  it('logs out user when logout button is clicked', async () => {
    userStore.logout = vi.fn()
    const logoutButton = wrapper.findAll('.v-btn').find((el) => el.text() === 'LOGOUT')
    await logoutButton?.trigger('click')

    expect(userStore.logout).toHaveBeenCalled()
    expect(success).toHaveBeenCalledWith('You have been logged out successfully')
  })

  describe('delete account dialog', () => {
    it('opens delete dialog when delete button is clicked', async () => {
      const deleteButton = wrapper.findAll('.v-btn').find((el) => el.text() === 'DELETE ACCOUNT')
      await deleteButton?.trigger('click')

      expect(wrapper.vm.deleteDialog).toBe(true)
    })

    it('shows warning message in delete dialog', async () => {
      const deleteButton = wrapper.findAll('.v-btn').find((el) => el.text() === 'DELETE ACCOUNT')
      await deleteButton?.trigger('click')

      const dialogText = document.querySelector('.v-card-text')
      expect(dialogText?.textContent).toContain('Are you sure you want to delete your account?')
      expect(dialogText?.textContent).toContain('All your data and progress will be permanently deleted')
    })

    it('closes dialog when cancel is clicked', async () => {
      // Open dialog
      const deleteButton = wrapper.findAll('.v-btn').find((el) => el.text() === 'DELETE ACCOUNT')
      await deleteButton?.trigger('click')
      expect(wrapper.vm.deleteDialog).toBe(true)

      // Click cancel
      const cancelButton = Array.from(document.querySelectorAll('.v-btn')).find((el) =>
        el.textContent?.includes('Cancel')
      ) as HTMLElement
      expect(cancelButton).not.toBeNull()
      cancelButton.click()

      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('deletes account and logs out when delete is confirmed', async () => {
      userStore.logout = vi.fn()

      // Open dialog
      const deleteButton = wrapper.findAll('.v-btn').find((el) => el.text() === 'DELETE ACCOUNT')
      await deleteButton?.trigger('click')
      expect(wrapper.vm.deleteDialog).toBe(true)
      // Click delete
      const confirmDeleteButton = Array.from(document.querySelectorAll('.v-btn')).find((el) =>
        el.textContent?.includes('Delete')
      ) as HTMLElement
      expect(confirmDeleteButton).not.toBeNull()
      confirmDeleteButton.click()

      await flushPromises()

      expect(AuthService.delete).toHaveBeenCalled()
      expect(success).toHaveBeenCalledWith('Your account has been deleted successfully')
      expect(userStore.logout).toHaveBeenCalled()

      expect(wrapper.vm.deleteDialog).toBe(false)
    })
  })
})
