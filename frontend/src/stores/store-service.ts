import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useNotificationStore } from '@/stores/notification-store/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'

export function clearCacheAndLogout() {
  localStorage.clear()

  const userStore = useUserStore()
  const teamStore = useTeamStore()
  const pokemonStore = usePokemonStore()
  const notificationStore = useNotificationStore()
  const comparisonStore = useComparisonStore()

  userStore.$reset()
  teamStore.$reset()
  pokemonStore.$reset()
  notificationStore.$reset()
  comparisonStore.$reset()
}

export function clearCacheKeepLogin() {
  const teamStore = useTeamStore()
  const pokemonStore = usePokemonStore()
  const notificationStore = useNotificationStore()
  const comparisonStore = useComparisonStore()

  teamStore.$reset()
  pokemonStore.$reset()
  notificationStore.$reset()
  comparisonStore.$reset()
}

export async function migrateSite() {
  const versionStore = useVersionStore()
  await versionStore.migrate()
  await versionStore.invalidateCache()
}
