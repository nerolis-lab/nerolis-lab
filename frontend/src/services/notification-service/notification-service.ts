import serverAxios from '@/router/server-axios'
import type { NotificationResponse } from 'sleepapi-common'

class NotificationServiceImpl {
  public async getNotifications(): Promise<NotificationResponse> {
    try {
      const response = await serverAxios.get<NotificationResponse>('notifications')
      return response.data
    } catch {
      return { notifications: [] }
    }
  }
}

export const NotificationService = new NotificationServiceImpl()
