import { NotificationService } from '@/services/notification-service/notification-service'
import { defineStore } from 'pinia'
import type { UserNotification } from 'sleepapi-common'

export interface NotificationState {
  unread: boolean
  notifications: UserNotification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => {
    return {
      unread: false,
      notifications: []
    }
  },
  actions: {
    async sync(): Promise<UserNotification[]> {
      const response = await NotificationService.getNotifications()
      this.notifications = [...response.notifications]
      return this.notifications
    }
  },
  persist: true
})
