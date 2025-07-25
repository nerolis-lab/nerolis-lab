import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { PerformanceDetails, TeamInstance } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createMockTeamData } from '@/vitest/mocks/team-data'
import {
  berry,
  commonMocks,
  LEAFEON,
  Logger,
  subskill,
  uuid,
  WIGGLYTUFF,
  type PokemonInstanceExt
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    deleteTeam: vi.fn(),
    createOrUpdateTeam: vi.fn(),
    createOrUpdateMember: vi.fn(),
    calculateProduction: vi.fn()
  }
}))

beforeEach(() => {})

describe('Team Store', () => {
  const externalId = 'external-id'
  const mockPokemon = mocks.createMockPokemon()

  it('should have expected default state', () => {
    const teamStore = useTeamStore()
    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "domainVersion": 0,
        "loadingMembers": [
          false,
          false,
          false,
          false,
          false,
        ],
        "loadingTeams": false,
        "maxAvailableTeams": 10,
        "tab": "overview",
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "favoredBerries": [],
            "index": 0,
            "memberIndex": 0,
            "memberIvs": {},
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Team 1",
            "production": undefined,
            "recipeType": "curry",
            "stockpiledBerries": [],
            "stockpiledIngredients": [],
            "version": 0,
            "wakeup": "06:00",
          },
        ],
        "timeWindow": "24H",
      }
    `)
  })

  it('should populate teams correctly when user is logged in', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    const previousTeams = createMockTeams(2)
    teamStore.teams = previousTeams

    TeamService.getTeams = vi.fn().mockResolvedValue([
      {
        index: 0,
        name: 'Team 1',
        camp: true,
        version: 1, // will cause re-sim to be called
        members: [externalId, undefined, undefined, undefined, undefined],
        memberIvs: {},
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        version: 0,
        members: [undefined, undefined, undefined, undefined, undefined],
        memberIvs: {},
        production: undefined
      }
    ])

    await teamStore.syncTeams()

    expect(TeamService.getTeams).toHaveBeenCalled()
    expect(teamStore.teams[0].production).toBeUndefined() // since version bump
    expect(teamStore.teams[1].production).toEqual(previousTeams[1].production) // since version bump
  })

  it('should reset the state correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(2)

    teamStore.currentIndex = 1
    teamStore.maxAvailableTeams = 4
    teamStore.loadingTeams = false

    teamStore.$reset()

    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "domainVersion": 0,
        "loadingMembers": [
          false,
          false,
          false,
          false,
          false,
        ],
        "loadingTeams": false,
        "maxAvailableTeams": 10,
        "tab": "overview",
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "favoredBerries": [],
            "index": 0,
            "memberIndex": 0,
            "memberIvs": {},
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Team 1",
            "production": undefined,
            "recipeType": "curry",
            "stockpiledBerries": [],
            "stockpiledIngredients": [],
            "version": 0,
            "wakeup": "06:00",
          },
        ],
        "timeWindow": "24H",
      }
    `)
  })

  it('should increment currentIndex correctly on next()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        memberIvs: {},
        production: undefined
      },
      {
        index: 1,
        memberIndex: 0,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        memberIvs: {},
        production: undefined
      }
    ]

    teamStore.next()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.next()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should decrement currentIndex correctly on prev()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [],
        version: 1,
        memberIvs: {},
        production: undefined
      },
      {
        index: 1,
        memberIndex: 0,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should get number of members in team', async () => {
    const teamStore = useTeamStore()

    const member = { name: 'Pikachu' } as PokemonInstanceExt
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [undefined, member.name, null!, member.name, ''],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]

    const size = teamStore.getTeamSize
    expect(size).toBe(2)
  })

  it('deleteTeam shall reset current team', () => {
    const teamStore = useTeamStore()

    const team1: TeamInstance = {
      index: 0,
      memberIndex: 1,
      name: 'Team 1',
      camp: false,
      bedtime: '21:10',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      stockpiledBerries: [],
      stockpiledIngredients: [],
      members: [undefined, 'member1', undefined, 'member2', undefined],
      version: 1,
      memberIvs: {},
      production: undefined
    }
    const team2: TeamInstance = {
      index: 0,
      memberIndex: 0,
      name: 'Team 2',
      camp: false,
      bedtime: '21:20',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      stockpiledBerries: [],
      stockpiledIngredients: [],
      members: [undefined, 'member3', undefined, 'member4', undefined],
      version: 1,
      memberIvs: {},
      production: undefined
    }
    teamStore.teams = [team1, team2]
    teamStore.currentIndex = 1

    teamStore.deleteTeam()

    expect(teamStore.teams[0]).toEqual(team1)
    expect(teamStore.getCurrentTeam).toMatchInlineSnapshot(`
      {
        "bedtime": "21:30",
        "camp": false,
        "favoredBerries": [],
        "index": 1,
        "memberIndex": 0,
        "memberIvs": {},
        "members": [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ],
        "name": "Helper team 2",
        "production": undefined,
        "recipeType": "curry",
        "stockpiledBerries": [],
        "stockpiledIngredients": [],
        "version": 0,
        "wakeup": "06:00",
      }
    `)
  })

  it('deleteTeam shall call server to delete team if user logged in', () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    const team1: TeamInstance = {
      index: 0,
      memberIndex: 0,
      name: 'Team 1',
      camp: false,
      bedtime: '21:10',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      stockpiledBerries: [],
      stockpiledIngredients: [],
      members: [undefined, 'member1', undefined, 'member2', undefined],
      version: 1,
      memberIvs: {},
      production: undefined
    }

    teamStore.teams = [team1]
    teamStore.currentIndex = 0

    teamStore.deleteTeam()

    expect(TeamService.deleteTeam).toHaveBeenCalled()
  })
})

describe('duplicateMember', () => {
  const mockPokemon = mocks.createMockPokemon()

  it('should duplicate member to the first open slot', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [undefined, mockPokemon.externalId, undefined, undefined, undefined],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]
    pokemonStore.upsertLocalPokemon(mockPokemon)

    TeamService.createOrUpdateMember = vi.fn().mockResolvedValue({ index: 0, name: 'Pikachu' })

    await teamStore.duplicateMember(1)

    expect(teamStore.teams[0].members[0]).toBeDefined()
    expect(teamStore.teams[0].members[2]).toBeUndefined()
    expect(teamStore.teams[0].members[3]).toBeUndefined()
    expect(teamStore.teams[0].members[4]).toBeUndefined()
    expect(TeamService.createOrUpdateMember).toHaveBeenCalled()
  })

  it('should not duplicate if no open slot is available', async () => {
    const teamStore = useTeamStore()
    const member = uuid.v4()

    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [member, member, member, member, member],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]

    const loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {})

    await teamStore.duplicateMember(1)

    expect(loggerErrorSpy).toHaveBeenCalledWith("No open slot or member can't be found")
    loggerErrorSpy.mockRestore()
  })

  it('should not duplicate if member does not exist', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [undefined, undefined, undefined, undefined, undefined],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]

    const loggerSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {})

    await teamStore.duplicateMember(1)

    expect(loggerSpy).toHaveBeenCalledWith("No open slot or member can't be found")
    loggerSpy.mockRestore()
  })
})

describe('removeMember', () => {
  it('should remove member', async () => {
    const teamStore = useTeamStore()

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    const member2 = uuid.v4()
    const member4 = uuid.v4()
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        stockpiledBerries: [],
        stockpiledIngredients: [],
        members: [undefined, member2, undefined, member4, undefined],
        version: 1,
        memberIvs: {},
        production: undefined
      }
    ]

    TeamService.removeMember = vi.fn().mockResolvedValue(undefined)

    await teamStore.removeMember(1)

    expect(teamStore.teams[0].members).toEqual([undefined, undefined, undefined, member4, undefined])
    expect(teamStore.teams[0].members).toEqual([undefined, undefined, undefined, member4, undefined])
    expect(TeamService.removeMember).toHaveBeenCalledWith({
      teamIndex: 0,
      memberIndex: 1
    })
  })

  it("should reset every member's single production if member was support mon", async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    teamStore.resetCurrentTeamIvs = vi.fn()

    const mockPokemon1 = mocks.createMockPokemon()
    const mockPokemon2 = mocks.createMockPokemon({ pokemon: WIGGLYTUFF, externalId: 'support' })
    pokemonStore.upsertLocalPokemon(mockPokemon1)
    pokemonStore.upsertLocalPokemon(mockPokemon2)

    teamStore.teams = createMockTeams(1, {
      members: [mockPokemon1.externalId, mockPokemon2.externalId]
    })

    await teamStore.removeMember(1)
    expect(teamStore.resetCurrentTeamIvs).toHaveBeenCalled()
  })
})

describe('updateTeamMember', () => {
  it('shall upsert local pokemon and calculate production', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon = vi.fn()

    teamStore.calculateProduction = vi.fn()
    teamStore.updateTeamMember(mocks.createMockPokemon(), 2)

    expect(teamStore.calculateProduction).toHaveBeenCalled()
    expect(pokemonStore.upsertLocalPokemon).toHaveBeenCalled()
    expect(teamStore.getCurrentTeam.members).toMatchInlineSnapshot(`
      [
        undefined,
        undefined,
        "external-id",
        undefined,
        undefined,
      ]
    `)
  })

  it('shall reset the iv', async () => {
    const teamStore = useTeamStore()

    teamStore.teams = createMockTeams()

    expect(teamStore.teams).toHaveLength(1)
    expect(teamStore.teams[0].production?.members).toHaveLength(1)
    expect(Object.keys(teamStore.teams[0].memberIvs)).toHaveLength(1)

    await teamStore.updateTeamMember(mocks.createMockPokemon(), 0)

    expect(teamStore.teams).toHaveLength(1)
    expect(Object.keys(teamStore.teams[0].memberIvs)).toHaveLength(0)
  })

  it("shall reset every member's single production for support mons", async () => {
    const teamStore = useTeamStore()

    teamStore.resetCurrentTeamIvs = vi.fn()
    teamStore.calculateProduction = vi.fn()
    await teamStore.updateTeamMember(mocks.createMockPokemon({ pokemon: WIGGLYTUFF }), 2)

    expect(teamStore.resetCurrentTeamIvs).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })

  it("shall reset every member's single production if mon has support subskill", async () => {
    const teamStore = useTeamStore()

    teamStore.resetCurrentTeamIvs = vi.fn()
    teamStore.calculateProduction = vi.fn()
    await teamStore.updateTeamMember(
      mocks.createMockPokemon({ subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }] }),
      2
    )

    expect(teamStore.resetCurrentTeamIvs).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('toggleCamp', () => {
  it('shall toggle camp and update production', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { camp: false })

    teamStore.resetCurrentTeamIvs = vi.fn()
    teamStore.updateTeam = vi.fn()
    teamStore.calculateProduction = vi.fn()

    expect(teamStore.getCurrentTeam.camp).toBe(false)
    await teamStore.toggleCamp()
    expect(teamStore.getCurrentTeam.camp).toBe(true)

    expect(teamStore.resetCurrentTeamIvs).toHaveBeenCalled()
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('updateSleep', () => {
  it('shall update sleep and update production', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { bedtime: '22:00', wakeup: '05:00' })

    teamStore.resetCurrentTeamIvs = vi.fn()
    teamStore.updateTeam = vi.fn()
    teamStore.calculateProduction = vi.fn()

    teamStore.getCurrentTeam.bedtime = '23:00'
    teamStore.getCurrentTeam.wakeup = '07:00'
    await teamStore.updateSleep()
    expect(teamStore.getCurrentTeam.bedtime).toEqual('23:00')
    expect(teamStore.getCurrentTeam.wakeup).toEqual('07:00')

    expect(teamStore.resetCurrentTeamIvs).toHaveBeenCalled()
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('updateFavoredBerries', () => {
  it('updateFavoredBerries shall update berries and call server', async () => {
    const teamStore = useTeamStore()

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    teamStore.updateTeam = vi.fn()

    await teamStore.updateFavoredBerries([berry.BELUE])
    expect(teamStore.getCurrentTeam.favoredBerries).toEqual([berry.BELUE])
    expect(teamStore.updateTeam).toHaveBeenCalled()
  })
})

describe('updateRecipeType', () => {
  it('updateRecipeType shall update the recipe type and call server', async () => {
    const teamStore = useTeamStore()

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())

    teamStore.updateTeam = vi.fn()

    await teamStore.updateRecipeType('dessert')
    expect(teamStore.getCurrentTeam.recipeType).toEqual('dessert')
    expect(teamStore.updateTeam).toHaveBeenCalled()
  })
})

describe('resetCurrentTeamIvs', () => {
  it("shall reset every member's iv", () => {
    const teamStore = useTeamStore()
    const iv: PerformanceDetails = {
      berry: 50,
      ingredient: 50,
      skill: 50
    }
    teamStore.teams = createMockTeams(1, {
      memberIvs: { 'some id': iv, 'some id2': iv }
    })

    teamStore.resetCurrentTeamIvs()

    expect(teamStore.getCurrentTeam.production?.members).toHaveLength(1)
    expect(teamStore.getCurrentTeam.memberIvs).toEqual({})
  })
})

describe('isSupportMember', () => {
  it('shall return false if member has no support skills or subskills', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon()
    expect(teamStore.isSupportMember(mockPokemon)).toBe(false)
  })

  it('shall return true if member has helping bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energy recovery bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({
      subskills: [{ level: 10, subskill: subskill.ENERGY_RECOVERY_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return false if member has energy recovery bonus but not reached the level', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({
      level: 24,
      subskills: [{ level: 25, subskill: subskill.ENERGY_RECOVERY_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(false)
  })

  it('shall return true if member has energy for everyone', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({ pokemon: WIGGLYTUFF })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energizing cheer', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({ pokemon: LEAFEON })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energizing cheer and helping bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = mocks.createMockPokemon({
      pokemon: LEAFEON,
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })
})

describe('migrate', () => {
  it('should migrate old teams to new state', () => {
    const teamStore = useTeamStore()

    teamStore.teams = createMockTeams(2, {
      memberIndex: undefined,
      stockpiledBerries: undefined,
      stockpiledIngredients: undefined
    })
    teamStore.timeWindow = undefined!
    teamStore.tab = null!

    teamStore.migrate()

    expect(teamStore.tab).toEqual('overview')
    expect(teamStore.timeWindow).toEqual('24H')
    teamStore.teams.forEach((team) => {
      expect(team.memberIndex).toBe(0)
      expect(team.stockpiledBerries).toEqual([])
      expect(team.stockpiledIngredients).toEqual([])
    })
  })
})

describe('outdate', () => {
  it('should outdate teams by resetting production and setting domainVersion', () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(2)
    expect(teamStore.domainVersion).toBe(0)

    teamStore.teams.forEach((team) => {
      expect(team.production).not.toBeUndefined()
      expect(team.memberIvs).not.toBeUndefined()
    })

    teamStore.invalidateCache() // sets production to undefined

    teamStore.teams.forEach((team) => {
      expect(team.production).toBeUndefined()
    })
    expect(teamStore.domainVersion).toBeGreaterThan(0)
  })
})

describe('getMemberIvLoading', () => {
  it('should return false if member iv is not loading', () => {
    const teamStore = useTeamStore()
    const mockTeams = createMockTeams(1, {
      memberIvs: {
        member1: { berry: 10, ingredient: 20, skill: 15 }
      }
    })
    teamStore.teams = mockTeams

    const result = teamStore.getMemberIvLoading('member1')
    expect(result).toBe(false)
  })

  it('should return true if member iv is loading (value is undefined)', () => {
    const teamStore = useTeamStore()
    const mockTeams = createMockTeams(1, {
      memberIvs: {
        member1: undefined
      }
    })
    teamStore.teams = mockTeams

    const result = teamStore.getMemberIvLoading('member1')
    expect(result).toBe(true)
  })

  it('should return false if member iv does not exist', () => {
    const teamStore = useTeamStore()
    const mockTeams = createMockTeams(1, {
      memberIvs: {}
    })
    teamStore.teams = mockTeams

    const result = teamStore.getMemberIvLoading('member1')
    expect(result).toBe(false)
  })
})

describe('getCurrentMembersWithProduction', () => {
  it('should return members with production details if available', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const mockPokemon = mocks.createMockPokemon()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const mockTeams = createMockTeams()
    teamStore.teams = mockTeams

    const result = teamStore.getCurrentMembersWithProduction
    expect(result).toHaveLength(5)
    expect(result[0]).toEqual({
      member: mockPokemon,
      production: mockTeams[0].production?.members[0],
      iv: mockTeams[0].memberIvs[mockPokemon.externalId]
    })
    result.slice(1).forEach((res) => expect(res).toBeUndefined())
  })

  it('should return undefined for members without production details', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const mockPokemon = mocks.createMockPokemon({ externalId: 'member1' })
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const mockTeams = createMockTeams(1, {
      members: ['member1'],
      production: undefined
    })
    teamStore.teams = mockTeams

    const result = teamStore.getCurrentMembersWithProduction
    expect(result).toHaveLength(1)
    expect(result[0]).toBeUndefined()
  })

  it('should return undefined if member is not found in pokemon store', () => {
    const teamStore = useTeamStore()

    teamStore.teams = createMockTeams()

    const result = teamStore.getCurrentMembersWithProduction
    expect(result).toHaveLength(5)
    result.forEach((res) => expect(res).toBeUndefined())
  })
})

describe('upsertIv', () => {
  it('should insert a new performance detail if not present', () => {
    const teamStore = useTeamStore()
    const mockTeams = createMockTeams(1, {
      memberIvs: {}
    })
    teamStore.teams = mockTeams

    const performanceDetails: PerformanceDetails = {
      berry: 10,
      ingredient: 20,
      skill: 15
    }

    teamStore.upsertIv('member1', performanceDetails)

    expect(teamStore.getCurrentTeam.memberIvs['member1']).toEqual(performanceDetails)
  })

  it('should update an existing performance detail if already present', () => {
    const teamStore = useTeamStore()
    const initialPerformanceDetails: PerformanceDetails = {
      berry: 5,
      ingredient: 10,
      skill: 8
    }
    const mockTeams = createMockTeams(1, {
      memberIvs: {
        member1: initialPerformanceDetails
      }
    })
    teamStore.teams = mockTeams

    const updatedPerformanceDetails: PerformanceDetails = {
      berry: 15,
      ingredient: 25,
      skill: 20
    }

    teamStore.upsertIv('member1', updatedPerformanceDetails)

    expect(teamStore.getCurrentTeam.memberIvs['member1']).toEqual(updatedPerformanceDetails)
  })

  it('should set performance detail to undefined if no details are provided', () => {
    const teamStore = useTeamStore()
    const mockTeams = createMockTeams(1, {
      memberIvs: {
        member1: { berry: 10, ingredient: 20, skill: 15 }
      }
    })
    teamStore.teams = mockTeams

    teamStore.upsertIv('member1', undefined)

    expect(teamStore.getCurrentTeam.memberIvs['member1']).toBeUndefined()
  })
})

describe('updateStockpile', () => {
  it('should update stockpiled ingredients and berries', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setInitialLoginData(commonMocks.loginResponse())

    await nextTick()

    teamStore.updateTeam = vi.fn()
    teamStore.calculateProduction = vi.fn()

    const ingredients = [commonMocks.mockIngredientSetSimple({ amount: 10 })]
    const berries = [commonMocks.mockBerrySetSimple({ amount: 5 })]

    await teamStore.updateStockpile({ ingredients, berries })

    expect(teamStore.getCurrentTeam.stockpiledIngredients).toEqual(ingredients)
    expect(teamStore.getCurrentTeam.stockpiledBerries).toEqual(berries)
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })

  it('should call calculateProduction after updating stockpile', async () => {
    const teamStore = useTeamStore()
    const ingredients = [commonMocks.mockIngredientSetSimple({ amount: 10 })]
    const berries = [commonMocks.mockBerrySetSimple({ amount: 5 })]

    teamStore.calculateProduction = vi.fn()

    await teamStore.updateStockpile({ ingredients, berries })

    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('setCurrentTeam', () => {
  it('should set current team index and replace team with provided data', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()

    userStore.setInitialLoginData(commonMocks.loginResponse())

    const mockPokemon1 = mocks.createMockPokemon({ externalId: 'member1' })
    const mockPokemon2 = mocks.createMockPokemon({ externalId: 'member2' })
    pokemonStore.upsertLocalPokemon(mockPokemon1)
    pokemonStore.upsertLocalPokemon(mockPokemon2)

    // Set up initial state with multiple teams
    teamStore.teams = [createMockTeams(1)[0], createMockTeams(1, { index: 1, name: 'Team 2' })[0]]
    teamStore.currentIndex = 0

    const teamData = createMockTeamData({
      index: 1,
      name: 'New Team',
      camp: true,
      bedtime: '22:00',
      wakeup: '07:00',
      recipeType: 'dessert',
      favoredBerries: [berry.BELUE],
      stockpiledBerries: [{ name: 'BELUE', amount: 5, level: 30 }],
      stockpiledIngredients: [{ name: 'Honey', amount: 10 }],
      members: [mockPokemon1, mockPokemon2]
    })

    teamStore.updateTeam = vi.fn()
    teamStore.updateTeamMember = vi.fn()
    TeamService.deleteTeam = vi.fn()

    await teamStore.setCurrentTeam(teamData)

    expect(teamStore.currentIndex).toBe(1)
    expect(teamStore.getCurrentTeam.name).toBe('New Team')
    expect(teamStore.getCurrentTeam.camp).toBe(true)
    expect(teamStore.getCurrentTeam.bedtime).toBe('22:00')
    expect(teamStore.getCurrentTeam.wakeup).toBe('07:00')
    expect(teamStore.getCurrentTeam.recipeType).toBe('dessert')
    expect(teamStore.getCurrentTeam.favoredBerries).toEqual([berry.BELUE])
    expect(teamStore.getCurrentTeam.stockpiledBerries).toEqual([{ name: 'BELUE', amount: 5, level: 30 }])
    expect(teamStore.getCurrentTeam.stockpiledIngredients).toEqual([{ name: 'Honey', amount: 10 }])
    expect(teamStore.getCurrentTeam.members).toEqual(['member1', 'member2'])
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.updateTeamMember).toHaveBeenCalledWith(mockPokemon1, 0, false)
    expect(teamStore.updateTeamMember).toHaveBeenCalledWith(mockPokemon2, 1, false)
  })

  it('should handle team with no members', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setInitialLoginData(commonMocks.loginResponse())

    const teamData = createMockTeamData({
      name: 'Empty Team',
      members: []
    })

    teamStore.updateTeam = vi.fn()
    teamStore.updateTeamMember = vi.fn()
    TeamService.deleteTeam = vi.fn()

    await teamStore.setCurrentTeam(teamData)

    expect(teamStore.currentIndex).toBe(0)
    expect(teamStore.getCurrentTeam.name).toBe('Empty Team')
    expect(teamStore.getCurrentTeam.members).toEqual([])
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.updateTeamMember).not.toHaveBeenCalled()
  })

  it('should handle partial team members', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const userStore = useUserStore()

    userStore.setInitialLoginData(commonMocks.loginResponse())

    const mockPokemon = mocks.createMockPokemon({ externalId: 'member1' })
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const teamData = createMockTeamData({
      name: 'Partial Team',
      members: [mockPokemon] // Only first member defined
    })

    teamStore.updateTeam = vi.fn()
    teamStore.updateTeamMember = vi.fn()

    await teamStore.setCurrentTeam(teamData)

    expect(teamStore.getCurrentTeam.members).toEqual(['member1'])
    expect(teamStore.updateTeamMember).toHaveBeenCalledTimes(1)
    expect(teamStore.updateTeamMember).toHaveBeenCalledWith(mockPokemon, 0, false)
  })

  it('should call deleteTeam and reset team before setting new data', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setInitialLoginData(commonMocks.loginResponse())

    // Set up initial team with existing data
    teamStore.teams = createMockTeams(1, {
      memberIndex: 2,
      name: 'Old Team',
      camp: true,
      bedtime: '23:00',
      wakeup: '08:00',
      recipeType: 'dessert',
      favoredBerries: [berry.BELUE],
      version: 5,
      members: ['old-member', undefined, undefined, undefined, undefined],
      memberIvs: { 'old-member': { berry: 10, ingredient: 20, skill: 15 } }
    })

    const teamData = createMockTeamData({
      name: 'New Team',
      members: []
    })

    teamStore.updateTeam = vi.fn()
    TeamService.deleteTeam = vi.fn()

    await teamStore.setCurrentTeam(teamData)

    // Verify team was reset by deleteTeam before applying new data
    expect(TeamService.deleteTeam).toHaveBeenCalledWith(0)
    expect(teamStore.getCurrentTeam.name).toBe('New Team')
    expect(teamStore.getCurrentTeam.camp).toBe(false)
    expect(teamStore.getCurrentTeam.version).toBe(0) // Should be reset
    expect(teamStore.getCurrentTeam.memberIvs).toEqual({}) // Should be reset
    expect(teamStore.getCurrentTeam.production).toBeUndefined() // Should be reset
  })

  it('should work when user is not logged in', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    // User not logged in
    expect(userStore.loggedIn).toBe(false)

    const teamData = createMockTeamData({
      name: 'Offline Team',
      members: []
    })

    teamStore.updateTeam = vi.fn()
    TeamService.deleteTeam = vi.fn()

    await teamStore.setCurrentTeam(teamData)

    expect(teamStore.getCurrentTeam.name).toBe('Offline Team')
    expect(teamStore.updateTeam).toHaveBeenCalled()
    // deleteTeam should still be called but won't make server request
    expect(TeamService.deleteTeam).not.toHaveBeenCalled()
  })
})
