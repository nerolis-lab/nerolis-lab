import serverAxios from '@/router/server-axios'
import { useFriendStore } from '@/stores/friend-store/friend-store'
import type { GetFriendsResponse } from 'sleepapi-common'

class FriendServiceImpl {
  public async getFriends(): Promise<GetFriendsResponse> {
    try {
      const response = await serverAxios.get<GetFriendsResponse>('friends')
      return response.data
    } catch {
      logger.error('Could not get friends from server')
      return { friends: [] }
    }
  }

  public async acceptFriendRequest(friendCode: string): Promise<boolean> {
    try {
      await serverAxios.post(`friend/accept/${friendCode}`)

      const friendStore = useFriendStore()
      await friendStore.sync()

      return true
    } catch {
      logger.error('Could not accept friend request')
      return false
    }
  }

  public async declineFriendRequest(friendCode: string): Promise<boolean> {
    try {
      await serverAxios.post(`friend/decline/${friendCode}`)

      const friendStore = useFriendStore()
      await friendStore.sync()

      return true
    } catch {
      logger.error('Could not decline friend request')
      return false
    }
  }
}

export const FriendService = new FriendServiceImpl()
