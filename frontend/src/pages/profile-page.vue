<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card
          rounded="xl"
          class="pb-4 frosted-glass"
          :class="{ 'supporter-card': userStore.isSupporter, 'admin-card': userStore.isAdmin }"
        >
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Profile </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col cols="auto" class="flex-center text-h5 text-no-wrap"> About Me </v-col>
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

          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">Supporter status: </span>
            </v-col>
            <v-col cols="auto" class="flex-center">
              <span :class="['text-center', userStore.supporterSince ? 'text-supporter' : 'text-grey']">{{
                userStore.supporterSince ? 'Active' : 'Inactive'
              }}</span>
            </v-col>
          </v-row>

          <v-row v-if="userStore.supporterSince" dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">Supporter since: </span>
            </v-col>
            <v-col cols="auto" class="flex-center">
              <span class="text-center text-supporter">{{ supporterSince }}</span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="userStore.isAdminOrSupporter">
      <v-col cols="12">
        <div class="d-flex align-center justify-center">
          <v-icon class="mr-2" :color="userStore.roleData.color">mdi-star</v-icon>
          <span :class="['font-weight-bold', `text-${userStore.roleData.color}`]">Thank you for your support!</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import UserAvatar from '@/components/account/user-avatar.vue'
import UserName from '@/components/account/user-name.vue'
import { UserService } from '@/services/user/user-service'
import { TimeUtils } from '@/services/utils/time-utils'
import { useUserStore } from '@/stores/user-store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ProfilePage',
  components: {
    UserName,
    UserAvatar
  },
  setup() {
    const userStore = useUserStore()
    const userAvatar = computed(() => userStore.avatar)

    return { userStore, userAvatar }
  },
  methods: {
    async updateName(newName: string) {
      await UserService.updateUser({ name: newName })
    },
    async updateAvatar(newAvatar: string) {
      await UserService.updateUser({ avatar: newAvatar })
    }
  },
  computed: {
    supporterSince(): string | null {
      return this.userStore.supporterSince && TimeUtils.extractDate(this.userStore.supporterSince)
    }
  }
})
</script>

<style lang="scss">
.supporter-card {
  box-shadow: 0 4px 20px rgba(var(--v-theme-strength), 0.3) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(var(--v-theme-strength), 0.4) !important;
  }
}

.admin-card {
  box-shadow: 0 4px 20px rgba(var(--v-theme-admin), 0.3) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(var(--v-theme-admin), 0.4) !important;
  }
}
</style>
