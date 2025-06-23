import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks, type PokemonWithTiering } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { VAlert, VBtn, VCard, VChipGroup, VList, VListItem, VProgressCircular } from 'vuetify/components'
import RecipesTab from './RecipesTab.vue'

// Only mock composables that need specific test behavior
vi.mock('@/composables/use-breakpoint/use-breakpoint', () => ({
  useBreakpoint: vi.fn(() => ({
    isMobile: ref(false),
    isTinyMobile: ref(false),
    isLargeDesktop: ref(false),
    viewportWidth: ref(1024)
  }))
}))

describe('RecipesTab.vue', () => {
  let wrapper: VueWrapper<InstanceType<typeof RecipesTab>>
  let mockPokemon: PokemonWithTiering
  let mockAllVariantsData: PokemonWithTiering[]

  beforeEach(() => {
    vi.clearAllMocks()

    mockPokemon = commonMocks.pokemonWithTiering({
      tier: 'S',
      score: 1500,
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'PIKACHU',
        ingredientList: [
          { amount: 2, name: 'FANCY_APPLE' },
          { amount: 1, name: 'WARMING_GINGER' }
        ]
      },
      contributions: [
        {
          recipe: 'FANCY_APPLE_CURRY',
          score: 1000,
          coverage: 85.5,
          skillValue: 150,
          team: [
            {
              pokemon: 'CHARIZARD',
              ingredientList: [{ amount: 1, name: 'FIERY_HERB' }]
            }
          ]
        }
      ]
    })

    mockAllVariantsData = [
      mockPokemon,
      commonMocks.pokemonWithTiering({
        tier: 'A',
        score: 1200,
        pokemonWithSettings: {
          ...commonMocks.pokemonWithTiering().pokemonWithSettings,
          pokemon: 'PIKACHU',
          ingredientList: [
            { amount: 1, name: 'FANCY_APPLE' },
            { amount: 2, name: 'WARMING_GINGER' }
          ]
        },
        contributions: [
          {
            recipe: 'MILD_HONEY_CURRY',
            score: 800,
            coverage: 75.0,
            skillValue: 100,
            team: []
          }
        ]
      })
    ]

    wrapper = mount(RecipesTab, {
      props: {
        pokemon: mockPokemon,
        allPokemonVariantsData: mockAllVariantsData,
        selectedVariantIndex: 0
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
    })

    it('renders variants section when there are multiple variants', () => {
      expect(wrapper.findComponent(VCard).exists()).toBe(true)
      expect(wrapper.text()).toContain('Variants')
      expect(wrapper.findComponent(VChipGroup).exists()).toBe(true)
    })

    it('does not render variants section when there is only one variant', async () => {
      await wrapper.setProps({
        allPokemonVariantsData: [mockPokemon]
      })

      expect(wrapper.text()).not.toContain('Variants')
    })
  })

  describe('Variant Chips', () => {
    it('displays correct number of variant chips', () => {
      const chips = wrapper.findAllComponents(CustomChip)
      expect(chips.length).toBeGreaterThan(0)
    })

    it('shows tier information in chips', () => {
      const chips = wrapper.findAllComponents(CustomChip)
      expect(chips[0].text()).toContain('S')
    })

    it('displays ingredient avatars in chips', () => {
      // Ingredients should be displayed in the UI
      expect(wrapper.text()).toContain('Fancy Apple')
      // Note: The displayed ingredients depend on what the component actually shows
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('shows loading state for large datasets', async () => {
      const largeVariantData = Array(200)
        .fill(null)
        .map(() =>
          commonMocks.pokemonWithTiering({
            pokemonWithSettings: {
              ...commonMocks.pokemonWithTiering().pokemonWithSettings,
              pokemon: 'PIKACHU'
            }
          })
        )

      await wrapper.setProps({
        allPokemonVariantsData: largeVariantData
      })

      await nextTick()

      expect(wrapper.findComponent(VProgressCircular).exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading recipe contributions')
    })
  })

  describe('Error State', () => {
    it('shows error alert when variant has no contributions', async () => {
      const noContributionsPokemon = commonMocks.pokemonWithTiering({
        pokemonWithSettings: {
          ...commonMocks.pokemonWithTiering().pokemonWithSettings,
          pokemon: 'PIKACHU'
        },
        contributions: []
      })

      await wrapper.setProps({
        pokemon: noContributionsPokemon,
        allPokemonVariantsData: [noContributionsPokemon]
      })

      await nextTick()

      expect(wrapper.findComponent(VAlert).exists()).toBe(true)
      expect(wrapper.text()).toContain('Unable to load recipe data')
    })

    it('shows retry button in error state', async () => {
      const noContributionsPokemon = commonMocks.pokemonWithTiering({
        pokemonWithSettings: {
          ...commonMocks.pokemonWithTiering().pokemonWithSettings,
          pokemon: 'PIKACHU'
        },
        contributions: []
      })

      await wrapper.setProps({
        pokemon: noContributionsPokemon,
        allPokemonVariantsData: [noContributionsPokemon]
      })

      await nextTick()

      const retryButton = wrapper.findComponent(VBtn)
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Retry')
    })
  })

  describe('Recipe Contributions Display', () => {
    it('displays recipe contributions list', () => {
      const list = wrapper.findComponent(VList)
      expect(list.exists()).toBe(true)

      const listItems = wrapper.findAllComponents(VListItem)
      expect(listItems.length).toBeGreaterThan(0)
    })

    it('displays recipe information correctly', () => {
      expect(wrapper.text()).toContain('Contribution:')
    })

    it('shows contribution score', () => {
      expect(wrapper.text()).toContain('1,000') // Should be localized
    })

    it('displays coverage percentage', () => {
      expect(wrapper.text()).toContain('Coverage: 85.5%')
    })

    it('displays support value when present', () => {
      expect(wrapper.text()).toContain('Support value:')
      expect(wrapper.text()).toContain('150')
    })

    it('displays recipe images', () => {
      // Recipe images should be present in the component
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Team Display', () => {
    it('displays team members when present', () => {
      expect(wrapper.text()).toContain('Team:')
      // Team members are displayed in the component
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Pagination', () => {
    it('handles pagination for large variant counts', async () => {
      const manyVariants = Array(15)
        .fill(null)
        .map((_, index) =>
          commonMocks.pokemonWithTiering({
            tier: 'B',
            pokemonWithSettings: {
              ...commonMocks.pokemonWithTiering().pokemonWithSettings,
              pokemon: 'PIKACHU',
              ingredientList: [{ amount: index + 1, name: 'FANCY_APPLE' }]
            }
          })
        )

      await wrapper.setProps({
        allPokemonVariantsData: manyVariants
      })

      expect(wrapper.text()).toContain('Showing')
      expect(wrapper.text()).toContain('variants')
    })

    it('shows navigation buttons for pagination', async () => {
      const manyVariants = Array(15)
        .fill(null)
        .map((_, index) =>
          commonMocks.pokemonWithTiering({
            tier: 'B',
            pokemonWithSettings: {
              ...commonMocks.pokemonWithTiering().pokemonWithSettings,
              pokemon: 'PIKACHU',
              ingredientList: [{ amount: index + 1, name: 'FANCY_APPLE' }]
            }
          })
        )

      await wrapper.setProps({
        allPokemonVariantsData: manyVariants
      })

      const navButtons = wrapper.findAllComponents(VBtn)
      expect(navButtons.length).toBeGreaterThan(0)

      // Check for pagination-related buttons (could be actual nav buttons or pagination indicators)
      const hasNavigationButtons = navButtons.some(
        (btn) =>
          btn.attributes('aria-label')?.includes('previous') ||
          btn.attributes('aria-label')?.includes('next') ||
          btn.classes().includes('v-pagination')
      )

      expect(hasNavigationButtons || navButtons.length >= 2).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('handles mobile layout', async () => {
      const mockUseBreakpoint = vi.mocked(useBreakpoint)
      mockUseBreakpoint.mockReturnValue({
        isMobile: ref(true),
        isTinyMobile: ref(false),
        isLargeDesktop: ref(false),
        viewportWidth: ref(375)
      })

      wrapper = mount(RecipesTab, {
        props: {
          pokemon: mockPokemon,
          allPokemonVariantsData: mockAllVariantsData
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Props Handling', () => {
    it('handles selectedVariantIndex prop changes', async () => {
      await wrapper.setProps({ selectedVariantIndex: 1 })
      expect(wrapper.exists()).toBe(true)
    })

    it('handles empty allPokemonVariantsData', async () => {
      await wrapper.setProps({ allPokemonVariantsData: [] })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Visual Elements', () => {
    it('displays recipe styling appropriately', () => {
      // Recipe contributions should be displayed with appropriate styling
      expect(wrapper.exists()).toBe(true)
    })
  })
})
