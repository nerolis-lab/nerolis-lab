import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { migrateStores } from '@/stores/migration/migration'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { defineStore } from 'pinia'

export interface VersionState {
  version: string
  storeVersion: number
}

export const useVersionStore = defineStore('version', {
  state: (): VersionState => {
    return {
      version: '1.0.0',
      storeVersion: 0
    }
  },
  getters: {
    updateFound: (state) => state.version !== APP_VERSION
  },
  actions: {
    async migrate() {
      if (this.updateFound) {
        await Promise.resolve(migrateStores())

        this.updateSiteVersion()

        const avatarStore = useAvatarStore()
        await avatarStore.loadAvatars()
        logger.debug('Migrated site to version: ' + this.version)
      }
    },
    async invalidateCache() {
      const teamStore = useTeamStore()
      teamStore.invalidateCache()

      const comparisonStore = useComparisonStore()
      comparisonStore.invalidateCache()

      const pokemonStore = usePokemonStore()
      pokemonStore.invalidateCache()

      await teamStore.syncTeams()
    },
    updateStoreVersion(storeVersion: number) {
      this.storeVersion = storeVersion
    },
    updateSiteVersion() {
      this.version = APP_VERSION
    }
  },
  persist: true
})
