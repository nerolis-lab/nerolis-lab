import TheNavBar from '@/components/nav-bar/nav-bar.vue'
import { i18n } from '@/i18n'
import { useUserStore } from '@/stores/user-store'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { Roles } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { VApp } from 'vuetify/components'

vi.mock('@/stores/user-store')

const AppWrapper = defineComponent({
  components: { VApp, TheNavBar },
  render() {
    return h(VApp, null, { default: () => h(TheNavBar) })
  }
})

describe('TheNavBar', () => {
  let wrapper: VueWrapper<InstanceType<typeof AppWrapper>>

  beforeEach(() => {
    vi.mocked(useUserStore).mockReturnValue({
      role: Roles.Default,
      loggedIn: false,
      syncUserSettings: vi.fn().mockResolvedValue(undefined)
    } as unknown as ReturnType<typeof useUserStore>)

    wrapper = mount(AppWrapper)
  })

  afterEach(() => {
    wrapper.unmount()
    i18n.global.locale.value = 'en'
  })

  it('renders the drawer items with translated titles', () => {
    const items = wrapper.findAllComponents({ name: 'VListItem' })
    const titles = items.map((item) => item.props('title'))

    expect(titles).toContain('Home')
    expect(titles).toContain('Calculator')
    expect(titles).toContain('Compare')
    expect(titles).toContain('Tier lists')
    expect(titles).toContain('Recipes')
    expect(titles).toContain('Settings')
  })

  it('does not show the admin item for non-admin users', () => {
    const items = wrapper.findAllComponents({ name: 'VListItem' })
    expect(items.map((item) => item.props('title'))).not.toContain('Admin')
  })

  it('re-renders drawer titles in the selected language', async () => {
    i18n.global.locale.value = 'ja'
    await wrapper.vm.$nextTick()

    const items = wrapper.findAllComponents({ name: 'VListItem' })
    expect(items.map((item) => item.props('title'))).toContain('ホーム')
  })

  it('shows the admin item to admins, falling back to English (no ja translation yet)', async () => {
    vi.mocked(useUserStore).mockReturnValue({
      role: Roles.Admin,
      loggedIn: false,
      syncUserSettings: vi.fn().mockResolvedValue(undefined)
    } as unknown as ReturnType<typeof useUserStore>)
    i18n.global.locale.value = 'ja'
    const adminWrapper = mount(AppWrapper)
    await adminWrapper.vm.$nextTick()

    const items = adminWrapper.findAllComponents({ name: 'VListItem' })
    expect(items.map((item) => item.props('title'))).toContain('Admin')

    adminWrapper.unmount()
  })
})
