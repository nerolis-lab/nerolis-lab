<template>
  <template v-if="loggedIn">
    <div class="components-container">
      <AccountInfo />
      <LinkedProviders />
      <AccountActions />
    </div>
  </template>
  <template v-else>
    <SettingsCard title="Account Settings" icon="mdi-account-circle">
      <p class="text-body-2 mb-4">Please log in to access your account settings.</p>
    </SettingsCard>
  </template>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user-store'
import { computed } from 'vue'
import SettingsCard from '../settings-card.vue'
import AccountActions from './account-actions.vue'
import AccountInfo from './account-info.vue'
import LinkedProviders from './linked-providers.vue'

const userStore = useUserStore()
const loggedIn = computed(() => userStore.loggedIn)
</script>

<style scoped>
.components-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 16px;
}
</style>
