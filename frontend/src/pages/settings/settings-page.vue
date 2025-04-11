<template>
  <v-row class="flex-top" :class="{ 'pt-4': !isMobile }">
    <!-- Desktop navigation buttons -->
    <v-col v-if="!isMobile" class="flex-200w">
      <v-card class="frosted-glass" rounded="lg">
        <v-list bg-color="transparent" density="comfortable" nav color="primary">
          <v-list-item
            v-for="(tab, index) in tabs"
            :key="tab.value"
            :active="activeTab === tab.value"
            :data-index="index"
            @click="activeTab = tab.value"
            rounded="lg"
          >
            <template v-slot:prepend>
              <div class="flex-center mr-6">
                <v-img
                  v-if="tab.value === 'game'"
                  :src="activeTab === 'game' ? '/images/site/snorlax-icon-red.png' : '/images/site/snorlax-icon.png'"
                  width="24"
                  height="24"
                />
                <v-icon v-else :icon="tab.icon" />
              </div>
            </template>
            {{ tab.text }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col class="flex-800w mb-4">
      <!-- Mobile tabs -->
      <v-tabs v-if="isMobile" v-model="activeTab" bg-color="transparent" color="primary" grow class="border-b-sm mb-4">
        <v-tab v-for="(tab, index) in tabs" :key="index" :value="tab.value">
          <v-img
            v-if="tab.value === 'game'"
            :src="activeTab === 'game' ? '/images/site/snorlax-icon-red.png' : '/images/site/snorlax-icon.png'"
            width="18"
            height="18"
            class="mr-2"
          />
          <v-icon v-else :icon="tab.icon" class="mr-2" />
          {{ tab.text }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="game">
          <GameSettings />
        </v-window-item>

        <v-window-item value="account">
          <AccountSettings />
        </v-window-item>

        <v-window-item value="site">
          <SiteSettings />
        </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import AccountSettings from '@/components/settings/account-settings/account-settings.vue'
import GameSettings from '@/components/settings/game-settings/game-settings.vue'
import SiteSettings from '@/components/settings/site-settings/site-settings.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SettingsPage',
  components: {
    GameSettings,
    AccountSettings,
    SiteSettings
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
      tabs: [
        { value: 'game', text: 'Game' },
        { value: 'account', text: 'Account', icon: 'mdi-account-circle' },
        { value: 'site', text: 'Site', icon: 'mdi-web' }
      ]
    }
  }
})
</script>
