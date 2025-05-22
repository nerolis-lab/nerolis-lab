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
      <v-switch v-model="useRandomPokemonNames" label="Use Random Pokémon Names" color="primary" inset></v-switch>
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
import { UserService } from '@/services/user/user-service'
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { computed } from 'vue'
import SettingsCard from '../settings-card.vue'

import { success, error } from '@/components/snackbar/snackbar.vue'
const versionStore = useVersionStore()
const userStore = useUserStore()

const useRandomPokemonNames = computed({
  get: () => userStore.randomizeNicknames,
  set: async (newValue: boolean) => {
    try {
      // Optimistically update the store for immediate UI feedback
      userStore.randomizeNicknames = newValue
      await UserService.upsertUserSettings({ randomizeNicknames: newValue })
    } catch (err) {
      console.error('Failed to update randomizeNicknames setting:', err)
      userStore.randomizeNicknames = !newValue
      error('Failed to update Pokémon name settings. Please try again.')
    }
  }
})

function clear() {
  clearCacheKeepLogin()
  success('Cache cleared successfully')
}
</script>

<style lang="scss" scoped>
.site-settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
