import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { NotificationService } from '@src/services/notification-service/notification-service.js';

export default class NotificationController {
  public async getNotifications(user: DBUser) {
    return NotificationService.getNotifications(user);
  }
}
