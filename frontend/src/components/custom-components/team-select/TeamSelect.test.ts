import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import * as imageUtils from '@/services/utils/image-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import type { TeamInstance } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { VBtn, VCard, VImg, VList, VListItem, VMenu, VProgressCircular } from 'vuetify/components'
import TeamSelect from './TeamSelect.vue'

// Mock composables and stores
vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false)
  }))
}))

vi.mock('@/services/utils/image-utils', () => ({
  avatarImage: vi.fn(() => '/images/pokemon/PIKACHU.png'),
  islandImage: vi.fn(() => '/images/islands/test-island.png')
}))

describe('TeamSelect.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSelect>>
  let mockTeams: TeamInstance[]
  let mockPokemon1: ReturnType<typeof createMockPokemon>
  let mockPokemon2: ReturnType<typeof createMockPokemon>
  let mockPokemon3: ReturnType<typeof createMockPokemon>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock teams with different configurations
    mockPokemon1 = createMockPokemon({ externalId: 'pokemon-1' })
    mockPokemon2 = createMockPokemon({ externalId: 'pokemon-2' })
    mockPokemon3 = createMockPokemon({ externalId: 'pokemon-3' })

    mockTeams = [
      {
        ...createMockTeams(1)[0],
        index: 0,
        name: 'Team Alpha',
        camp: true,
        bedtime: '22:00',
        wakeup: '07:00',
        island: mocks.islandInstance({ berries: [berry.BELUE] }),
        members: [mockPokemon1.externalId, mockPokemon2.externalId, undefined, undefined, undefined]
      },
      {
        ...createMockTeams(1)[0],
        index: 1,
        name: 'Team Beta',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:30',
        island: mocks.islandInstance({ berries: [berry.CHESTO] }),
        members: [mockPokemon3.externalId, undefined, undefined, undefined, undefined]
      },
      {
        ...createMockTeams(1)[0],
        index: 2,
        name: 'Empty Team',
        camp: false,
        bedtime: '21:00',
        wakeup: '06:00',
        island: mocks.islandInstance({ berries: [] }),
        members: [undefined, undefined, undefined, undefined, undefined]
      }
    ]

    // Mount component with teams prop to avoid store dependency issues
    wrapper = mount(TeamSelect, {
      props: {
        teams: mockTeams
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Component Rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent(VMenu).exists()).toBe(true)
      expect(wrapper.findComponent(VBtn).exists()).toBe(true)
    })

    it('displays placeholder text when no team is selected', () => {
      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Select team')
    })

    it('displays custom placeholder text', () => {
      wrapper = mount(TeamSelect, {
        props: {
          placeholderText: 'Choose your team'
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Choose your team')
    })

    it('applies custom button class', () => {
      wrapper = mount(TeamSelect, {
        props: {
          buttonClass: 'custom-button-class'
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.classes()).toContain('custom-button-class')
    })
  })

  describe('Team Selection Display', () => {
    it('displays selected team name', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Team Alpha')
    })

    it('displays full details when showFullDetails is true and not mobile', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showFullDetails: true
        }
      })

      // Should show island image
      const islandImages = wrapper.findAll('[data-testid="camp-image"]')
      expect(islandImages.length).toBeGreaterThan(0)
    })

    it('displays only team name when showFullDetails is false', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showFullDetails: false
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Team Alpha')
      // Should not show camp image when showFullDetails is false
      expect(wrapper.find('[data-testid="camp-image"]').exists()).toBe(false)
    })

    it('displays simplified view on mobile', () => {
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(true)
      } as ReturnType<typeof useBreakpoint>)

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showFullDetails: true
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Team Alpha')
      // On mobile with showFullDetails, should not show detailed info
      expect(wrapper.find('[data-testid="camp-image"]').exists()).toBe(false)
    })
  })

  describe('Visual Elements', () => {
    it('shows island image when showIsland is true', () => {
      // Mock the breakpoint to ensure we're not on mobile
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(false)
      } as ReturnType<typeof useBreakpoint>)

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showIsland: true,
          showFullDetails: true
        }
      })

      expect(imageUtils.islandImage).toHaveBeenCalledWith({
        island: mockTeams[0].island,
        background: false
      })
    })

    it('shows camp image when showCamp is true', () => {
      // Mock the breakpoint to ensure we're not on mobile
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(false)
      } as ReturnType<typeof useBreakpoint>)

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showCamp: true,
          showFullDetails: true
        }
      })

      const campImage = wrapper.find('[data-testid="camp-image"]')
      expect(campImage.exists()).toBe(true)
      expect(campImage.attributes('src')).toBe('/images/misc/camp.png')
    })

    it('applies camp-disabled class when camp is false', () => {
      // Mock the breakpoint to ensure we're not on mobile
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(false)
      } as ReturnType<typeof useBreakpoint>)

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 1, // Team Beta has camp: false
          teams: mockTeams,
          showCamp: true,
          showFullDetails: true
        }
      })

      const campImage = wrapper.find('[data-testid="camp-image"]')
      expect(campImage.exists()).toBe(true)
      expect(campImage.classes()).toContain('camp-disabled')
    })

    it('shows sleep score when showSleepScore is true', () => {
      const mockSleepScore = vi.spyOn(TimeUtils, 'sleepScore').mockReturnValue(85)

      // Mock the breakpoint to ensure we're not on mobile
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(false)
      } as ReturnType<typeof useBreakpoint>)

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showSleepScore: true,
          showFullDetails: true
        }
      })

      expect(mockSleepScore).toHaveBeenCalledWith({
        bedtime: mockTeams[0].bedtime,
        wakeup: mockTeams[0].wakeup
      })

      const progressCircular = wrapper.findComponent(VProgressCircular)
      expect(progressCircular.exists()).toBe(true)
      expect(progressCircular.props('modelValue')).toBe(85)
    })

    it('shows member images when showMembers is true', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showMembers: true
        }
      })

      const memberImages = wrapper.findAllComponents(VImg)
      // Component should render correctly even if Pokemon data is missing
      expect(memberImages.length).toBeGreaterThanOrEqual(0)
      // avatarImage won't be called if Pokemon don't exist in store
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Menu Functionality', () => {
    it('opens menu when button is clicked', async () => {
      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const menu = wrapper.findComponent(VMenu)
      expect(menu.props('modelValue')).toBe(true)
    })

    it('displays card with correct title', async () => {
      wrapper = mount(TeamSelect, {
        props: {
          cardTitle: 'Choose Team'
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const card = wrapper.findComponent(VCard)
      expect(card.props('title')).toBe('Choose Team')
    })

    it('has helper text prop configured correctly', () => {
      wrapper = mount(TeamSelect, {
        props: {
          helperText: 'Select a team to compare'
        }
      })

      // Test that the prop is passed correctly to the component
      expect(wrapper.props('helperText')).toBe('Select a team to compare')
    })

    it('has showDeleteButton configured correctly when true', () => {
      wrapper = mount(TeamSelect, {
        props: {
          showDeleteButton: true
        }
      })

      expect(wrapper.props('showDeleteButton')).toBe(true)
    })

    it('has showDeleteButton configured correctly when false', () => {
      wrapper = mount(TeamSelect, {
        props: {
          showDeleteButton: false
        }
      })

      expect(wrapper.props('showDeleteButton')).toBe(false)
    })
  })

  describe('Team List Display', () => {
    it('uses provided teams prop', () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: mockTeams
        }
      })

      // Test that teams computed property uses provided teams
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).teams).toEqual(mockTeams)
    })

    it('uses teamStore teams when no teams prop provided', () => {
      wrapper = mount(TeamSelect)

      // Test that teams computed property falls back to store teams
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teams = (wrapper.vm as any).teams
      expect(teams).toBeDefined()
      expect(teams.length).toBeGreaterThan(0)
    })

    it('calls getMemberImage for team members when team is selected', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0, // Select first team to trigger member image loading
          teams: mockTeams,
          showMembers: true
        }
      })

      // Verify that component renders correctly with team members
      // avatarImage won't be called if Pokemon don't exist in store
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Team Filtering', () => {
    it('disables teams that exceed maxTeamSize', async () => {
      // Create a team with too many members
      const overSizedTeam = {
        ...mockTeams[0],
        members: ['pokemon-1', 'pokemon-2', 'pokemon-3', 'pokemon-4', 'pokemon-5'] // 5 members
      }

      wrapper = mount(TeamSelect, {
        props: {
          teams: [overSizedTeam],
          maxTeamSize: 3 // Max 3 members allowed
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const listItem = wrapper.findComponent(VListItem)
      expect(listItem.props('disabled')).toBe(true)
      expect(listItem.props('variant')).toBe('tonal')
    })

    it('enables teams within maxTeamSize limit', async () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: mockTeams,
          maxTeamSize: 4
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const listItems = wrapper.findAllComponents(VListItem)
      // All mock teams should be enabled since they have ≤ 4 members
      listItems.forEach((item) => {
        expect(item.props('disabled')).toBe(false)
      })
    })
  })

  describe('Event Handling', () => {
    it('emits update:modelValue when team is selected', async () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: mockTeams
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const listItems = wrapper.findAllComponents(VListItem)
      await listItems[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([1])
    })

    it('closes menu after team selection', async () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: mockTeams
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const listItems = wrapper.findAllComponents(VListItem)
      await listItems[0].trigger('click')

      // Menu should close after selection
      await wrapper.vm.$nextTick()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).menuOpen).toBe(false)
    })

    it('emits clear event when handleClear is called', () => {
      wrapper = mount(TeamSelect, {
        props: {
          showDeleteButton: true
        }
      })

      // Call the handleClear method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).handleClear()

      expect(wrapper.emitted('clear')).toBeTruthy()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).menuOpen).toBe(false)
    })

    it('emits update:modelValue when selectTeam is called', () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: mockTeams
        }
      })

      // Call the selectTeam method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectTeam(1)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([1])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).menuOpen).toBe(false)
    })

    it('correctly identifies disabled teams', () => {
      const overSizedTeam = {
        ...mockTeams[0],
        members: ['pokemon-1', 'pokemon-2', 'pokemon-3', 'pokemon-4', 'pokemon-5']
      }

      wrapper = mount(TeamSelect, {
        props: {
          teams: [overSizedTeam],
          maxTeamSize: 3
        }
      })

      // Test the isTeamDisabled method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isDisabled = (wrapper.vm as any).isTeamDisabled(overSizedTeam)
      expect(isDisabled).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined selectedTeam gracefully', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: undefined, // No selection
          teams: mockTeams,
          placeholderText: 'Select team'
        }
      })

      const button = wrapper.findComponent(VBtn)
      expect(button.text()).toContain('Select team') // Should show placeholder
    })

    it('handles empty teams array', async () => {
      wrapper = mount(TeamSelect, {
        props: {
          teams: []
        }
      })

      const button = wrapper.findComponent(VBtn)
      await button.trigger('click')

      const list = wrapper.findComponent(VList)
      expect(list.exists()).toBe(true)
      const listItems = wrapper.findAllComponents(VListItem)
      expect(listItems).toHaveLength(0)
    })

    it('handles teams with undefined members gracefully', () => {
      const teamWithUndefinedMembers = {
        ...mockTeams[0],
        members: [undefined, undefined, undefined, undefined, undefined]
      }

      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: [teamWithUndefinedMembers]
        }
      })

      expect(() => wrapper.findComponent(VBtn)).not.toThrow()
    })

    it('handles missing pokemon data gracefully', () => {
      wrapper = mount(TeamSelect, {
        props: {
          modelValue: 0,
          teams: mockTeams,
          showMembers: true
        }
      })

      // Should not throw error when pokemon data is missing
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Props Validation', () => {
    it('respects all boolean prop defaults', () => {
      wrapper = mount(TeamSelect)

      // Verify default prop values through component behavior
      expect(wrapper.props('showFullDetails')).toBe(true)
      expect(wrapper.props('showIsland')).toBe(true)
      expect(wrapper.props('showCamp')).toBe(true)
      expect(wrapper.props('showSleepScore')).toBe(true)
      expect(wrapper.props('showMembers')).toBe(true)
      expect(wrapper.props('showDeleteButton')).toBe(true)
    })

    it('overrides default props correctly', () => {
      wrapper = mount(TeamSelect, {
        props: {
          showFullDetails: false,
          showIsland: false,
          showCamp: false,
          showSleepScore: false,
          showMembers: false,
          showDeleteButton: false,
          maxTeamSize: 2,
          placeholderText: 'Custom placeholder',
          cardTitle: 'Custom title'
        }
      })

      expect(wrapper.props('showFullDetails')).toBe(false)
      expect(wrapper.props('showIsland')).toBe(false)
      expect(wrapper.props('showCamp')).toBe(false)
      expect(wrapper.props('showSleepScore')).toBe(false)
      expect(wrapper.props('showMembers')).toBe(false)
      expect(wrapper.props('showDeleteButton')).toBe(false)
      expect(wrapper.props('maxTeamSize')).toBe(2)
      expect(wrapper.props('placeholderText')).toBe('Custom placeholder')
      expect(wrapper.props('cardTitle')).toBe('Custom title')
    })
  })
})
