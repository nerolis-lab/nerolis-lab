import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFriendStore } from './friend-store';
import { FriendService } from '@/services/friend-service/friend-service';

// Mock FriendService
vi.mock('@/services/friend-service/friend-service', () => ({
  FriendService: {
    getFriends: vi.fn(), // Mocked for completeness, though not directly tested here
    sendFriendRequest: vi.fn(),
    removeFriend: vi.fn(),
    // Mock other methods if the store starts using them
  },
}));

describe('useFriendStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  describe('actions', () => {
    describe('sendFriendRequest', () => {
      it('should set loading to true, call FriendService.sendFriendRequest, and return true on success', async () => {
        const store = useFriendStore();
        const friendCode = 'TESTCODE123';
        vi.mocked(FriendService.sendFriendRequest).mockResolvedValue(true);

        expect(store.loading).toBe(false);
        const promise = store.sendFriendRequest(friendCode);
        expect(store.loading).toBe(true); // Check loading state immediately after call
        
        const result = await promise;

        expect(FriendService.sendFriendRequest).toHaveBeenCalledWith(friendCode);
        expect(result).toBe(true);
        expect(store.loading).toBe(false); // Check loading state after completion
      });

      it('should set loading to true, call FriendService.sendFriendRequest, and return false on failure', async () => {
        const store = useFriendStore();
        const friendCode = 'FAILCODE123';
        vi.mocked(FriendService.sendFriendRequest).mockResolvedValue(false);

        expect(store.loading).toBe(false);
        const promise = store.sendFriendRequest(friendCode);
        expect(store.loading).toBe(true);

        const result = await promise;

        expect(FriendService.sendFriendRequest).toHaveBeenCalledWith(friendCode);
        expect(result).toBe(false);
        expect(store.loading).toBe(false);
      });

      it('should set loading to false even if FriendService.sendFriendRequest throws an error', async () => {
        const store = useFriendStore();
        const friendCode = 'ERRORCODE123';
        vi.mocked(FriendService.sendFriendRequest).mockRejectedValue(new Error('Network error'));

        expect(store.loading).toBe(false);
        
        // Action is expected to catch error and return false (based on service impl)
        // If store action re-throws, test with try/catch or .rejects
        await expect(store.sendFriendRequest(friendCode)).resolves.toBe(false);
        
        expect(FriendService.sendFriendRequest).toHaveBeenCalledWith(friendCode);
        expect(store.loading).toBe(false);
      });
    });

    describe('removeFriend', () => {
      it('should set loading to true, call FriendService.removeFriend, and return true on success', async () => {
        const store = useFriendStore();
        const friendCode = 'REMOVECODE123';
        vi.mocked(FriendService.removeFriend).mockResolvedValue(true);

        expect(store.loading).toBe(false);
        const promise = store.removeFriend(friendCode);
        expect(store.loading).toBe(true);

        const result = await promise;

        expect(FriendService.removeFriend).toHaveBeenCalledWith(friendCode);
        expect(result).toBe(true);
        expect(store.loading).toBe(false);
      });

      it('should set loading to true, call FriendService.removeFriend, and return false on failure', async () => {
        const store = useFriendStore();
        const friendCode = 'FAILREMOVE123';
        vi.mocked(FriendService.removeFriend).mockResolvedValue(false);

        expect(store.loading).toBe(false);
        const promise = store.removeFriend(friendCode);
        expect(store.loading).toBe(true);

        const result = await promise;

        expect(FriendService.removeFriend).toHaveBeenCalledWith(friendCode);
        expect(result).toBe(false);
        expect(store.loading).toBe(false);
      });

      it('should set loading to false even if FriendService.removeFriend throws an error', async () => {
        const store = useFriendStore();
        const friendCode = 'ERRORREMOVE123';
        vi.mocked(FriendService.removeFriend).mockRejectedValue(new Error('Network error'));
        
        await expect(store.removeFriend(friendCode)).resolves.toBe(false);

        expect(FriendService.removeFriend).toHaveBeenCalledWith(friendCode);
        expect(store.loading).toBe(false);
      });
    });
  });
});
