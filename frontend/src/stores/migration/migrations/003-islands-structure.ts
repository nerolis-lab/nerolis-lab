import type { Migration } from '@/stores/migration/migration-type'

import type { StoreMap } from '@/stores/migration/migration-type'
import type { useUserStore } from '@/stores/user-store'
import {
  EXPERT_ISLANDS,
  ISLANDS,
  type AuthProviders,
  type IslandInstance,
  type IslandShortName,
  type Roles
} from 'sleepapi-common'

export default {
  version: 3,
  description: 'Migrates areaBonus Record to islands structure with IslandInstance objects.',
  up: (stores: StoreMap) => {
    migrateUserStore(stores)
  }
} satisfies Migration

function migrateUserStore(stores: StoreMap) {
  const userStore = stores.user as ReturnType<typeof useUserStore>
  const stateV2 = userStore.$state as unknown as UserStateV2

  // If areaBonus exists, migrate it to islands structure
  if (stateV2.areaBonus) {
    const allIslands = [...ISLANDS, ...EXPERT_ISLANDS]
    const islandsRecord = allIslands.reduce(
      (acc, island) => {
        acc[island.shortName] = { ...island, areaBonus: stateV2.areaBonus[island.shortName] ?? 0 }
        return acc
      },
      {} as Record<IslandShortName, IslandInstance>
    )

    userStore.$patch((state) => {
      state.islands = islandsRecord

      // Remove the old areaBonus field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).areaBonus
    })
  }
}

// Previous version's state structure
export interface UserStateV2 {
  name: string
  avatar: string | null
  externalId: string | null
  friendCode: string | null
  auth: AuthProviders | null
  role: Roles
  areaBonus: Record<IslandShortName, number>
  potSize: number
  supporterSince: string | null
  randomizeNicknames: boolean
}
