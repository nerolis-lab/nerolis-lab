/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { MockService } from '@src/utils/test-utils/mock-service.js';
import { NotificationType } from 'sleepapi-common';
import { afterEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

afterEach(() => {
  MockService.restore();
});

describe('NotificationDAO insert', () => {
  it('shall insert new notification entity', async () => {
    const notification = await NotificationDAO.insert({
      fk_sender_id: 1,
      fk_receiver_id: 2,
      template: NotificationType.FriendRequest
    });
    expect(notification).toBeDefined();

    const data = await NotificationDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_sender_id: 1,
        fk_receiver_id: 2,
        template: NotificationType.FriendRequest,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without fk_sender_id', async () => {
    await expect(
      NotificationDAO.insert({
        fk_sender_id: undefined as any,
        fk_receiver_id: 2,
        template: NotificationType.FriendRequest
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: notification.fk_sender_id/);
  });

  it('shall fail to insert entity without fk_receiver_id', async () => {
    await expect(
      NotificationDAO.insert({
        fk_sender_id: 1,
        fk_receiver_id: undefined as any,
        template: NotificationType.FriendRequest
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: notification.fk_receiver_id/);
  });
});

describe('NotificationDAO update', () => {
  it('shall update notification entity', async () => {
    const notification = await NotificationDAO.insert({
      fk_sender_id: 1,
      fk_receiver_id: 2,
      template: NotificationType.FriendRequest
    });
    expect(notification.template).toEqual(NotificationType.FriendRequest);

    await NotificationDAO.update({ ...notification, template: NotificationType.News });

    const data = await NotificationDAO.findMultiple();
    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_sender_id: 1,
        fk_receiver_id: 2,
        template: NotificationType.News,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        version: 2
      })
    ]);
  });
});
