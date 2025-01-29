import FriendRequestNotification from '@/components/inbox/notifications/friend-request-notification.vue'
import { FriendService } from '@/services/friend-service/friend-service'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { NotificationType, type UserNotification } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('FriendRequestNotification', () => {
  let wrapper: VueWrapper<InstanceType<typeof FriendRequestNotification>>
  let notificationStore: ReturnType<typeof useNotificationStore>

  const mockNotification: UserNotification = {
    receiver: {
      friend_code: 'TESTRE',
      name: 'Test Receiver',
      avatar: 'receiver-avatar'
    },
    sender: {
      friend_code: 'TESTSE',
      name: 'Test Sender',
      avatar: 'sender-avatar'
    },
    template: NotificationType.FriendRequest
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    notificationStore = useNotificationStore()

    wrapper = mount(FriendRequestNotification, {
      props: { notification: mockNotification }
    })
  })

  it('renders sender name and avatar correctly', () => {
    expect(wrapper.find('.v-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Sender')
    expect(wrapper.find('img').attributes('src')).toBe('/images/avatar/default.png')
  })

  it('calls acceptFriendRequest and syncs notifications on accept button click', async () => {
    FriendService.acceptFriendRequest = vi.fn().mockResolvedValue(true)
    notificationStore.sync = vi.fn()

    const acceptButton = wrapper.findAll('button').find((btn) => btn.text() === 'Accept')
    expect(acceptButton).toBeTruthy()
    await acceptButton!.trigger('click')

    await nextTick()
    await flushPromises()

    expect(FriendService.acceptFriendRequest).toHaveBeenCalledWith('TESTSE')
    expect(notificationStore.sync).toHaveBeenCalled()
  })

  it('calls declineFriendRequest and syncs notifications on decline button click', async () => {
    FriendService.declineFriendRequest = vi.fn().mockResolvedValue(true)
    notificationStore.sync = vi.fn()

    const declineButton = wrapper.findAll('button').find((btn) => btn.text() === 'Decline')
    expect(declineButton).toBeTruthy()
    await declineButton!.trigger('click')

    expect(FriendService.declineFriendRequest).toHaveBeenCalledWith('TESTSE')
    expect(notificationStore.sync).toHaveBeenCalled()
  })
})
