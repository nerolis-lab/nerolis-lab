<template>
  <v-container style="max-width: 600px">
    <v-card class="frosted-glass-light" :loading="friendStore.loading">
      <v-row class="flex-center ma-0">
        <v-col class="flex-center">
          <v-card
            elevation="0"
            variant="flat"
            class="text-h5 font-weight-medium w-100 flex-center"
            height="50px"
            color="surface"
          >
            Friends
          </v-card>
        </v-col>
        <v-col cols="auto">
          <v-btn rounded="pill" color="surface" elevation="0" height="40">
            <v-icon size="24">mdi-account-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-sheet width="100%" :height="150" class="frosted-glass-light mt-2 flex-center" style="overflow: hidden">
        <v-avatar color="secondary" size="180">
          <v-img :src="userAvatar()"></v-img>
        </v-avatar>

        <!-- TODO: styling and add pencil edit for premium members and also explain why it's disabled if it is -->
        Your friend code: {{ userStore.friendCode }}
      </v-sheet>

      <v-divider />

      <v-list>
        <v-list-item v-for="(friend, index) in friends" :key="index" class="flex-left">
          <v-row class="flex-center">
            <v-col cols="auto">
              <v-avatar>
                <v-img :src="avatarStore.getAvatarPath(friend.avatar ?? 'default')"></v-img>
              </v-avatar>

              <v-list-item-title>{{ friend.name }}</v-list-item-title>
            </v-col>
            <v-col> Some description about user, maybe last login </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import CustomLabel from '@/components/custom-components/custom-label.vue'
import { userAvatar } from '@/services/utils/image-utils'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useFriendStore } from '@/stores/friend-store/friend-store'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FriendsPage',
  components: {
    CustomLabel
  },
  setup() {
    const userStore = useUserStore()
    const friendStore = useFriendStore()
    const avatarStore = useAvatarStore()

    return { userStore, friendStore, avatarStore, userAvatar }
  },
  mounted() {
    this.friendStore.sync()
  },
  computed: {
    friends() {
      return this.friendStore.friends
    }
  }
})
</script>
