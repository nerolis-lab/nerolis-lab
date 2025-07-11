import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { clearCacheAndLogout, clearCacheKeepLogin, migrateSite } from '@/stores/store-service'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {})

describe('Store Service', () => {
  it('should clear cache and logout', () => {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()

    // Set some state to verify it gets reset
    userStore.avatar = 'some avatar'
    teamStore.teams = createMockTeams(2)
    pokemonStore.upsertLocalPokemon(mocks.createMockPokemon())
    comparisonStore.members = [mocks.createMockMemberProduction()]

    clearCacheAndLogout()

    expect(userStore.avatar).toBeNull()
    expect(teamStore.teams).toHaveLength(1)
    expect(Object.keys(pokemonStore.pokemon)).toHaveLength(0)
    expect(comparisonStore.members).toHaveLength(0)
  })

  it('should clear cache but keep user logged in', () => {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const comparisonStore = useComparisonStore()

    // Set some state to verify it gets reset
    userStore.avatar = 'some avatar'
    teamStore.teams = createMockTeams(2)
    pokemonStore.upsertLocalPokemon(mocks.createMockPokemon())
    comparisonStore.members = [mocks.createMockMemberProduction()]

    clearCacheKeepLogin()

    expect(userStore.avatar).toEqual('some avatar')
    expect(teamStore.teams).toHaveLength(1)
    expect(Object.keys(pokemonStore.pokemon)).toHaveLength(0)
    expect(comparisonStore.members).toHaveLength(0)
  })

  it('should migrate stores', async () => {
    const versionStore = useVersionStore()
    versionStore.migrate = vi.fn()
    versionStore.invalidateCache = vi.fn()
    await migrateSite()

    expect(versionStore.migrate).toHaveBeenCalled()
    expect(versionStore.invalidateCache).toHaveBeenCalled()
  })
})
