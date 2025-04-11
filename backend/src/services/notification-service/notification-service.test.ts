import { NewsDAO } from '@src/database/dao/notification/news-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { NotificationService } from '@src/services/notification-service/notification-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { NewsNotificationRequest } from 'sleepapi-common';
import { NotificationType, Roles, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

const createUser = async (name: string, friend_code: string) => {
  return await UserDAO.insert({
    external_id: uuid.v4(),
    name,
    friend_code,
    role: Roles.Default,
    google_id: uuid.v4()
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
        template: NotificationType.FriendRequest,
        external_id: uuid.v4()
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
          externalId: expect.any(String),
          template: 'FriendRequest'
        }
      ]);
    });

    it('should return news notifications with content', async () => {
      const admin = await createUser('Admin', 'ADM');
      const receiver = await createUser('Receiver', 'RFC');

      const news = await NewsDAO.insert({
        fk_author_id: admin.id,
        title: 'Important News',
        content: 'This is important news content'
      });

      const externalId = uuid.v4();
      await NotificationDAO.insert({
        fk_sender_id: admin.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.News,
        vfk_content_id: news.id,
        external_id: externalId
      });

      const result = await NotificationService.getNotifications(receiver);

      expect(result.notifications.length).toBe(1);
      expect(result.notifications[0]).toEqual(
        expect.objectContaining({
          sender: expect.objectContaining({
            name: 'Admin',
            friend_code: 'ADM'
          }),
          receiver: expect.objectContaining({
            name: 'Receiver',
            friend_code: 'RFC'
          }),
          template: NotificationType.News,
          externalId,
          news: expect.objectContaining({
            author: 'Admin',
            authorAvatar: 'default',
            title: 'Important News',
            content: 'This is important news content'
          })
        })
      );
    });

    it('should return an empty array if the user has no notifications', async () => {
      const user = await createUser('Lonely User', 'LFC');
      const result = await NotificationService.getNotifications(user);
      expect(result.notifications).toEqual([]);
    });
  });

  describe('dismissNotification', () => {
    it('should delete a notification by external ID', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');

      const externalId = uuid.v4();
      await NotificationDAO.insert({
        fk_sender_id: sender.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.FriendRequest,
        external_id: externalId
      });

      let notifications = await NotificationDAO.findMultiple({ external_id: externalId });
      expect(notifications.length).toBe(1);

      await NotificationService.dismissNotification(externalId);

      notifications = await NotificationDAO.findMultiple({ external_id: externalId });
      expect(notifications.length).toBe(0);
    });
  });

  describe('getNewsNotifications', () => {
    it('should return all news notifications', async () => {
      const admin = await createUser('Admin', 'ADM');

      await NewsDAO.insert({
        fk_author_id: admin.id,
        title: 'Test News 1',
        content: 'This is test news 1'
      });

      await NewsDAO.insert({
        fk_author_id: admin.id,
        title: 'Test News 2',
        content: 'This is test news 2'
      });

      const newsNotifications = await NotificationService.getNewsNotifications();

      expect(newsNotifications.length).toBe(2);
      expect(newsNotifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            author: 'Admin',
            authorAvatar: 'default',
            title: 'Test News 1',
            content: 'This is test news 1'
          }),
          expect.objectContaining({
            author: 'Admin',
            authorAvatar: 'default',
            title: 'Test News 2',
            content: 'This is test news 2'
          })
        ])
      );
    });

    it('should return an empty array if there are no news', async () => {
      const newsNotifications = await NotificationService.getNewsNotifications();
      expect(newsNotifications).toEqual([]);
    });
  });

  describe('addNewsNotification', () => {
    it('should create a news and notifications for all users', async () => {
      const admin = await createUser('Admin', 'ADM');
      admin.role = Roles.Admin;

      const user1 = await createUser('User1', 'USR1');
      const user2 = await createUser('User2', 'USR2');

      const newsRequest: NewsNotificationRequest = {
        title: 'Breaking News',
        content: 'Something important happened!',
        authorExternalId: admin.external_id
      };

      await NotificationService.addNewsNotification({
        admin,
        newsRequest
      });

      // Verify news was created
      const newsItems = await NewsDAO.findMultiple();
      expect(newsItems.length).toBe(1);
      expect(newsItems[0]).toEqual(
        expect.objectContaining({
          title: 'Breaking News',
          content: 'Something important happened!',
          fk_author_id: admin.id
        })
      );

      // Verify notifications were created for all users
      const notifications = await NotificationDAO.findMultiple();
      expect(notifications.length).toBe(3); // For admin, user1, and user2

      // Check user-specific notifications
      const user1Notifications = await NotificationDAO.findMultiple({ fk_receiver_id: user1.id });
      expect(user1Notifications.length).toBe(1);
      expect(user1Notifications[0].template).toBe(NotificationType.News);
      expect(user1Notifications[0].vfk_content_id).toBe(newsItems[0].id);

      const user2Notifications = await NotificationDAO.findMultiple({ fk_receiver_id: user2.id });
      expect(user2Notifications.length).toBe(1);

      const adminNotifications = await NotificationDAO.findMultiple({ fk_receiver_id: admin.id });
      expect(adminNotifications.length).toBe(1);
    });
  });
});
