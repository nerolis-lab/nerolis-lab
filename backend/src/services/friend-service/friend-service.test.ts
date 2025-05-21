import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { BadRequestError, ForbiddenError } from '@src/domain/error/api/api-error.js';
import { DatabaseInsertError } from '@src/domain/error/database/database-error.js';
import { FriendService } from '@src/services/friend-service/friend-service.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { NotificationType, Roles, uuid, type Logger } from 'sleepapi-common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  global.logger = {
    debug: vi.fn() as unknown,
    log: vi.fn() as unknown,
    info: vi.fn() as unknown,
    warn: vi.fn() as unknown,
    error: vi.fn() as unknown
  } as Logger;
});

vi.mock('@src/services/user-service/login-service/providers/patreon/patreon-provider.js', () => ({
  PatreonProvider: {
    isSupporter: vi.fn()
  }
}));

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

  describe('validateFriendCodeUpdate', () => {
    it('should successfully validate for a supporter with a valid code', async () => {
      const user = mocks.dbUser({ patreon_id: 'patreon-id' });
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Supporter, patronSince: null });

      await expect(FriendService.validateFriendCodeUpdate(user, 'VALID6')).resolves.toBeUndefined();
    });

    it('should throw BadRequestError for invalid friend code format', async () => {
      const user = mocks.dbUser({ patreon_id: 'patreon-id' });

      await expect(FriendService.validateFriendCodeUpdate(user, 'short')).rejects.toThrow(BadRequestError);
      await expect(FriendService.validateFriendCodeUpdate(user, 'INVALID!')).rejects.toThrow(BadRequestError);
    });

    it('should throw ForbiddenError if patreon_id is missing', async () => {
      const user = mocks.dbUser({ patreon_id: undefined });

      await expect(FriendService.validateFriendCodeUpdate(user, 'VALID6')).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError if user is not a supporter', async () => {
      const user = mocks.dbUser({ patreon_id: 'patreon-id', role: Roles.Default });
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Default, patronSince: null });

      await expect(FriendService.validateFriendCodeUpdate(user, 'VALID6')).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to update friend code', async () => {
      const user = mocks.dbUser({ patreon_id: 'patreon-id', role: Roles.Admin });
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Admin, patronSince: null });

      await expect(FriendService.validateFriendCodeUpdate(user, 'ADMIN6')).resolves.toBeUndefined();
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
