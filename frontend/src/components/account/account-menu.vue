<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" width="250px">
    <template #activator="{ props }">
      <v-btn v-bind="props" id="navBarIcon" icon>
        <v-avatar
          v-if="userStore.loggedIn"
          variant="outlined"
          :color="userStore.roleData.color"
          size="40"
          :class="borderClass"
        >
          <img :src="userAvatar()" alt="User Profile Picture" height="24px" style="transform: scale(1.4)" />
        </v-avatar>
        <v-icon v-else size="24">mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-card id="accountMenu">
      <v-col cols="auto" class="flex-column flex-center">
        <v-avatar
          size="72"
          variant="outlined"
          :color="userStore.roleData.color"
          class="mb-2 bg-background"
          :class="borderClass"
        >
          <img
            v-if="userStore.loggedIn"
            :src="userAvatar()"
            alt="User Profile Picture"
            style="width: 100%; height: 100%; object-fit: cover"
          />
          <v-icon v-else size="48">mdi-account-circle</v-icon>
        </v-avatar>

        <h6 class="text-h6">{{ userStore.name }}</h6>
        <div v-if="userStore.roleData.text" class="flex-center">
          <v-icon :icon="userStore.roleData.icon" :color="userStore.roleData.color" size="16" />
          <span :class="['font-weight-semibold', `text-${userStore.roleData.color}`, 'role-title']">{{
            userStore.roleData.text
          }}</span>
        </div>
      </v-col>

      <v-divider />

      <v-list>
        <v-list-item :to="'/profile'" :disabled="!userStore.loggedIn" prepend-icon="mdi-account-box" @click="toggleMenu"
          >Profile</v-list-item
        >
        <!-- <v-list-item
          :to="'/friends'"
          :disabled="!userStore.loggedIn"
          prepend-icon="mdi-account-heart"
          @click="toggleMenu"
          >Friends</v-list-item
        > -->
      </v-list>

      <v-divider />

      <v-list>
        <v-list-item v-if="!userStore.loggedIn">
          <GoogleLogin :callback="googleCallback" style="width: 100%">
            <v-card title="Login" class="text-center" rounded="xl" color="#181717" style="cursor: pointer">
              <template #prepend>
                <GoogleIcon />
              </template>
              <template #append>
                <v-icon size="24">mdi-open-in-new</v-icon>
              </template>
            </v-card>
          </GoogleLogin>
        </v-list-item>

        <v-list-item v-if="!userStore.loggedIn">
          <v-card
            title="Login"
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
        </v-list-item>

        <v-list-item v-else id="logoutButton" prepend-icon="mdi-logout" @click="logout"> Log out </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import DiscordIcon from '@/components/icons/icon-discord.vue'
import GoogleIcon from '@/components/icons/icon-google.vue'
import { loginWithDiscord } from '@/services/login/discord-service'
import { googleCallback } from '@/services/login/google-service'
import { userAvatar } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent } from 'vue'
import { GoogleLogin } from 'vue3-google-login'

export default defineComponent({
  name: 'AccountMenu',
  components: {
    GoogleLogin,
    GoogleIcon,
    DiscordIcon
  },
  setup() {
    const userStore = useUserStore()

    return { userStore, userAvatar, Roles, googleCallback, loginWithDiscord }
  },
  data: () => ({
    menu: false
  }),
  async mounted() {
    if (this.userStore.loggedIn) {
      await this.userStore.syncUserSettings()
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
      this.toggleMenu()
    },
    toggleMenu() {
      this.menu = !this.menu
    }
  },
  computed: {
    borderClass() {
      return this.userStore.isAdmin ? 'admin-avatar' : this.userStore.isSupporter ? 'supporter-avatar' : ''
    }
  }
})
</script>

<style lang="scss" scoped>
.supporter-avatar {
  border-color: var(--v-theme-strength) !important;
  border-width: 2px;
  box-shadow: 0 0 10px rgba(var(--v-theme-strength), 0.6);
}

.admin-avatar {
  border-color: var(--v-theme-primary) !important;
  border-width: 2px;
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.6);
}

.role-title {
  padding-right: 2px;
}
</style>
