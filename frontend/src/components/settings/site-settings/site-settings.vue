<template>
  <div class="site-settings-container">
    <SettingsCard title="Version Information" icon="mdi-information">
      <span>Site version: </span>
      <code>{{ versionStore.version }}</code>

      <p class="fine-print">
        <v-icon icon="mdi-alert-circle-outline" size="small" class="mr-1" />
        Please provide this when reporting bugs
      </p>
    </SettingsCard>

    <SettingsCard title="Pokémon Name Generation" icon="mdi-dice-multiple">
      <p class="mb-2">Control how Pokémon names are generated when they are first acquired.</p>
      <v-switch
        v-model="useRandomPokemonNames"
        label="Use Random Pokémon Names"
        color="primary"
        inset
      ></v-switch>
      <p class="fine-print">
        If enabled, newly acquired Pokémon will be given a random nickname. If disabled, they will use their default
        species name.
      </p>
    </SettingsCard>

    <SettingsCard title="Cache Settings" icon="mdi-cached">
      <p class="mb-4">
        In case of issues please try clearing the cache. If that doesn't work, contact the developers and attach the
        site version found above.
      </p>

      <v-btn color="secondary" variant="elevated" prepend-icon="mdi-delete-sweep" @click="clear"> Clear Cache </v-btn>
    </SettingsCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useUserStore } from '@/stores/user-store'
import { UserService } from '@/services/user/user-service'
import { useVersionStore } from '@/stores/version-store/version-store'
import SettingsCard from '../settings-card.vue'

const versionStore = useVersionStore()
const userStore = useUserStore()

const useRandomPokemonNames = computed({
  get: () => userStore.useRandomName,
  set: async (newValue: boolean) => {
    try {
      // Optimistically update the store for immediate UI feedback
      // The store might be updated again if there's a sync mechanism after API call
      userStore.useRandomName = newValue 
      await UserService.upsertUserSettings({ useRandomName: newValue, potSize: userStore.potSize })
      // Optionally, trigger a sync or rely on existing mechanisms to ensure store consistency
      // await userStore.syncUserSettings(); 
    } catch (error) {
      console.error('Failed to update useRandomName setting:', error)
      // Revert optimistic update if API call fails
      userStore.useRandomName = !newValue 
      // TODO: Show user-friendly error notification
    }
  }
})

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
