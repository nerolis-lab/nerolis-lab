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

  public async sendFriendRequest(friendCode: string): Promise<boolean> {
    try {
      await serverAxios.post(`friend/request/${friendCode}`)

      const friendStore = useFriendStore()
      await friendStore.sync()

      return true
    } catch (err) {
      logger.error('Could not send friend request', err)
      return false
    }
  }

  public async removeFriend(friendCode: string): Promise<boolean> {
    try {
      await serverAxios.delete(`friend/remove/${friendCode}`)

      const friendStore = useFriendStore()
      await friendStore.sync()

      return true
    } catch (err) {
      logger.error('Could not remove friend', err)
      return false
    }
  }
}

export const FriendService = new FriendServiceImpl()
