import TeamResults from '@/components/calculator/results/team-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import { mockCookingResult } from '@/vitest/mocks/calculator/mock-cooking-result'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry, type MemberSkillValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamResults>>

  beforeEach(() => {
    wrapper = mount(TeamResults)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 1000,
            sundayStrength: 100,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          critInfo: mocks.createMockTeamProduction().team.cooking!.critInfo,
          mealTimes: mockCookingResult().mealTimes
        },
        berries: [],
        ingredients: []
      },
      members: []
    }
    await nextTick()

    const strengthSpan = wrapper.find('#weeklyStrength')
    expect(strengthSpan.text()).toBe('1,000')
    const totalStrength = wrapper.vm.totalStrengthString
    expect(totalStrength).toBe('1,000')
  })

  it('renders the stacked bar with correct percentages', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mocks.createMockPokemon())

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 10000,
            sundayStrength: 0,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          critInfo: mocks.createMockTeamProduction().team.cooking!.critInfo,
          mealTimes: {
            breakfast: { hour: 8, minute: 0, second: 0 },
            lunch: { hour: 12, minute: 0, second: 0 },
            dinner: { hour: 18, minute: 0, second: 0 }
          }
        },
        berries: [],
        ingredients: []
      },
      members: [
        mocks.createMockMemberProductionExt({
          production: {
            ...mocks.createMockMemberProductionExt().production,
            produceTotal: {
              ingredients: [],

              berries: [{ amount: 10, berry: berry.BELUE, level: 10 }]
            },
            produceWithoutSkill: {
              ingredients: [],

              berries: [{ amount: 10, berry: berry.BELUE, level: 10 }]
            },
            skillValue: {
              strength: {
                amountToSelf: 400,
                amountToTeam: 0
              }
            } as MemberSkillValue
          }
        }).production
      ]
    }
    await nextTick()

    const stackedBar = wrapper.findComponent({ name: 'StackedBar' })
    expect(stackedBar.exists()).toBe(true)

    expect(stackedBar.props('sections')).toEqual([
      { color: 'berry', percentage: 18.6, sectionText: '18.6%', tooltipText: '2.9K (18.6%)' },
      { color: 'berry-light', percentage: 0, sectionText: '0%', tooltipText: '0 (0%)' },
      { color: 'skill', percentage: 17.7, sectionText: '17.7%', tooltipText: '2.8K (17.7%)' },
      { color: 'curry', percentage: 63.5, sectionText: '63.5%', tooltipText: '10K (63.5%)' }
    ])
  })

  it('renders member progress bars correctly', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = mocks.createMockTeamProduction()
    await nextTick()

    const progressBars = wrapper.findAll('#memberBar')
    expect(progressBars.length).toBe(1)
  })
})
