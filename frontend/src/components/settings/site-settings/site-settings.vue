<template>
  <div class="site-settings-container">
    <SettingsCard title="Version Information" icon="mdi-information">
      <span>Site version:</span>
      <code>{{ versionStore.version }}</code>

      <p class="fine-print">
        <v-icon icon="mdi-alert-circle-outline" size="small" class="mr-1" />
        Please provide this when reporting bugs
      </p>
    </SettingsCard>

    <SettingsCard title="Cache Settings" icon="mdi-cached">
      <p class="text-body-2 mb-4">
        In case of issues please try clearing the cache. If that doesn't work, contact the developers and attach the
        site version found above.
      </p>

      <v-btn color="secondary" variant="elevated" prepend-icon="mdi-delete-sweep" @click="clear"> Clear Cache </v-btn>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useVersionStore } from '@/stores/version-store/version-store'
import SettingsCard from '../settings-card.vue'
const versionStore = useVersionStore()

function clear() {
  clearCacheKeepLogin()
}
</script>

<style lang="scss" scoped>
.site-settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
