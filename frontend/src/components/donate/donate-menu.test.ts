import DonateMenu from '@/components/donate/donate-menu.vue'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { Roles } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/components/icons/icon-patreon.vue', () => ({
  default: { template: '<svg />' }
}))

describe('DonateMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof DonateMenu>>
  let userStore: ReturnType<typeof useUserStore>

  beforeEach(() => {
    userStore = useUserStore()
    wrapper = mount(DonateMenu)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('clicking activator should open menu', async () => {
    expect(document.querySelector('#donateMenu')).toBeNull()

    const button = wrapper.find('#navBarIcon')
    expect(button).not.toBeNull()
    await button.trigger('click')

    await nextTick()

    expect(document.querySelector('#donateMenu')).not.toBeNull()
  })

  it('displays the correct icon for non-supporters when menu is closed', () => {
    const icon = wrapper.find('i.mdi-heart-outline')
    expect(icon.exists()).toBe(true)
  })

  it('displays the correct icon for non-supporters when menu is open', async () => {
    await wrapper.setData({ menu: true })
    const icon = wrapper.find('i.mdi-heart')
    expect(icon.exists()).toBe(true)
  })

  it('displays colored heart icon for supporters', async () => {
    userStore.role = Roles.Supporter

    await flushPromises()

    const icon = wrapper.find('i.mdi-heart.mdi.v-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('text-supporter')
  })

  it('displays colored heart icon for admins', async () => {
    userStore.role = Roles.Admin
    await flushPromises()

    const icon = wrapper.find('i.mdi-heart.mdi.v-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('text-primary')
  })

  it('shows thank you message for supporters', async () => {
    userStore.role = Roles.Supporter
    await flushPromises()

    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    await nextTick()

    expect(document.querySelector('#donateMenu')?.textContent).toMatchInlineSnapshot(
      `"Thank you! Thanks to your support, Neroli's Lab is able to operate free of charge for everyone! "`
    )
  })

  it('shows donation prompt for non-supporters', async () => {
    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    expect(document.querySelector('#donateMenu')?.textContent).toMatchInlineSnapshot(
      `"Enjoy Neroli's Lab? With just $1/month, you can support the development of Neroli's Lab and help keep it free for everyone! Patreon"`
    )
    expect(document.querySelector('#patreonButton')).not.toBeNull()
  })

  it('opens Patreon link when Patreon card is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const button = wrapper.find('#navBarIcon')
    await button.trigger('click')

    const patreonCard = document.querySelector('#patreonButton')
    expect(patreonCard).not.toBeNull()
    if (patreonCard) {
      ;(patreonCard as HTMLElement).click()
      expect(openSpy).toHaveBeenCalledWith('https://www.patreon.com/NerolisLab', '_blank')
    }
    openSpy.mockRestore()
  })
})
