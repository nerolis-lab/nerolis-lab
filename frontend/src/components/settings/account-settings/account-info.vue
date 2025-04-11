<template>
  <v-card class="frosted-glass" rounded="lg">
    <v-card-title class="pb-2">
      <v-icon icon="mdi-account" class="mr-2" color="strength" />
      Profile Information
    </v-card-title>

    <v-card-text>
      <div :class="[isMobile ? 'flex-center' : 'flex-top', 'flex-column', 'mb-6']">
        <v-avatar size="80" :image="avatarStore.getAvatarPath(userStore.avatar ?? 'default')"> </v-avatar>
        <span class="text-h6">{{ userStore.name }}</span>
      </div>

      <div>
        <v-icon icon="mdi-badge-account" size="small" class="mr-2" color="info" />
        <span class="profile-label">User ID:</span>
        <span class="profile-value">{{ userStore.externalId || 'Unknown' }}</span>
        <v-btn
          v-if="userStore.externalId"
          density="comfortable"
          icon="mdi-content-copy"
          size="small"
          variant="text"
          class="ml-1 profile-value"
          @click="copyToClipboard(userStore.externalId, 'User ID')"
          :disabled="copySuccess"
        >
          <v-icon v-if="copySuccess" icon="mdi-check" color="success" />
          <v-icon v-else icon="mdi-content-copy" />
        </v-btn>
      </div>

      <!-- <div v-if="userStore.friendCode">
        <v-icon icon="mdi-account-group" size="small" class="mr-2" color="success" />
        <span class="profile-label">Friend Code:</span>
        <span class="profile-value">{{ userStore.friendCode || 'None' }}</span>
        <v-btn
          density="comfortable"
          icon
          size="small"
          class="ml-1 profile-value"
          variant="text"
          @click="copyToClipboard(userStore.friendCode, 'Friend code')"
          :disabled="copySuccess"
        >
          <v-icon v-if="copySuccess" icon="mdi-check" color="success" />
          <v-icon v-else icon="mdi-content-copy" />
        </v-btn>
      </div> -->

      <div>
        <v-icon icon="mdi-shield-account" size="small" class="mr-2" color="warning" />
        <span class="profile-label">Role:</span>
        <span class="profile-value">{{ formatRole(userStore.role) }}</span>
      </div>

      <div class="mt-4">
        <span class="fine-print"
          >Change your profile settings on your <a class="simple" href="/profile">profile</a>.</span
        >
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { success } from '@/components/snackbar/snackbar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useUserStore } from '@/stores/user-store'
import { Roles } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountInfo',
  setup() {
    const userStore = useUserStore()
    const avatarStore = useAvatarStore()
    const { isMobile } = useBreakpoint()
    return { userStore, avatarStore, isMobile }
  },
  data() {
    return {
      copySuccess: false
    }
  },
  methods: {
    formatRole(role: Roles | string | undefined) {
      if (!role) return 'Member'

      const roleMap: Record<string, string> = {
        [Roles.Admin]: 'Administrator',
        [Roles.Default]: 'Member',
        [Roles.Supporter]: 'Supporter'
      }

      return roleMap[role] || role
    },
    async copyToClipboard(text: string, label: string) {
      try {
        await navigator.clipboard.writeText(text)
        this.copySuccess = true
        success(`${label} copied to clipboard!`)

        setTimeout(() => {
          this.copySuccess = false
        }, 2000)
      } catch (error) {
        console.error(`Failed to copy ${label}:`, error)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.profile-label {
  font-weight: 500;
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.profile-value {
  color: rgba(255, 255, 255, 0.6);
}

@media (min-width: $desktop) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .avatar-container {
    margin-right: 24px;
    margin-bottom: 0;
  }

  .profile-name {
    text-align: left;
    margin-bottom: 24px;
  }
}
</style>
