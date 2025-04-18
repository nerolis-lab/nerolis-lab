import type { Migration } from '@/stores/migration/migration-type'

import type { StoreMap } from '@/stores/migration/migration-type'
import type { useUserStore } from '@/stores/user-store'
import { AuthProvider } from 'sleepapi-common'

export default {
  version: 2,
  description: 'Adds support for multiple providers.',
  up: (stores: StoreMap) => {
    migrateUserStore(stores)
  }
} satisfies Migration

function migrateUserStore(stores: StoreMap) {
  const userStore = stores.user as ReturnType<typeof useUserStore>
  const stateV1 = userStore.$state as unknown as UserStateV1

  const identifier = stateV1.email
  const tokens = stateV1.tokens

  // user is logged in with google
  if (identifier && tokens) {
    const newAuthStructure = {
      activeProvider: AuthProvider.Google,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiryDate: tokens.expiryDate
      },
      linkedProviders: {
        google: {
          linked: true,
          identifier
        },
        discord: {
          linked: false
        },
        patreon: {
          linked: false
        }
      }
    }

    userStore.$patch((state) => {
      state.auth = newAuthStructure

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).email
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).tokens
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (state as any).identifier
    })
  }
}

enum RolesV1 {
  Admin = 'admin',
  Default = 'default'
}
type IslandShortNameV1 = 'greengrass' | 'cyan' | 'taupe' | 'snowdrop' | 'lapis' | 'powerplant'

interface UserStateV1 {
  name: string
  avatar: string | null
  email: string | null
  tokens: {
    expiryDate: number
    accessToken: string
    refreshToken: string
  } | null
  externalId: string | null
  friendCode?: string
  role: RolesV1
  areaBonus: Record<IslandShortNameV1, number>
  potSize: number
}
