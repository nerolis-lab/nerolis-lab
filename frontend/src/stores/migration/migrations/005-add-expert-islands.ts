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

  // GGEX may be entirely missing or present but missing
  // berries (migrated before the instance shape required it)
  if (!userStore.islands.GGEX || userStore.islands.GGEX.berries === undefined) {
    const ggexIsland: IslandInstance = {
      ...GREENGRASS_EXPERT,
      areaBonus: userStore.islands.GGEX?.areaBonus ?? 0,
      berries: []
    }

    userStore.$patch((state) => {
      state.islands = {
        ...state.islands,
        GGEX: ggexIsland
      } as Record<IslandShortName, IslandInstance>
    })
  }

  if (!userStore.islands.CBEX) {
    const cbexIsland: IslandInstance = {
      ...CYAN_EXPERT,
      areaBonus: 0,
      berries: []
    }

    userStore.$patch((state) => {
      state.islands = {
        ...state.islands,
        CBEX: cbexIsland
      } as Record<IslandShortName, IslandInstance>
    })
  }
}
