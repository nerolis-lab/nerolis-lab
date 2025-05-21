import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { FriendDAO } from '@src/database/dao/friend/friend-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js'; // For completeness if other tests are added
import { FriendService, UserNotFoundError, CannotRemoveSelfError, FriendshipNotFoundError } from './friend-service';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { DatabaseNotFoundError } from '@src/domain/error/database/database-error'; // Assuming UserDAO.get throws this

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DAOs
vi.mock('@src/database/dao/user/user-dao.js');
vi.mock('@src/database/dao/friend/friend-dao.js');
vi.mock('@src/database/dao/notification/notification-dao.js'); // Mock even if not directly used by removeFriend for consistency

describe('FriendService', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  const mockUser: DBUser = {
    id: 1,
    version: 1,
    name: 'Test User',
    friend_code: 'USER01',
    external_id: 'user-external-id',
    role: 'USER',
  };

  const mockFriend: DBUser = {
    id: 2,
    version: 1,
    name: 'Test Friend',
    friend_code: 'FRIEND01',
    external_id: 'friend-external-id',
    role: 'USER',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('removeFriend', () => {
    it('should successfully remove a friend (found on first delete attempt)', async () => {
      vi.mocked(UserDAO.get).mockResolvedValue(mockFriend);
      vi.mocked(FriendDAO.delete)
        .mockResolvedValueOnce(1); // First attempt (user1, friend2) succeeds

      await expect(FriendService.removeFriend(mockUser, mockFriend.friend_code)).resolves.toBeUndefined();

      expect(UserDAO.get).toHaveBeenCalledWith({ friend_code: mockFriend.friend_code });
      expect(FriendDAO.delete).toHaveBeenCalledTimes(1);
      expect(FriendDAO.delete).toHaveBeenCalledWith({
        fk_user1_id: mockUser.id,
        fk_user2_id: mockFriend.id,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(`User [${mockUser.id}] attempting to remove friend with code [${mockFriend.friend_code}]`);
      expect(consoleLogSpy).toHaveBeenCalledWith(`Successfully removed friendship between user [${mockUser.id}] and user [${mockFriend.id}]. Deleted records: 1`);
    });

    it('should successfully remove a friend (found on second delete attempt)', async () => {
      vi.mocked(UserDAO.get).mockResolvedValue(mockFriend);
      vi.mocked(FriendDAO.delete)
        .mockResolvedValueOnce(0) // First attempt (user1, friend2) fails
        .mockResolvedValueOnce(1); // Second attempt (friend2, user1) succeeds

      await expect(FriendService.removeFriend(mockUser, mockFriend.friend_code)).resolves.toBeUndefined();

      expect(UserDAO.get).toHaveBeenCalledWith({ friend_code: mockFriend.friend_code });
      expect(FriendDAO.delete).toHaveBeenCalledTimes(2);
      expect(FriendDAO.delete).toHaveBeenNthCalledWith(1, {
        fk_user1_id: mockUser.id,
        fk_user2_id: mockFriend.id,
      });
      expect(FriendDAO.delete).toHaveBeenNthCalledWith(2, {
        fk_user1_id: mockFriend.id,
        fk_user2_id: mockUser.id,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(`Successfully removed friendship between user [${mockUser.id}] and user [${mockFriend.id}]. Deleted records: 1`);
    });

    it('should throw UserNotFoundError if the friend to remove is not found', async () => {
      const friendCodeToRemove = 'UNKNOWNCODE';
      // UserDAO.get throws DatabaseNotFoundError, which FriendService catches and re-throws as UserNotFoundError
      vi.mocked(UserDAO.get).mockRejectedValue(new DatabaseNotFoundError('User not found'));

      await expect(FriendService.removeFriend(mockUser, friendCodeToRemove))
        .rejects.toThrow(UserNotFoundError);
      await expect(FriendService.removeFriend(mockUser, friendCodeToRemove))
        .rejects.toThrow(`User with friend code [${friendCodeToRemove}] not found.`);
      
      expect(UserDAO.get).toHaveBeenCalledWith({ friend_code: friendCodeToRemove });
      expect(FriendDAO.delete).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should throw CannotRemoveSelfError if the user tries to remove themselves', async () => {
      vi.mocked(UserDAO.get).mockResolvedValue(mockUser); // Friend to remove is the user themselves

      await expect(FriendService.removeFriend(mockUser, mockUser.friend_code))
        .rejects.toThrow(CannotRemoveSelfError);
      await expect(FriendService.removeFriend(mockUser, mockUser.friend_code))
        .rejects.toThrow(`User [${mockUser.id}] cannot remove themselves.`);

      expect(UserDAO.get).toHaveBeenCalledWith({ friend_code: mockUser.friend_code });
      expect(FriendDAO.delete).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should throw FriendshipNotFoundError if the friendship does not exist', async () => {
      vi.mocked(UserDAO.get).mockResolvedValue(mockFriend);
      vi.mocked(FriendDAO.delete)
        .mockResolvedValueOnce(0) // First attempt fails
        .mockResolvedValueOnce(0); // Second attempt also fails

      await expect(FriendService.removeFriend(mockUser, mockFriend.friend_code))
        .rejects.toThrow(FriendshipNotFoundError);
      await expect(FriendService.removeFriend(mockUser, mockFriend.friend_code))
        .rejects.toThrow(`Friendship not found between user [${mockUser.id}] and user [${mockFriend.id}].`);

      expect(UserDAO.get).toHaveBeenCalledWith({ friend_code: mockFriend.friend_code });
      expect(FriendDAO.delete).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });
});
