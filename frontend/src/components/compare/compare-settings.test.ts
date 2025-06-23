import CompareSettings from '@/components/compare/compare-settings.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('CompareSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareSettings>>
  const mockPokemon = mocks.createMockPokemon()

  beforeEach(() => {
    wrapper = mount(CompareSettings)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('toggles teamMenu when the button is clicked', async () => {
    const button = wrapper.find('.v-btn')
    expect(wrapper.vm.teamMenu).toBe(false)
    await button.trigger('click')

    expect(wrapper.vm.teamMenu).toBe(true)
  })

  it('updates comparisonStore when a team is selected', async () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.teamIndex).toBeUndefined()
    wrapper.vm.selectTeam(0)
    expect(comparisonStore.teamIndex).not.toBeUndefined()
  })

  it('disables teams with more than 4 members', () => {
    let result = wrapper.vm.teamDisabled(['member1', 'member2', 'member3', 'member4', 'member5'])
    expect(result).toBe(true)
    result = wrapper.vm.teamDisabled([])
    expect(result).toBe(false)
    result = wrapper.vm.teamDisabled(['member1', 'member2', 'member3', 'member4', undefined])
    expect(result).toBe(false)
  })

  it('correctly provides member image when member exists', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    const imageUrl = wrapper.vm.memberImage(mockPokemon.externalId)
    expect(imageUrl).toMatchInlineSnapshot(`"/images/avatar/portrait/pikachu.png"`)
  })

  it('correctly toggles comparisonStore time window on clock container click', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.timeWindow = '8H'

    const clockContainer = wrapper.find('.clock-container')
    await clockContainer.trigger('click')

    expect(comparisonStore.timeWindow).toBe('24H')
  })

  it('calls comparisonStore.$reset() when the delete button is clicked', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.$reset = vi.fn()

    const deleteButton = wrapper.find('button.v-btn.v-btn--icon')
    await deleteButton.trigger('click')

    expect(wrapper.vm.isClearMenuOpen).toBe(true)

    const deleteModalButton = document.querySelector('button[aria-label="clear button"]') as HTMLElement
    deleteModalButton.click()

    expect(comparisonStore.$reset).toHaveBeenCalled()
  })

  it('applies camp-disabled class when camp is false', async () => {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()

    // Create a mock team with camp disabled
    const mockTeam = {
      index: 0,
      memberIndex: 0,
      name: 'Test Team',
      members: [mockPokemon.externalId, undefined, undefined, undefined, undefined],
      favoredBerries: [],
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      stockpiledIngredients: [],
      stockpiledBerries: [],
      recipeType: 'curry' as const,
      version: 0,
      memberIvs: {},
      production: undefined
    }

    teamStore.teams = [mockTeam]
    comparisonStore.teamIndex = 0

    await wrapper.vm.$nextTick()

    const campIcon = wrapper.find('[data-testid="camp-image"]')
    expect(campIcon).toBeDefined()
    expect(campIcon?.classes()).toContain('camp-disabled')
  })

  it('does not apply camp-disabled class when camp is true', async () => {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()

    // Create a mock team with camp enabled
    const mockTeam = {
      index: 0,
      memberIndex: 0,
      name: 'Test Team',
      members: [mockPokemon.externalId, undefined, undefined, undefined, undefined],
      favoredBerries: [],
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      stockpiledIngredients: [],
      stockpiledBerries: [],
      recipeType: 'curry' as const,
      version: 0,
      memberIvs: {},
      production: undefined
    }

    teamStore.teams = [mockTeam]
    comparisonStore.teamIndex = 0

    await wrapper.vm.$nextTick()

    const campIcon = wrapper.find('[data-testid="camp-image"]')
    expect(campIcon).toBeDefined()
    expect(campIcon?.classes()).not.toContain('camp-disabled')
  })
})
