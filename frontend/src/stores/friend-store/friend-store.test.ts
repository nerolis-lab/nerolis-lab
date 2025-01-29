import { FriendService } from '@/services/friend-service/friend-service'
import { createPinia, setActivePinia } from 'pinia'
import type { BaseUser } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFriendStore } from './friend-store'

vi.mock('@/services/friend-service/friend-service', () => ({
  FriendService: {
    getFriends: vi.fn()
  }
}))

describe('useFriendStore', () => {
  let store: ReturnType<typeof useFriendStore>

  const mockFriends: BaseUser[] = [
    {
      name: 'Test Friend 1',
      friend_code: 'ABC123'
    },
    {
      name: 'Test Friend 2',
      friend_code: 'XYZ789'
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useFriendStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct default state', () => {
      expect(store.friends).toEqual([])
      expect(store.loading).toBe(false)
    })
  })

  describe('actions', () => {
    describe('sync', () => {
      it('fetches friends and updates state', async () => {
        vi.mocked(FriendService.getFriends).mockResolvedValue({
          friends: mockFriends
        })

        const result = await store.sync()

        expect(FriendService.getFriends).toHaveBeenCalledTimes(1)
        expect(store.friends).toEqual(mockFriends)
        expect(store.loading).toBe(false)
        expect(result).toEqual(mockFriends)
      })

      it('handles empty friends array', async () => {
        vi.mocked(FriendService.getFriends).mockResolvedValue({
          friends: []
        })

        const result = await store.sync()

        expect(store.friends).toEqual([])
        expect(store.loading).toBe(false)
        expect(result).toEqual([])
      })

      it('sets loading state during sync', async () => {
        vi.mocked(FriendService.getFriends).mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0))
          return { friends: mockFriends }
        })

        const syncPromise = store.sync()

        expect(store.loading).toBe(true)

        await syncPromise

        expect(store.loading).toBe(false)
      })
    })
  })
})
