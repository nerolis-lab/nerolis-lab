<template>
  <v-row :class="[isMobile ? 'flex-column' : '', 'mb-4']" dense>
    <v-col class="flex-center">
      <v-btn class="w-100" color="secondary" variant="elevated" prepend-icon="mdi-logout" @click="logout">
        LOGOUT
      </v-btn>
    </v-col>

    <v-col class="flex-center">
      <v-btn class="w-100" color="error-3" variant="elevated" prepend-icon="mdi-delete" @click="confirmDeleteAccount">
        DELETE ACCOUNT
      </v-btn>
    </v-col>
  </v-row>

  <v-dialog v-model="deleteDialog" max-width="450">
    <v-card>
      <v-card-title class="border-b-sm pb-4">
        <v-icon icon="mdi-alert-circle" class="mr-2" color="warning" />
        Delete Account
      </v-card-title>
      <v-card-text class="pt-4">
        <p class="mb-3">Are you sure you want to delete your account? This action <strong>cannot</strong> be undone.</p>
        <v-alert type="error" variant="tonal" class="mt-3" icon="mdi-information-outline">
          <p class="mb-0">All your data and progress will be permanently deleted.</p>
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="tonal" @click="closeDialog"> Cancel </v-btn>
        <v-btn color="warning" @click="deleteAccount"> Delete </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { success } from '@/components/snackbar/snackbar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { AuthService } from '@/services/login/auth-service'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountActions',
  setup() {
    const userStore = useUserStore()
    const { isMobile } = useBreakpoint()
    return { userStore, isMobile }
  },
  data() {
    return {
      deleteDialog: false
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
      success('You have been logged out successfully')
    },
    confirmDeleteAccount() {
      this.deleteDialog = true
    },
    closeDialog() {
      this.deleteDialog = false
    },
    async deleteAccount() {
      try {
        await AuthService.delete()
        success('Your account has been deleted successfully')
        this.userStore.logout()
      } catch (error) {
        console.error('Error deleting account:', error)
      } finally {
        this.closeDialog()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.actions-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.dialog-title {
  background: rgba(30, 30, 46, 0.9);
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
