import type { Migration } from '@/stores/migration/migration-type'

import type { StoreMap } from '@/stores/migration/migration-type'
import type { useUserStore } from '@/stores/user-store'
import { AMBER, type IslandInstance, type IslandShortName } from 'sleepapi-common'

export default {
  version: 4,
  description: 'Adds amber island to existing users islands state.',
  up: (stores: StoreMap) => {
    migrateUserStore(stores)
  }
} satisfies Migration

function migrateUserStore(stores: StoreMap) {
  const userStore = stores.user as ReturnType<typeof useUserStore>

  // If islands structure exists but amber is missing, add it
  if (userStore.islands && !userStore.islands.amber) {
    const amberIsland: IslandInstance = {
      ...AMBER,
      areaBonus: 0
    }

    userStore.$patch((state) => {
      state.islands = {
        ...state.islands,
        amber: amberIsland
      } as Record<IslandShortName, IslandInstance>
    })
  }
}
