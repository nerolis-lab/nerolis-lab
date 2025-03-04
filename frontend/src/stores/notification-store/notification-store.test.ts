import { NotificationService } from '@/services/notification-service/notification-service'
import { createPinia, setActivePinia } from 'pinia'
import { NotificationType, type UserNotification } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationStore } from './notification-store'

vi.mock('@/services/notification-service/notification-service', () => ({
  NotificationService: {
    getNotifications: vi.fn()
  }
}))

describe('useNotificationStore', () => {
  let store: ReturnType<typeof useNotificationStore>

  const mockNotifications: UserNotification[] = [
    {
      template: NotificationType.FriendRequest,
      sender: { name: 'Test Sender', friend_code: 'ABC123' },
      receiver: { name: 'Test Receiver', friend_code: 'XYZ789' },
      externalId: '1'
    },
    {
      template: NotificationType.News,
      sender: { name: 'Another Sender', friend_code: 'DEF456' },
      receiver: { name: 'Another Receiver', friend_code: 'UVW321' },
      externalId: '1'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useNotificationStore()

    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct default state', () => {
      expect(store.unread).toBe(false)
      expect(store.notifications).toEqual([])
    })
  })

  describe('actions', () => {
    describe('sync', () => {
      it('fetches notifications and updates state', async () => {
        vi.mocked(NotificationService.getNotifications).mockResolvedValue({
          notifications: mockNotifications
        })

        const result = await store.sync()

        expect(NotificationService.getNotifications).toHaveBeenCalledTimes(1)
        expect(store.notifications).toEqual(mockNotifications)
        expect(result).toEqual(mockNotifications)
      })

      it('handles empty notifications array', async () => {
        vi.mocked(NotificationService.getNotifications).mockResolvedValue({
          notifications: []
        })

        const result = await store.sync()

        expect(store.notifications).toEqual([])
        expect(result).toEqual([])
      })

      it('handles API errors', async () => {
        const error = new Error('API Error')
        vi.mocked(NotificationService.getNotifications).mockRejectedValue(error)

        await expect(store.sync()).rejects.toThrow('API Error')
        expect(store.notifications).toEqual([])
      })
    })
  })
})
