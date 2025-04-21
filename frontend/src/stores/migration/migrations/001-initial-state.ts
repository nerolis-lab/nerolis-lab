import type { Migration, StoreMap } from '@/stores/migration/migration-type'
import type { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { useTeamStore } from '@/stores/team/team-store'
import type { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS } from '@/types/member/instanced'
import { ISLANDS, MAX_POT_SIZE, Roles, RP, type IslandShortName } from 'sleepapi-common'

export default {
  version: 1,
  description: 'Sets up initial baseline version.',
  up: (stores: StoreMap) => {
    migrateTeamStore(stores)
    migrateUserStore(stores)
    migratePokemonStore(stores)
  }
} satisfies Migration

function migrateTeamStore(stores: StoreMap) {
  const teamStore = stores.team as ReturnType<typeof useTeamStore>
  if (!teamStore.timeWindow) {
    teamStore.timeWindow = '24H'
  }
  if (!teamStore.tab) {
    teamStore.tab = 'overview'
  }
  if (teamStore.maxAvailableTeams < MAX_TEAMS) {
    teamStore.maxAvailableTeams = MAX_TEAMS
  }

  for (const team of teamStore.teams) {
    if (!team.memberIndex) {
      team.memberIndex = 0
    }
    if (!team.memberIvs) {
      team.memberIvs = {}
    }
    if (!team.stockpiledBerries) {
      team.stockpiledBerries = []
    }
    if (!team.stockpiledIngredients) {
      team.stockpiledIngredients = []
    }
  }
}

function migrateUserStore(stores: StoreMap) {
  const userStore = stores.user as ReturnType<typeof useUserStore>

  if (!userStore.role) {
    userStore.role = Roles.Default
  }

  if (!userStore.areaBonus) {
    userStore.areaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<
      IslandShortName,
      number
    >
  }

  if (!userStore.potSize) {
    userStore.potSize = MAX_POT_SIZE
  }
}

function migratePokemonStore(stores: StoreMap) {
  const pokemonStore = stores.pokemon as ReturnType<typeof usePokemonStore>

  for (const pkmn of Object.values(pokemonStore.pokemon)) {
    if (!pkmn.rp) {
      const rpUtil = new RP(pkmn)
      pkmn.rp = rpUtil.calc()
    }
  }
}
