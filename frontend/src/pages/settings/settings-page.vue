<template>
  <v-container>
    <v-row>
      <!-- Desktop navigation buttons -->
      <v-col v-if="!isMobile" cols="3">
        <v-card class="frosted-glass fill-height">
          <v-list bg-color="transparent" density="compact" class="py-0">
            <v-list-item
              v-for="(tab, index) in tabs"
              :key="tab.value"
              :active="activeTab === tab.value"
              :data-index="index"
              @click="activeTab = tab.value"
              density="compact"
            >
              {{ tab.text }}
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col :cols="isMobile ? 12 : 9">
        <v-card class="pb-4 frosted-glass">
          <!-- Mobile tabs -->
          <v-tabs v-if="isMobile" v-model="activeTab" centered grow>
            <v-tab
              v-for="(tab, index) in tabs"
              :key="tab.value"
              :value="tab.value"
              :data-index="index"
              :class="[activeTab === tab.value ? 'frosted-glass-light' : 'bg-surface', 'tab-item']"
            >
              {{ tab.text }}
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab">
            <!-- Game Tab -->
            <v-tabs-window-item value="game">
              <GameSettings />
            </v-tabs-window-item>

            <!-- Account Tab -->
            <v-tabs-window-item value="account">
              <v-row class="mt-4">
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
                <v-col cols="auto" class="flex-center text-h6 text-strength" style="text-wrap: nowrap"
                  >Account Settings</v-col
                >
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" class="flex-center flex-column">
                  <span class="text-center">E-mail: {{ userStore.email ?? 'missing, log out and back in' }}</span>
                  <span class="text-center fine-print">
                    This is only stored on your device. Neroli's Lab does not store your personal information, just an
                    identifier connected to your Google account to recognize you by.
                  </span>
                </v-col>
              </v-row>
              <v-row dense class="mx-1 mt-4">
                <v-col cols="6" class="flex-center">
                  <v-btn color="secondary" class="w-100" @click="logout">Logout</v-btn>
                </v-col>
                <v-col cols="6" class="flex-center">
                  <v-btn color="warning" class="w-100" @click="showDeleteConfirmationDialog">Delete account</v-btn>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- Site Tab -->
            <v-tabs-window-item value="site">
              <v-row class="mt-4">
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
                <v-col cols="auto" class="flex-center text-h6 text-no-wrap text-strength">Cache Settings</v-col>
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="flex-center">
                  <span class="text-center mx-4">
                    In case of issues please try clearing the cache. If that doesn't work, contact the developers and
                    attach the site version found below.
                  </span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="flex-center">
                  <v-btn color="secondary" @click="clear">Clear cache</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
                <v-col cols="auto" class="flex-center text-h6 text-no-wrap text-strength">Version</v-col>
                <v-col class="flex-center">
                  <v-divider />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" class="flex-center flex-column">
                  <span class="text-center">
                    Site version: {{ versionStore.version ?? 'missing, log out and back in' }}
                  </span>
                  <span class="text-center font-weight-thin font-italic text-body-2 text-grey">
                    Please provide this when you bug report
                  </span>
                </v-col>
              </v-row>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Account Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Account Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete your account? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDialog">Cancel</v-btn>
          <v-btn color="warning" @click="confirmDeleteAccount">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import GameSettings from '@/components/settings/game-settings/game-settings.vue'
import { success } from '@/components/snackbar/snackbar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { GoogleService } from '@/services/login/google-service'
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsPage',
  components: {
    GameSettings
  },
  setup() {
    const userStore = useUserStore()
    const versionStore = useVersionStore()
    const { isMobile } = useBreakpoint()

    return { userStore, versionStore, isMobile }
  },
  data() {
    return {
      activeTab: 'game',
      deleteDialog: false,
      tabs: [
        { value: 'game', text: 'Game' },
        { value: 'account', text: 'Account' },
        { value: 'site', text: 'Site' }
      ]
    }
  },
  methods: {
    clear() {
      clearCacheKeepLogin()
      success('Cache cleared successfully!')
    },
    logout() {
      this.userStore.logout()
    },
    showDeleteConfirmationDialog() {
      this.deleteDialog = true
    },
    closeDialog() {
      this.deleteDialog = false
    },
    async confirmDeleteAccount() {
      this.closeDialog()
      await GoogleService.delete()
      this.userStore.logout()
    }
  }
})
</script>
