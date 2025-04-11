/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StoreMap } from '@/stores/migration/migration-type'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAMS } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import { ISLANDS, MAX_POT_SIZE, Roles, type IslandShortName } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import migration from './001-initial-state'

describe('001-initial-state', () => {
  let teamStore: ReturnType<typeof useTeamStore>
  let userStore: ReturnType<typeof useUserStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>
  let stores: StoreMap

  beforeEach(() => {
    teamStore = useTeamStore()
    userStore = useUserStore()
    pokemonStore = usePokemonStore()

    stores = { team: teamStore, user: userStore, pokemon: pokemonStore }
  })

  it('should have correct version and description', () => {
    expect(migration.version).toBe(1)
    expect(migration.description).toBe('Sets up initial baseline version.')
  })

  describe('team store migration', () => {
    it('should set default values for team store', () => {
      teamStore.timeWindow = undefined as any
      teamStore.tab = undefined as any
      teamStore.maxAvailableTeams = 1
      teamStore.teams = [
        {
          memberIndex: undefined as any,
          memberIvs: undefined as any,
          stockpiledBerries: undefined as any,
          stockpiledIngredients: undefined as any
        } as any
      ]

      migration.up(stores)

      expect(teamStore.timeWindow).toBe('24H')
      expect(teamStore.tab).toBe('overview')
      expect(teamStore.maxAvailableTeams).toBe(MAX_TEAMS)
      expect(teamStore.teams[0]).toEqual({
        memberIndex: 0,
        memberIvs: {},
        stockpiledBerries: [],
        stockpiledIngredients: []
      })
    })

    it('should not override existing values in team store', () => {
      const mockTeam = mocks.createMockTeams(1, {
        memberIndex: 5,
        memberIvs: { member: mocks.createMockMemberIv() },
        stockpiledBerries: [mocks.mockBerrySetSimple()],
        stockpiledIngredients: [mocks.mockIngredientSetSimple()]
      })

      teamStore.timeWindow = '24H'
      teamStore.tab = 'cooking'
      teamStore.maxAvailableTeams = MAX_TEAMS
      teamStore.teams = mockTeam

      migration.up(stores)
      expect(teamStore.teams).toEqual(mockTeam)
    })
  })

  describe('user store migration', () => {
    it('should set default values for user store', () => {
      userStore.role = undefined as any
      userStore.areaBonus = undefined as any
      userStore.potSize = undefined as any

      migration.up(stores)

      expect(userStore.role).toBe(Roles.Default)
      expect(userStore.potSize).toBe(MAX_POT_SIZE)
      const areaBonus = userStore.areaBonus as Record<IslandShortName, number>
      expect(Object.keys(areaBonus).length).toBe(ISLANDS.length)
      ISLANDS.forEach((island) => {
        expect(areaBonus[island.shortName as IslandShortName]).toBe(0)
      })
    })

    it('should not override existing values in user store', () => {
      const existingAreaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 5])) as Record<
        IslandShortName,
        number
      >

      userStore.role = Roles.Admin
      userStore.areaBonus = existingAreaBonus
      userStore.potSize = 10

      migration.up(stores)

      expect(userStore.role).toBe(Roles.Admin)
      expect(userStore.potSize).toBe(10)
      expect(userStore.areaBonus).toEqual(existingAreaBonus)
    })
  })

  describe('pokemon store migration', () => {
    it('should calculate RP for pokemon without it', () => {
      pokemonStore.pokemon = {
        '1': mocks.createMockPokemon({ rp: undefined }),
        '2': mocks.createMockPokemon({ rp: 100 })
      }

      migration.up(stores)

      expect(pokemonStore.pokemon['1'].rp).toBeDefined()
      expect(pokemonStore.pokemon['2'].rp).toBe(100)
    })
  })
})
