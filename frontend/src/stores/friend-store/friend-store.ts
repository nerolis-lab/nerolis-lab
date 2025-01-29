import { FriendService } from '@/services/friend-service/friend-service'
import { defineStore } from 'pinia'
import type { BaseUser } from 'sleepapi-common'

export interface FriendState {
  friends: BaseUser[]
  loading: boolean
}

export const useFriendStore = defineStore('friend', {
  state: (): FriendState => {
    return {
      friends: [],
      loading: false
    }
  },
  actions: {
    async sync(): Promise<BaseUser[]> {
      this.loading = true

      const response = await FriendService.getFriends()
      this.friends = response.friends

      this.loading = false
      return this.friends
    }
  },
  persist: true
})
