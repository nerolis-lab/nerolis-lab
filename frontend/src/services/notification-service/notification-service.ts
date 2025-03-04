import serverAxios from '@/router/server-axios'
import type { NewsNotification, NewsNotificationRequest, NotificationResponse } from 'sleepapi-common'

class NotificationServiceImpl {
  public async getNotifications(): Promise<NotificationResponse> {
    try {
      const response = await serverAxios.get<NotificationResponse>('notifications')
      return response.data
    } catch {
      return { notifications: [] }
    }
  }

  public async dismissNotification(notificationExternalId: string): Promise<boolean> {
    try {
      await serverAxios.delete(`notifications/${notificationExternalId}`)
      return true
    } catch {
      logger.error('Failed to dismiss notification, contact developer')
      return false
    }
  }

  public async createNews(request: NewsNotificationRequest) {
    try {
      return await serverAxios.post<NewsNotificationRequest>('notifications/news', request)
    } catch {
      logger.error('Failed to create news post, contact developer')
    }
  }

  public async getNewsHistory(): Promise<NewsNotification[]> {
    try {
      const response = await serverAxios.get<NewsNotification[]>('notifications/news')
      return response.data
    } catch {
      logger.error('Failed to fetch news post history, contact developer')
      return []
    }
  }
}

export const NotificationService = new NotificationServiceImpl()
