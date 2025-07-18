import { useAvatarStore } from '@/stores/avatar-store/avatar-store'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import type { Migration, StoreMap } from '@/stores/migration/migration-type'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'

export function getMigrations(): Migration[] {
  const migrationModules = import.meta.glob<{ default: Migration }>('./migrations/!(*.test).ts', { eager: true })

  const migrations: Migration[] = Object.entries(migrationModules)
    .map(([_path, module]) => {
      return module.default
    })
    .sort((a, b) => a.version - b.version)

  return migrations
}

export function getStores() {
  const availableStores = {
    avatar: useAvatarStore,
    comparison: useComparisonStore,
    notification: useNotificationStore,
    pokemon: usePokemonStore,
    team: useTeamStore,
    user: useUserStore,
    version: useVersionStore
  }
  const stores: StoreMap = {}
  for (const storeId in availableStores) {
    stores[storeId] = availableStores[storeId as keyof typeof availableStores]()
  }
  return stores
}
