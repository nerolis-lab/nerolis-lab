import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { NotificationService } from '@src/services/notification-service/notification-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { NotificationType, Roles, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

const createUser = async (name: string, friend_code: string) => {
  return await UserDAO.insert({
    external_id: uuid.v4(),
    name,
    friend_code,
    role: Roles.Default,
    sub: uuid.v4()
  });
};

describe('NotificationService', () => {
  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');
      await NotificationDAO.insert({
        fk_sender_id: sender.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.FriendRequest
      });

      const result = await NotificationService.getNotifications(receiver);

      expect(result.notifications).toEqual([
        {
          sender: expect.objectContaining({
            name: 'Sender',
            friend_code: 'SFC',
            avatar: undefined
          }),
          receiver: expect.objectContaining({
            name: 'Receiver',
            friend_code: 'RFC',
            avatar: undefined
          }),
          template: 'FriendRequest'
        }
      ]);
    });

    it('should return an empty array if the user has no notifications', async () => {
      const user = await createUser('Lonely User', 'LFC');
      const result = await NotificationService.getNotifications(user);
      expect(result.notifications).toEqual([]);
    });
  });
});
