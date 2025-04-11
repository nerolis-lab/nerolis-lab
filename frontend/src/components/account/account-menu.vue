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
        <LoginMenu />
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import LoginMenu from '@/components/login/login-menu.vue'
import { userAvatar } from '@/services/utils/image-utils'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountMenu',
  components: {
    LoginMenu
  },
  setup() {
    const userStore = useUserStore()

    return { userStore, userAvatar, Roles }
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

.g-btn-wrapper {
  display: block;
}
</style>
