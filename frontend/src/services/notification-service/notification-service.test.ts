import serverAxios from '@/router/server-axios'
import {
  NotificationType,
  uuid,
  type NewsNotification,
  type NewsNotificationRequest,
  type UserNotification
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationService } from './notification-service'

vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn()
  }
}))

vi.mock('@/router/server-axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn()
  }
}))

describe('NotificationService', () => {
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
      externalId: '2'
    }
  ]

  const mockNewsNotifications: NewsNotification[] = [
    {
      author: 'Admin User',
      authorAvatar: 'default',
      title: 'Test News 1',
      content: 'This is test news content 1',
      created_at: '2025-02-20T12:00:00Z'
    },
    {
      author: 'Admin User',
      authorAvatar: 'custom-avatar',
      title: 'Test News 2',
      content: 'This is test news content 2',
      created_at: '2025-02-21T13:00:00Z'
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

  describe('dismissNotification', () => {
    it('successfully dismisses a notification', async () => {
      vi.mocked(serverAxios.delete).mockResolvedValue({ data: {} })

      const result = await NotificationService.dismissNotification('notification-id-123')

      expect(serverAxios.delete).toHaveBeenCalledWith('notifications/notification-id-123')
      expect(result).toBe(true)
    })

    it('returns false on error', async () => {
      vi.mocked(serverAxios.delete).mockRejectedValue(new Error('Network error'))

      const result = await NotificationService.dismissNotification('notification-id-123')

      expect(result).toBe(false)
    })
  })

  describe('createNews', () => {
    const newsRequest: NewsNotificationRequest = {
      title: 'Test News Title',
      content: 'Test News Content',
      authorExternalId: uuid.v4()
    }

    it('successfully creates a news post', async () => {
      vi.mocked(serverAxios.post).mockResolvedValue({ data: {} })

      const result = await NotificationService.createNews(newsRequest)

      expect(serverAxios.post).toHaveBeenCalledWith('notifications/news', newsRequest)
      expect(result).toBeDefined()
    })

    it('handles errors when creating news', async () => {
      vi.mocked(serverAxios.post).mockRejectedValue(new Error('Network error'))

      const result = await NotificationService.createNews(newsRequest)

      expect(result).toBeUndefined()
    })
  })

  describe('getNewsHistory', () => {
    it('successfully fetches news history', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: mockNewsNotifications
      })

      const result = await NotificationService.getNewsHistory()

      expect(serverAxios.get).toHaveBeenCalledWith('notifications/news')
      expect(result).toEqual(mockNewsNotifications)
    })

    it('returns empty array on error', async () => {
      vi.mocked(serverAxios.get).mockRejectedValue(new Error('Network error'))

      const result = await NotificationService.getNewsHistory()

      expect(result).toEqual([])
    })

    it('handles empty response', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: []
      })

      const result = await NotificationService.getNewsHistory()

      expect(result).toEqual([])
    })
  })
})
