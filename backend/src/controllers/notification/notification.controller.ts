import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { NotificationService } from '@src/services/notification-service/notification-service.js';
import type { NewsNotificationRequest } from 'sleepapi-common';

export default class NotificationController {
  public async getNotifications(user: DBUser) {
    return NotificationService.getNotifications(user);
  }

  public async dismissNotification(externalId: string) {
    return NotificationService.dismissNotification(externalId);
  }

  public async getNewsNotifications() {
    return NotificationService.getNewsNotifications();
  }

  public async addNewsNotification(params: { admin: DBUser; newsRequest: NewsNotificationRequest }) {
    return NotificationService.addNewsNotification(params);
  }
}
