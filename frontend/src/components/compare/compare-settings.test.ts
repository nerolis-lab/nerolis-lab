import CompareSettings from '@/components/compare/compare-settings.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
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

  it('renders TeamSelect component', async () => {
    const teamSelect = wrapper.findComponent({ name: 'TeamSelect' })
    expect(teamSelect.exists()).toBe(true)
  })

  it('updates comparisonStore when a team is selected', async () => {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()

    // Create a mock team
    const mockTeam: TeamInstance[] = mocks.createMockTeams(1, {
      index: 0,
      memberIndex: 0,
      name: 'Test Team',
      members: [mockPokemon.externalId, undefined, undefined, undefined, undefined],
      island: mocks.islandInstance(),
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      stockpiledIngredients: [],
      stockpiledBerries: [],
      recipeType: 'curry' as const,
      version: 0,
      memberIvs: {},
      production: undefined
    })

    teamStore.teams = mockTeam
    expect(comparisonStore.teamIndex).toBeUndefined()

    // Find TeamSelect component and update its v-model
    const teamSelect = wrapper.findComponent({ name: 'TeamSelect' })
    await teamSelect.vm.$emit('update:modelValue', 0)

    expect(comparisonStore.teamIndex).toBe(0)
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

  it('passes correct props to TeamSelect for camp display', async () => {
    const comparisonStore = useComparisonStore()
    const teamStore = useTeamStore()

    // Create a mock team with camp disabled
    const mockTeam: TeamInstance = {
      index: 0,
      memberIndex: 0,
      name: 'Test Team',
      members: [mockPokemon.externalId, undefined, undefined, undefined, undefined],
      island: mocks.islandInstance(),
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

    const teamSelect = wrapper.findComponent({ name: 'TeamSelect' })
    expect(teamSelect.props('showCamp')).toBe(true)
    expect(teamSelect.props('showSleepScore')).toBe(true)
    expect(teamSelect.props('showIsland')).toBe(true)
  })
})
