import { loginWithDiscord } from '@/services/login/discord-service'
import { loginWithGoogle } from '@/services/login/google-service'
import { loginWithPatreon } from '@/services/login/patreon-service'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import LoginMenu from './login-menu.vue'

vi.mock('@/services/login/patreon-service')
vi.mock('@/services/login/google-service')
vi.mock('@/services/login/discord-service')

const mockRoute = { path: '/test' }
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

describe('LoginMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof LoginMenu>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    userStore.auth = null

    wrapper = mount(LoginMenu)
  })

  it('displays login card when user is not logged in', () => {
    expect(wrapper.find('.v-card-title').text()).toBe('Login')
  })

  it('shows logout button when user is logged in', () => {
    userStore.auth = mocks.loginResponse().auth
    wrapper = mount(LoginMenu)

    expect(wrapper.find('#logoutButton').exists()).toBe(true)
  })
  it('calls Patreon login service when Patreon button is clicked', async () => {
    // open the login menu
    await wrapper.find('.v-card-title').trigger('click')

    const patreonTitle = Array.from(document.querySelectorAll('.v-card-title')).find(
      (el) => el.textContent === 'Patreon'
    )
    const patreonButton = patreonTitle?.closest('.v-card') as HTMLElement
    expect(patreonButton).not.toBeNull()
    patreonButton.click()

    expect(loginWithPatreon).toHaveBeenCalledWith(mockRoute)
  })

  it('calls Google login service when Google button is clicked', async () => {
    // open the login menu
    await wrapper.find('.v-card-title').trigger('click')

    const googleTitle = Array.from(document.querySelectorAll('.v-card-title')).find((el) => el.textContent === 'Google')
    const googleButton = googleTitle?.closest('.v-card') as HTMLElement
    expect(googleButton).not.toBeNull()
    googleButton.click()

    expect(loginWithGoogle).toHaveBeenCalledWith(mockRoute)
  })

  it('calls Discord login service when Discord button is clicked', async () => {
    // open the login menu
    await wrapper.find('.v-card-title').trigger('click')

    const discordTitle = Array.from(document.querySelectorAll('.v-card-title')).find(
      (el) => el.textContent === 'Discord'
    )
    const discordButton = discordTitle?.closest('.v-card') as HTMLElement
    expect(discordButton).not.toBeNull()
    discordButton.click()

    expect(loginWithDiscord).toHaveBeenCalledWith(mockRoute)
  })

  it('calls logout when logout button is clicked', async () => {
    userStore.auth = mocks.loginResponse().auth
    const spy = vi.spyOn(userStore, 'logout')
    wrapper = mount(LoginMenu)

    const logoutButton = wrapper.find('#logoutButton')
    expect(logoutButton.exists()).toBe(true)
    await logoutButton.trigger('click')

    expect(spy).toHaveBeenCalled()
  })

  it('displays welcome message and login instructions', async () => {
    // open the login menu
    await wrapper.find('.v-card-title').trigger('click')

    const title = document.querySelector('.v-card-title')
    expect(title?.textContent).toBe('Welcome!')

    const text = document.querySelector('.v-card-text p')
    expect(text?.textContent?.trim()).toBe(
      "Sign in to access your account. A new account will be created automatically if you don't have one yet."
    )
  })

  it('displays supporter hint message', async () => {
    // open the login menu
    await wrapper.find('.v-card-title').trigger('click')

    const title = document.querySelector('.v-card-title')
    expect(title?.textContent).toBe('Welcome!')

    const hint = document.querySelector('.supporter-hint .v-card-text')
    expect(hint?.textContent).toContain('Supporting us on Patreon helps keep this site alive')
  })
})
