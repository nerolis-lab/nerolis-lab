import type { Migration } from '@/stores/migration/migration-type'

import type { StoreMap } from '@/stores/migration/migration-type'
import type { useUserStore } from '@/stores/user-store'
import { CYAN_EXPERT, GREENGRASS_EXPERT, type IslandInstance, type IslandShortName } from 'sleepapi-common'

export default {
  version: 5,
  description: 'Adds the GGEX and CBEX expert islands to existing users islands state.',
  up: (stores: StoreMap) => {
    migrateUserStore(stores)
  }
} satisfies Migration

function migrateUserStore(stores: StoreMap) {
  const userStore = stores.user as ReturnType<typeof useUserStore>

  if (!userStore.islands) {
    return
  }

  const missingExpertIslands: Partial<Record<IslandShortName, IslandInstance>> = {}

  if (!userStore.islands.GGEX) {
    missingExpertIslands.GGEX = { ...GREENGRASS_EXPERT, areaBonus: 0, berries: [] }
  }

  if (!userStore.islands.CBEX) {
    missingExpertIslands.CBEX = { ...CYAN_EXPERT, areaBonus: 0, berries: [] }
  }

  if (Object.keys(missingExpertIslands).length > 0) {
    userStore.$patch((state) => {
      state.islands = {
        ...state.islands,
        ...missingExpertIslands
      } as Record<IslandShortName, IslandInstance>
    })
  }
}
