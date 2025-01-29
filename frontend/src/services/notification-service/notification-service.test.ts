import serverAxios from '@/router/server-axios'
import { NotificationType, type UserNotification } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationService } from './notification-service'

vi.mock('@/router/server-axios', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('NotificationService', () => {
  const mockNotifications: UserNotification[] = [
    {
      template: NotificationType.FriendRequest,
      sender: { name: 'Test Sender', friend_code: 'ABC123' },
      receiver: { name: 'Test Receiver', friend_code: 'XYZ789' }
    },
    {
      template: NotificationType.News,
      sender: { name: 'Another Sender', friend_code: 'DEF456' },
      receiver: { name: 'Another Receiver', friend_code: 'UVW321' }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('successfully fetches notifications', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: { notifications: mockNotifications }
      })

      const result = await NotificationService.getNotifications()

      expect(serverAxios.get).toHaveBeenCalledWith('notifications')
      expect(serverAxios.get).toHaveBeenCalledTimes(1)

      expect(result).toEqual({ notifications: mockNotifications })
    })

    it('handles empty notifications response', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: { notifications: [] }
      })

      const result = await NotificationService.getNotifications()

      expect(result).toEqual({ notifications: [] })
    })

    it('returns empty notifications array on error', async () => {
      vi.mocked(serverAxios.get).mockRejectedValue(new Error('Network error'))

      const result = await NotificationService.getNotifications()

      expect(result).toEqual({ notifications: [] })
    })

    it('handles different types of errors', async () => {
      const errorScenarios = [
        new Error('Network error'),
        new Error('Timeout'),
        { response: { status: 404 } },
        { response: { status: 500 } }
      ]

      for (const error of errorScenarios) {
        vi.mocked(serverAxios.get).mockRejectedValueOnce(error)

        const result = await NotificationService.getNotifications()

        expect(result).toEqual({ notifications: [] })
      }
    })

    it('makes request to correct endpoint', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: { notifications: [] }
      })

      await NotificationService.getNotifications()

      expect(serverAxios.get).toHaveBeenCalledWith('notifications')
    })
  })
})
