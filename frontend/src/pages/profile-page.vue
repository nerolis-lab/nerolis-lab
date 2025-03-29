<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" class="pb-4 frosted-glass" :class="{ 'supporter-card': userStore.isSupporter }">
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

          <v-row class="flex-center">
            <v-col cols="10">
              <v-divider />
            </v-col>
          </v-row>

          <!-- TODO: we need to support double identifiers -->
          <v-row class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">Google: </span>
            </v-col>
            <v-col v-if="userStore.isGoogleLinked" cols="auto" class="flex-center">
              <span class="text-center">{{ userStore.isGoogleLinked ? 'Yes' : 'No' }}</span>
            </v-col>
            <v-col v-else cols="auto" class="flex-center">
              <GoogleLogin :callback="googleCallback" style="width: 100%">
                <v-card title="Link Google" class="text-center" rounded="xl" color="#181717" style="cursor: pointer">
                  <template #prepend>
                    <GoogleIcon />
                  </template>
                  <template #append>
                    <v-icon size="24">mdi-open-in-new</v-icon>
                  </template>
                </v-card>
              </GoogleLogin>
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">Discord: </span>
            </v-col>
            <v-col v-if="userStore.isDiscordLinked" cols="auto" class="flex-center">
              <span class="text-center">{{ userStore.isDiscordLinked ? 'Yes' : 'No' }}</span>
            </v-col>
            <v-col v-else cols="auto" class="flex-center">
              <v-card
                title="Link Discord"
                class="text-center"
                rounded="xl"
                color="#5865F2"
                style="cursor: pointer"
                @click="loginWithDiscord"
              >
                <template #prepend>
                  <DiscordIcon />
                </template>
                <template #append>
                  <v-icon size="24">mdi-open-in-new</v-icon>
                </template>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="flex-center">
            <v-col cols="10">
              <v-divider />
            </v-col>
          </v-row>

          <v-row dense class="flex-center">
            <v-col cols="auto" class="flex-center">
              <span class="text-center font-weight-bold">Supporter status: </span>
            </v-col>
            <v-col cols="auto" class="flex-center">
              <span :class="['text-center', userStore.isSupporter ? 'text-supporter' : 'text-grey']">{{
                userStore.isSupporter ? 'Active' : 'Inactive'
              }}</span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="userStore.isSupporter">
      <v-col cols="12">
        <div class="d-flex align-center justify-center">
          <v-icon class="mr-2" color="supporter">mdi-star</v-icon>
          <span class="font-weight-bold text-supporter">Thank you for your support!</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import UserAvatar from '@/components/account/user-avatar.vue'
import UserName from '@/components/account/user-name.vue'
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GoogleIcon from '@/components/icons/icon-google.vue'
import { loginWithDiscord } from '@/services/login/discord-service'
import { googleCallback } from '@/services/login/google-service'
import { UserService } from '@/services/user/user-service'
import { userAvatar } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProfilePage',
  components: {
    UserName,
    UserAvatar,
    GoogleIcon,
    DiscordIcon
  },
  setup() {
    const userStore = useUserStore()
    return { userStore, userAvatar, googleCallback, loginWithDiscord }
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
.supporter-card {
  box-shadow: 0 4px 20px rgba(var(--v-theme-strength), 0.3) !important;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(var(--v-theme-strength), 0.4) !important;
  }
}
</style>
