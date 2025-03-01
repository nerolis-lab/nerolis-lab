import CookingResults, { type CookedRecipeResultDetails } from '@/components/calculator/results/cooking-results.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockTeamProduction } from '@/vitest'
import { mockCookingResult } from '@/vitest/mocks/calculator/mock-cooking-result'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { curry, ingredient } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CookingResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof CookingResults>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CookingResults)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction()
    await nextTick()

    const strengthSpan = wrapper.find('#weeklyStrength')
    expect(strengthSpan.text()).toBe('1,750') // 1000 * 1.75

    const sundaySpan = wrapper.find('#sundayStrength')
    expect(sundaySpan.text()).toBe('175') // 100 * 1.75

    const weekdaySpan = wrapper.find('#weekdayStrength')
    expect(weekdaySpan.text()).toBe('1,575')
  })

  it('renders progress bars for each recipe correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        berries: [],
        ingredients: [],
        cooking: {
          curry: {
            cookedRecipes: [
              {
                recipe: curry.INFERNO_CORN_KEEMA_CURRY,
                level: 1,
                count: 2,
                sunday: 1,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              },
              {
                recipe: curry.MILD_HONEY_CURRY,
                level: 1,
                count: 1,
                sunday: 1,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              }
            ],
            sundayStrength: 100,
            weeklyStrength: 1000
          },
          salad: {
            cookedRecipes: [],
            sundayStrength: 0,
            weeklyStrength: 0
          },
          dessert: {
            cookedRecipes: [],
            sundayStrength: 0,
            weeklyStrength: 0
          },
          critInfo: createMockTeamProduction().team.cooking!.critInfo
        }
      }
    })
    await nextTick()

    const progressBars = wrapper.findAllComponents({ name: 'VProgressLinear' })
    expect(progressBars.length).toBe(3)

    const firstProgress = progressBars.at(1)
    const secondProgress = progressBars.at(2)

    expect(firstProgress?.text()).toContain('66.67%')
    expect(secondProgress?.text()).toContain('33.33%')
  })

  it('renders daily team ingredients section correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        ingredients: [
          { amount: 5, ingredient: ingredient.SNOOZY_TOMATO },
          { amount: 3, ingredient: ingredient.BEAN_SAUSAGE }
        ],
        berries: []
      }
    })
    await nextTick()

    // Filter only ingredient images based on known src patterns
    const ingredientImages = wrapper.findAll('img').filter((img) => {
      const src = img.attributes('src')
      return src?.includes('ingredient')
    })

    expect(ingredientImages).toHaveLength(2)
    expect(ingredientImages.at(0)?.attributes('src')).toContain('tomato')
    expect(ingredientImages.at(1)?.attributes('src')).toContain('sausage')
  })

  it('computes and formats cookingStrength correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        ...createMockTeamProduction().team,
        cooking: mockCookingResult({ curry: { cookedRecipes: [], sundayStrength: 0, weeklyStrength: 3000 } })
      }
    })

    await nextTick()
    expect(wrapper.vm.cookingStrength).toBe('5,250') // 3000 * 1.75
  })

  it('toggles recipe details correctly', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        ...createMockTeamProduction().team,
        cooking: mockCookingResult({
          curry: {
            cookedRecipes: [
              {
                recipe: curry.INFERNO_CORN_KEEMA_CURRY,
                level: 1,
                count: 2,
                sunday: 1,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              }
            ],
            sundayStrength: 0,
            weeklyStrength: 3000
          }
        })
      }
    })
    await nextTick()

    expect(wrapper.vm.showDetailsState[0]).toBe(false)
    wrapper.vm.toggleDetails(0)
    expect(wrapper.vm.showDetailsState[0]).toBe(true)
  })

  it('calculates total cooks correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.production = createMockTeamProduction({
      team: {
        ...createMockTeamProduction().team,
        cooking: {
          ...mockCookingResult(),
          curry: {
            cookedRecipes: [
              {
                recipe: curry.INFERNO_CORN_KEEMA_CURRY,
                level: 1,
                count: 3,
                sunday: 0,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              },
              {
                recipe: curry.INFERNO_CORN_KEEMA_CURRY,
                level: 1,
                count: 5,
                sunday: 0,
                ingredientLimited: [],
                potLimited: { averageMissing: 0, count: 0 },
                totalSkipped: 0
              }
            ],
            sundayStrength: 0,
            weeklyStrength: 0
          }
        }
      }
    })
    await nextTick()

    expect(wrapper.vm.totalCooks).toBe(8)
  })

  it('renders stockpiled ingredients correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.stockpiledIngredients = [
      { amount: 10, name: 'Carrot' },
      { amount: 5, name: 'Potato' }
    ]
    await nextTick()

    // Filter only ingredient images based on known src patterns
    const ingredientImages = wrapper.findAll('img').filter((img) => {
      const src = img.attributes('src')
      return src?.includes('ingredient')
    })

    expect(ingredientImages).toHaveLength(2)
    expect(ingredientImages.at(0)?.attributes('src')).toContain('carrot')
    expect(ingredientImages.at(1)?.attributes('src')).toContain('potato')
  })

  it('rounds numbers correctly using MathUtils', () => {
    expect(wrapper.vm.round(2.456)).toBe(2.46)
    expect(wrapper.vm.round(2.123)).toBe(2.12)
  })

  it('determines if a recipe has been skipped', async () => {
    const recipe: CookedRecipeResultDetails = {
      count: 0,
      fullWeekPercentage: 0,
      recipe: curry.INFERNO_CORN_KEEMA_CURRY,
      level: 1,
      sunday: 0,
      totalSkipped: 0,
      potLimited: { count: 1, averageMissing: 0 },
      ingredientLimited: [{ count: 0, averageMissing: 0, ingredientName: 'Carrot' }],
      showDetails: false,
      weekdayPercentage: 0
    }
    expect(wrapper.vm.hasBeenSkipped(recipe)).toBe(true)
  })
})
