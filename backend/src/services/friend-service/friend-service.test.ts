import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { DatabaseInsertError } from '@src/domain/error/database/database-error.js';
import { FriendService } from '@src/services/friend-service/friend-service.js';
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
    google_id: uuid.v4()
  });
};

describe('FriendService', () => {
  describe('getFriends', () => {
    it("should return the user's friends", async () => {
      const user1 = await createUser('User One', 'FC1');
      const user2 = await createUser('User Two', 'FC2');
      await FriendDAO.insert({ fk_user1_id: user1.id, fk_user2_id: user2.id });

      const result = await FriendService.getFriends(user1);
      expect(result.friends).toEqual([expect.objectContaining({ name: 'User Two', friend_code: 'FC2' })]);
    });

    it('should return an empty array if the user has no friends', async () => {
      const user = await createUser('Lonely User', 'FC3');
      const result = await FriendService.getFriends(user);
      expect(result.friends).toEqual([]);
    });
  });

  describe('sendRequest', () => {
    it('should send a friend request successfully', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');

      await FriendService.sendRequest(sender, 'RFC');
      const request = await NotificationDAO.find({ fk_sender_id: sender.id, fk_receiver_id: receiver.id });
      expect(request).toBeTruthy();
    });

    it('should throw an error if users are already connected', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');
      await FriendDAO.insert({ fk_user1_id: sender.id, fk_user2_id: receiver.id });

      await expect(FriendService.sendRequest(sender, 'RFC')).rejects.toThrow(DatabaseInsertError);
    });
  });

  describe('acceptRequest', () => {
    it('should accept a friend request and add the users as friends', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');
      await NotificationDAO.insert({
        fk_sender_id: sender.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.FriendRequest,
        external_id: uuid.v4()
      });

      await FriendService.acceptRequest(receiver, 'SFC');
      const friendship = await FriendDAO.find({ fk_user1_id: sender.id, fk_user2_id: receiver.id });
      expect(friendship).toBeTruthy();
    });
  });

  describe('declineRequest', () => {
    it('should delete a friend request when declined', async () => {
      const sender = await createUser('Sender', 'SFC');
      const receiver = await createUser('Receiver', 'RFC');
      await NotificationDAO.insert({
        fk_sender_id: sender.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.FriendRequest,
        external_id: uuid.v4()
      });

      await FriendService.declineRequest(receiver, 'SFC');
      const request = await NotificationDAO.find({ fk_sender_id: sender.id, fk_receiver_id: receiver.id });
      expect(request).toBeUndefined();
    });
  });
});
