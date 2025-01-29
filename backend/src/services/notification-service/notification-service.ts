import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import type { BaseUser, NotificationResponse } from 'sleepapi-common';

class NotificationServiceImpl {
  public async getNotifications(user: DBUser): Promise<NotificationResponse> {
    const notifications = await NotificationDAO.findMultiple({ fk_receiver_id: user.id });

    const notificationsExt = [];
    for (const notification of notifications) {
      const senderRaw = await UserDAO.get({ id: notification.fk_sender_id });
      const receiverRaw = await UserDAO.get({ id: notification.fk_receiver_id });

      const sender: BaseUser = { friend_code: senderRaw.friend_code, name: senderRaw.name, avatar: senderRaw.avatar };
      const receiver: BaseUser = {
        friend_code: receiverRaw.friend_code,
        name: receiverRaw.name,
        avatar: receiverRaw.avatar
      };

      const template = notification.template;

      notificationsExt.push({ sender, receiver, template });
    }
    return { notifications: notificationsExt };
  }
}

export const NotificationService = new NotificationServiceImpl();
