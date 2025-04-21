import serverAxios from '@/router/server-axios'
import { useFriendStore } from '@/stores/friend-store/friend-store'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FriendService } from './friend-service'

vi.mock('@/router/server-axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.spyOn(logger, 'error').mockImplementation(() => {})

describe('FriendService', () => {
  const mockFriends = [
    { name: 'Friend 1', friend_code: 'ABC123' },
    { name: 'Friend 2', friend_code: 'XYZ789' }
  ]
  let mockStore: ReturnType<typeof useFriendStore>

  beforeEach(() => {
    mockStore = useFriendStore()
    mockStore.sync = vi.fn()
  })

  describe('getFriends', () => {
    it('successfully fetches friends', async () => {
      vi.mocked(serverAxios.get).mockResolvedValue({
        data: { friends: mockFriends }
      })

      const result = await FriendService.getFriends()

      expect(serverAxios.get).toHaveBeenCalledWith('friends')
      expect(result).toEqual({ friends: mockFriends })
    })

    it('returns empty array on error', async () => {
      vi.mocked(serverAxios.get).mockRejectedValue(new Error('Network error'))

      const result = await FriendService.getFriends()

      expect(result).toEqual({ friends: [] })
      expect(logger.error).toHaveBeenCalledWith('Could not get friends from server')
    })
  })

  describe('acceptFriendRequest', () => {
    const friendCode = 'TEST123'

    it('successfully accepts friend request', async () => {
      vi.mocked(serverAxios.post).mockResolvedValue({})
      mockStore.sync = vi.fn().mockResolvedValue([])

      const result = await FriendService.acceptFriendRequest(friendCode)

      expect(serverAxios.post).toHaveBeenCalledWith(`friend/accept/${friendCode}`)
      expect(mockStore.sync).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('handles error when accepting friend request', async () => {
      vi.mocked(serverAxios.post).mockRejectedValue(new Error('Network error'))

      const result = await FriendService.acceptFriendRequest(friendCode)

      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith('Could not accept friend request')
      expect(mockStore.sync).not.toHaveBeenCalled()
    })

    it('handles store sync error after successful accept', async () => {
      vi.mocked(serverAxios.post).mockResolvedValue({})
      mockStore.sync = vi.fn().mockRejectedValue(new Error('Sync failed'))

      const result = await FriendService.acceptFriendRequest(friendCode)

      expect(serverAxios.post).toHaveBeenCalledWith(`friend/accept/${friendCode}`)
      expect(mockStore.sync).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('declineFriendRequest', () => {
    const friendCode = 'TEST123'

    it('successfully declines friend request', async () => {
      vi.mocked(serverAxios.post).mockResolvedValue({})
      mockStore.sync = vi.fn().mockResolvedValue([])

      const result = await FriendService.declineFriendRequest(friendCode)

      expect(serverAxios.post).toHaveBeenCalledWith(`friend/decline/${friendCode}`)
      expect(mockStore.sync).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('handles error when declining friend request', async () => {
      vi.mocked(serverAxios.post).mockRejectedValue(new Error('Network error'))

      const result = await FriendService.declineFriendRequest(friendCode)

      expect(result).toBe(false)
      expect(logger.error).toHaveBeenCalledWith('Could not decline friend request')
      expect(mockStore.sync).not.toHaveBeenCalled()
    })

    it('handles store sync error after successful decline', async () => {
      vi.mocked(serverAxios.post).mockResolvedValue({})
      mockStore.sync = vi.fn().mockRejectedValue(new Error('Sync failed'))

      const result = await FriendService.declineFriendRequest(friendCode)

      expect(serverAxios.post).toHaveBeenCalledWith(`friend/decline/${friendCode}`)
      expect(mockStore.sync).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
