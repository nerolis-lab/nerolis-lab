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
    },
    async sendFriendRequest(friendCode: string): Promise<boolean> {
      this.loading = true;
      try {
        const result = await FriendService.sendFriendRequest(friendCode);
        // FriendService.sendFriendRequest calls sync() internally, which will update this.friends
        return result;
      } finally {
        this.loading = false;
      }
    },
    async removeFriend(friendCode: string): Promise<boolean> {
      this.loading = true;
      try {
        const result = await FriendService.removeFriend(friendCode);
        // FriendService.removeFriend calls sync() internally, which will update this.friends
        return result;
      } finally {
        this.loading = false;
      }
    }
  },
  persist: true
})
