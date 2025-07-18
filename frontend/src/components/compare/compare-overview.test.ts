import CompareOverview from '@/components/compare/compare-overview.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { MathUtils, type MemberProduction } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareOverview', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareOverview>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = mocks.createMockPokemon({ name: 'Ash' })
  const mockMemberProduction: MemberProduction = mocks.createMockMemberProduction()

  beforeEach(() => {
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(CompareOverview, {})
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

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(4)

    // Check member name
    expect(firstRowCells[0].text()).toContain(mockPokemon.name)

    // Check berries
    expect(firstRowCells[1].text()).toContain('10')

    // Check ingredients
    expect(firstRowCells[2].text()).toContain('10')
    expect(firstRowCells[2].text()).toContain('20')

    // Check skill procs
    expect(firstRowCells[3].text()).toContain('5')
  })

  it('renders 8h time window correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.timeWindow = '8H'

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(4)

    // Check member name
    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berries
    expect(firstRowCells[1].text()).toContain('3.3')

    // Check ingredients
    expect(firstRowCells[2].text()).toContain('3.3')
    expect(firstRowCells[2].text()).toContain('6.7')

    // Check skill procs
    expect(firstRowCells[3].text()).toContain('1.7')
  })

  it('correctly computes the rounded values', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const members = wrapper.vm.members
    expect(members[0].berries).toBe(MathUtils.round(mockMemberProduction.produceTotal.berries[0].amount, 1))
    expect(members[0].skillProcs).toBe(MathUtils.round(mockMemberProduction.skillProcs, 1))
  })

  it('displays ingredient images correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const ingredientImages = wrapper.findAll('[data-testid="ingredient-image"]')
    expect(ingredientImages.length).toBe(2)
    expect(ingredientImages[0].attributes('src')).toBe('/images/ingredient/apple.png')
    expect(ingredientImages[1].attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays the correct number of headers', () => {
    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(4)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Berry')
    expect(headers[2].text()).toBe('Ingredient')
    expect(headers[3].text()).toBe('Skill')
  })
})
