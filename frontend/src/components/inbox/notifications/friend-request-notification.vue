<template>
  <v-card
    :loading="loading"
    :title="notification.sender.name"
    subtitle="Sent you a friend request!"
    color="background"
    class="w-100"
    density="compact"
    style="opacity: 90%"
  >
    <template #prepend>
      <v-avatar size="36" color="surface">
        <v-img :src="avatarStore.getAvatarPath(notification.sender.avatar ?? 'default')" />
      </v-avatar>
    </template>

    <div class="flex-center">
      <v-btn variant="text" color="accent" @click="declineFriendRequest()">Decline</v-btn>
      <v-btn variant="text" color="primary" @click="acceptFriendRequest()">Accept</v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import { FriendService } from '@/services/friend-service/friend-service'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import type { UserNotification } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'FriendRequestNotification',
  props: {
    notification: {
      type: Object as PropType<UserNotification>,
      required: true
    }
  },
  setup() {
    const avatarStore = useAvatarStore()
    const notificationStore = useNotificationStore()

    const loading = false

    return { avatarStore, notificationStore, loading }
  },
  methods: {
    async acceptFriendRequest() {
      this.loading = true
      const accepted = await FriendService.acceptFriendRequest(this.notification.sender.friend_code)
      if (accepted) {
        await this.notificationStore.sync()
      }

      this.loading = false
    },
    async declineFriendRequest() {
      this.loading = true
      const declined = await FriendService.declineFriendRequest(this.notification.sender.friend_code)
      if (declined) {
        await this.notificationStore.sync()
      }
      this.loading = false
    }
  }
})
</script>
