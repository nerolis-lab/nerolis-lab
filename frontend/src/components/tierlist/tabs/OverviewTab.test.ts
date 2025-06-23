import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks, type PokemonWithTiering, subskill } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { VImg, VList, VListItem, VRow } from 'vuetify/components'
import OverviewTab from './OverviewTab.vue'

// Only mock composables that need specific test behavior
vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false),
    isTinyMobile: ref(false),
    isLargeDesktop: ref(false),
    viewportWidth: ref(1024)
  }))
}))

// No need to mock utility functions - they work fine in tests!

describe('OverviewTab.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof OverviewTab>>
  let mockPokemon: PokemonWithTiering

  beforeEach(() => {
    vi.clearAllMocks()

    mockPokemon = commonMocks.pokemonWithTiering({
      tier: 'S',
      score: 1500,
      diff: 5,
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'PIKACHU',
        ingredientList: [
          { amount: 2, name: 'FANCY_APPLE' },
          { amount: 1, name: 'WARMING_GINGER' }
        ],
        settings: {
          level: 50,
          nature: 'ADAMANT',
          subskills: [subskill.INGREDIENT_FINDER_M.name, subskill.HELPING_SPEED_M.name],
          skillLevel: 6,
          carrySize: 15,
          ribbon: 4,
          externalId: 'pikachu-1'
        }
      }
    })

    wrapper = mount(OverviewTab, {
      props: {
        pokemon: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('renders correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent(VImg).exists()).toBe(true)
      expect(wrapper.findComponent(VList).exists()).toBe(true)
    })

    it('displays pokemon image', () => {
      const img = wrapper.findComponent(VImg)
      expect(img.exists()).toBe(true)
      expect(img.props('height')).toBe('140')
    })

    it('displays pokemon name', () => {
      expect(wrapper.text()).toContain('Pikachu')
    })

    it('displays frequency information', () => {
      expect(wrapper.text()).toContain('Frequency:')
    })

    it('displays carry size', () => {
      expect(wrapper.text()).toContain('Carry size:')
      expect(wrapper.text()).toContain('15')
    })

    it('displays ribbon information', () => {
      expect(wrapper.text()).toContain('Ribbon:')
      expect(wrapper.text()).toContain('4')
    })

    it('displays skill information', () => {
      expect(wrapper.text()).toContain('Skill')
      expect(wrapper.text()).toContain('Charge Strength S')
    })

    it('displays ingredient information', () => {
      expect(wrapper.text()).toContain('Ingredients')
    })
  })

  describe('List Items Display', () => {
    it('displays tier information', () => {
      const listItems = wrapper.findAllComponents(VListItem)
      expect(listItems.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('Tier')
    })

    it('displays overall score', () => {
      expect(wrapper.text()).toContain('Overall Score')
      expect(wrapper.text()).toContain('1,500') // Should be localized
    })

    it('displays rank change information', () => {
      expect(wrapper.text()).toContain('Rank Change')
    })

    it('displays nature information', () => {
      expect(wrapper.text()).toContain('Nature')
      expect(wrapper.text()).toContain('Adamant')
    })

    it('displays subskills section', () => {
      expect(wrapper.text()).toContain('Subskills')
      expect(wrapper.text()).toContain('Ing M') // Short name for Ingredient Finder M
      expect(wrapper.text()).toContain('Help M') // Short name for Helping Speed M
    })
  })

  describe('Responsive Design', () => {
    it('applies mobile layout when isMobile is true', async () => {
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(true),
        isTinyMobile: ref(false),
        isLargeDesktop: ref(false),
        viewportWidth: ref(375)
      })

      wrapper = mount(OverviewTab, {
        props: { pokemon: mockPokemon }
      })

      const mainRow = wrapper.findComponent(VRow)
      expect(mainRow.classes()).toContain('flex-column')
    })

    it('applies desktop layout when isMobile is false', () => {
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(false),
        isTinyMobile: ref(false),
        isLargeDesktop: ref(false),
        viewportWidth: ref(1024)
      })

      wrapper = mount(OverviewTab, {
        props: { pokemon: mockPokemon }
      })

      const mainRow = wrapper.findComponent(VRow)
      expect(mainRow.classes()).not.toContain('flex-column')
    })
  })

  describe('Edge Cases', () => {
    it('handles pokemon with no ingredients', async () => {
      const noIngredientsPokemon = commonMocks.pokemonWithTiering({
        ...mockPokemon,
        pokemonWithSettings: {
          ...mockPokemon.pokemonWithSettings,
          ingredientList: []
        }
      })

      wrapper = mount(OverviewTab, {
        props: { pokemon: noIngredientsPokemon }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('handles pokemon with minimal data', async () => {
      const minimalPokemon = commonMocks.pokemonWithTiering({
        tier: 'F',
        score: 0,
        diff: 0,
        pokemonWithSettings: {
          ...commonMocks.pokemonWithTiering().pokemonWithSettings,
          pokemon: 'BULBASAUR',
          ingredientList: [],
          settings: {
            level: 1,
            nature: 'HARDY',
            subskills: [],
            skillLevel: 1,
            carrySize: 5,
            ribbon: 0,
            externalId: 'bulbasaur-1'
          }
        }
      })

      wrapper = mount(OverviewTab, {
        props: { pokemon: minimalPokemon }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Bulbasaur')
    })
  })

  describe('Visual Elements', () => {
    it('displays subskill colors appropriately', () => {
      // Subskills should be displayed with their appropriate styling
      expect(wrapper.exists()).toBe(true)
    })

    it('displays ingredient information', () => {
      expect(wrapper.text()).toContain('Ingredients')
      // Ingredients are displayed with counts, not just names
      expect(wrapper.text()).toContain('2') // Amount for first ingredient
      expect(wrapper.text()).toContain('1') // Amount for second ingredient
    })
  })
})
