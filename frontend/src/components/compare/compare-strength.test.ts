import CompareStrength from '@/components/compare/compare-strength.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  MAX_RECIPE_LEVEL,
  berryPowerForLevel,
  getMaxIngredientBonus,
  recipeLevelBonus,
  type MemberProduction,
  type MemberSkillValue
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareStrength', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareStrength>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = mocks.createMockPokemon({ name: 'Ash', skillLevel: 1 })
  const mockMemberProduction: MemberProduction = mocks.createMockMemberProduction({
    skillValue: { strength: { amountToSelf: 100, amountToTeam: 0 } } as MemberSkillValue
  })

  beforeEach(() => {
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(CompareStrength, {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders member data correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    const member = pokemonStore.getPokemon(mockPokemon.externalId)!

    await nextTick()

    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells).toHaveLength(5)

    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berry power
    const berryPower =
      berryPowerForLevel(
        mockMemberProduction.produceTotal.berries[0].berry,
        mockMemberProduction.produceTotal.berries[0].level
      ) * (mockMemberProduction.produceTotal.berries[0].amount ?? 1)
    expect(firstRowCells[1].text()).toContain(berryPower.toString())

    // Check ingredient power range
    const lowestIngredientValue = Math.floor(
      AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          return sum + cur.amount * cur.ingredient.value
        }, 0)
    )
    expect(wrapper.vm.lowestIngredientPower(mockMemberProduction)).toEqual(lowestIngredientValue)

    const ingredientPower = firstRowCells[2].text()
    expect(ingredientPower).toContain(lowestIngredientValue.toString())

    // Check skill value
    const skillValue = StrengthService.skillStrength({
      skillActivation: member.pokemon.skill.getFirstActivation()!,
      skillValues: mockMemberProduction.skillValue,
      berries: mockMemberProduction.produceTotal.berries.filter((b) => b.level !== member.level),
      favoredBerries: [],
      timeWindow: '24H',
      areaBonus: 1
    })
    expect(skillValue).toEqual(Math.round(mockMemberProduction.skillAmount))
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + lowestIngredientValue + skillValue)
    expect(firstRowCells[4].text()).toContain(totalPower.toString())

    expect(totalPower).toEqual(3940)
  })

  it('renders 8h time window correctly in data tab', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.timeWindow = '8H'
    const member = pokemonStore.getPokemon(mockPokemon.externalId)!

    await nextTick()

    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells).toHaveLength(5)

    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berry power
    const factor = 1 / 3
    const berryPower = Math.floor(
      berryPowerForLevel(
        mockMemberProduction.produceTotal.berries[0].berry,
        mockMemberProduction.produceTotal.berries[0].level
      ) *
        mockMemberProduction.produceTotal.berries[0].amount *
        factor
    )
    expect(+firstRowCells[1].text()).toEqual(berryPower)

    // Check ingredient power range
    const lowestIngredientValue = Math.floor(
      (AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          return sum + cur.amount * cur.ingredient.value
        }, 0)) /
        3
    )
    expect(wrapper.vm.lowestIngredientPower(mockMemberProduction)).toEqual(lowestIngredientValue)

    const ingredientPower = firstRowCells[2].text()
    expect(ingredientPower).toContain(lowestIngredientValue.toString())

    // Check skill value
    const skillValue = StrengthService.skillStrength({
      skillActivation: member.pokemon.skill.getFirstActivation()!,
      skillValues: mockMemberProduction.skillValue,
      berries: mockMemberProduction.produceTotal.berries.filter((b) => b.level !== member.level),
      favoredBerries: comparisonStore.currentTeam?.favoredBerries ?? [],
      timeWindow: '8H',
      areaBonus: 1
    })
    expect(skillValue).toEqual(Math.round(mockMemberProduction.skillAmount * factor))
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + lowestIngredientValue + skillValue)
    expect(Math.abs(+firstRowCells[4].text())).toEqual(totalPower)
    expect(totalPower).toEqual(1313)
  })

  it('displays the correct number of headers', async () => {
    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(5)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Berry')
    expect(headers[2].text()).toBe('Ingredient')
    expect(headers[3].text()).toBe('Skill')
    expect(headers[4].text()).toBe('Total')
  })

  it('toggles between min and max ingredient power when switching options', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    // Go to data tab
    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    // Check initial state (min is default)
    let rows = wrapper.findAll('tbody tr')
    let firstRowCells = rows[0].findAll('td')
    const minIngredientPower = Math.floor(
      AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          return sum + cur.amount * cur.ingredient.value
        }, 0)
    )
    expect(firstRowCells[2].text()).toContain(minIngredientPower.toString())

    wrapper.vm.selectedIngredientOption = 'max'
    await nextTick()

    // Check that it switched to max
    rows = wrapper.findAll('tbody tr')
    firstRowCells = rows[0].findAll('td')
    const maxIngredientPower = Math.floor(
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
        AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce((sum, cur) => {
          const ingredientBonus = 1 + getMaxIngredientBonus(cur.ingredient.name) / 100
          return sum + cur.amount * ingredientBonus * cur.ingredient.value
        }, 0)
    )
    expect(firstRowCells[2].text()).toContain(maxIngredientPower.toString())

    expect(maxIngredientPower).toBeGreaterThan(minIngredientPower)
  })
})
