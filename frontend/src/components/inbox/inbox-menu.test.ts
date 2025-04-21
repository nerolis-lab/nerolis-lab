import InboxMenu from '@/components/inbox/inbox-menu.vue'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { NotificationType } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('InboxMenu', () => {
  let wrapper: VueWrapper<InstanceType<typeof InboxMenu>>
  let notificationStore: ReturnType<typeof useNotificationStore>

  beforeEach(() => {
    notificationStore = useNotificationStore()
    notificationStore.sync = vi.fn()

    wrapper = mount(InboxMenu)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders without notifications when the menu is opened', async () => {
    const activatorButton = wrapper.find('#emptyInbox')
    await activatorButton.trigger('click')

    expect(document.body.querySelector('.v-list-item-title')?.textContent).toContain('No notifications')
  })

  it('renders with notifications', async () => {
    notificationStore.notifications = [
      {
        template: NotificationType.FriendRequest,
        sender: { name: 'Test Sender', friend_code: 'CODE1' },
        receiver: { name: 'Test Receiver', friend_code: 'CODE2' },
        externalId: '1'
      }
    ]

    await flushPromises()

    expect(wrapper.find('#navBarIcon').exists()).toBe(true)
    expect(wrapper.find('#emptyInbox').exists()).toBe(false)

    const activatorButton = wrapper.find('#navBarIcon')
    await activatorButton.trigger('click')

    expect(document.body.querySelector('.v-list-item-title')).toBeNull()
  })

  it('calls sync on mount', async () => {
    await flushPromises()
    expect(notificationStore.sync).toHaveBeenCalled()
  })

  it('toggles menu visibility when menu prop changes', async () => {
    expect(wrapper.vm.menu).toBe(false)
    wrapper.vm.toggleMenu()
    await nextTick()
    expect(wrapper.vm.menu).toBe(true)
  })
})
