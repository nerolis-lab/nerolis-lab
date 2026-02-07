import type { Migration } from '@/stores/migration/migration-type'

import type { StoreMap } from '@/stores/migration/migration-type'
import type { useUserStore } from '@/stores/user-store'
import {
  CYAN,
  GREENGRASS,
  GREENGRASS_EXPERT,
  LAPIS,
  POWER_PLANT,
  SNOWDROP,
  TAUPE,
  type AuthProviders,
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
    userStore.$patch((state) => {
      state.islands = {
        greengrass: { ...GREENGRASS, areaBonus: stateV2.areaBonus.greengrass ?? 0 },
        cyan: { ...CYAN, areaBonus: stateV2.areaBonus.cyan ?? 0 },
        taupe: { ...TAUPE, areaBonus: stateV2.areaBonus.taupe ?? 0 },
        snowdrop: { ...SNOWDROP, areaBonus: stateV2.areaBonus.snowdrop ?? 0 },
        lapis: { ...LAPIS, areaBonus: stateV2.areaBonus.lapis ?? 0 },
        powerplant: { ...POWER_PLANT, areaBonus: stateV2.areaBonus.powerplant ?? 0 },
        GGEX: { ...GREENGRASS_EXPERT, areaBonus: stateV2.areaBonus.GGEX ?? 0 }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any // Need as any since the userStore islands type might be different today

      // Remove the old areaBonus field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).areaBonus
    })
  }
}

// Previous version's state structure
export type IslandShortNameV2 = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant' | 'GGEX'
export interface UserStateV2 {
  name: string
  avatar: string | null
  externalId: string | null
  friendCode: string | null
  auth: AuthProviders | null
  role: Roles
  areaBonus: Record<IslandShortNameV2, number>
  potSize: number
  supporterSince: string | null
  randomizeNicknames: boolean
}
