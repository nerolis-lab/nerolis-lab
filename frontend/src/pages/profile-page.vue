<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Profile </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h5" style="text-wrap: nowrap"> About Me </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row class="flex-column">
            <v-col class="flex-center">
              <UserAvatar @update-avatar="updateAvatar" />
            </v-col>
            <v-col class="flex-center">
              <UserName @update-name="updateName" />
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h5" style="text-wrap: nowrap"> Details </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>
          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">User ID: </span>
            </v-col>
            <v-col cols="auto" class="flex-center">
              <span class="text-center">{{ userStore.externalId }}</span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import UserAvatar from '@/components/account/user-avatar.vue'
import UserName from '@/components/account/user-name.vue'
import { UserService } from '@/services/user/user-service'
import { userAvatar } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProfilePage',
  components: {
    UserName,
    UserAvatar
  },
  setup() {
    const userStore = useUserStore()
    return { userStore, userAvatar }
  },
  methods: {
    async updateName(newName: string) {
      await UserService.updateUser({ name: newName })
    },
    async updateAvatar(newAvatar: string) {
      await UserService.updateUser({ avatar: newAvatar })
    }
  }
})
</script>

<style lang="scss">
.avatar-badge .v-badge__badge {
  box-shadow: 0 1px 1px #000;
}
</style>
