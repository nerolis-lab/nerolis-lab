import { getTierColor } from '@/services/utils/tierlist-utils'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import type { PokemonWithTiering, Tier } from 'sleepapi-common'
import { commonMocks } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VCard } from 'vuetify/components'
import PokemonCard from './PokemonCard.vue'
import TierRow from './TierRow.vue'

vi.mock('@/services/utils/tierlist-utils', () => ({
  getTierColor: vi.fn((tier: string) => `rgba(var(--tier-${tier.toLowerCase()}), 0.1)`)
}))

describe('TierRow', () => {
  let wrapper: VueWrapper<InstanceType<typeof TierRow>>

  const mockPokemonData: PokemonWithTiering[] = [
    commonMocks.pokemonWithTiering({
      tier: 'S',
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'PIKACHU'
      }
    }),
    commonMocks.pokemonWithTiering({
      tier: 'S',
      pokemonWithSettings: {
        ...commonMocks.pokemonWithTiering().pokemonWithSettings,
        pokemon: 'CHARMANDER'
      }
    })
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(TierRow, {
      props: {
        tier: 'S',
        pokemonsInTier: mockPokemonData
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAllComponents(VCard).length).toBeGreaterThan(0)
  })

  describe('Props', () => {
    it('displays the correct tier label', () => {
      const tierLabel = wrapper.find('.text-h4')
      expect(tierLabel.exists()).toBe(true)
      expect(tierLabel.text()).toBe('S')
    })

    it('renders the correct number of Pokemon cards', () => {
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards.length).toBe(2)
    })

    it('passes correct pokemon data to PokemonCard components', () => {
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards[0].props('pokemon')).toEqual(mockPokemonData[0])
      expect(pokemonCards[1].props('pokemon')).toEqual(mockPokemonData[1])
    })

    it('works with different tier values', async () => {
      const tierValues: Tier[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']

      for (const tier of tierValues) {
        await wrapper.setProps({ tier })
        const tierLabel = wrapper.find('.text-h4')
        expect(tierLabel.text()).toBe(tier)
      }
    })

    it('handles empty pokemon array', async () => {
      await wrapper.setProps({ pokemonsInTier: [] })
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards.length).toBe(0)
    })

    it('handles single pokemon in tier', async () => {
      const singlePokemon = [mockPokemonData[0]]
      await wrapper.setProps({ pokemonsInTier: singlePokemon })
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards.length).toBe(1)
    })
  })

  describe('Computed Properties', () => {
    describe('tierLabelColor', () => {
      it('uses correct tier-s color from theme', () => {
        const tierCard = wrapper.findAllComponents(VCard)[1] // Second card is the tier label
        // Get the theme colors from the global vuetify instance
        const vuetifyInstance = wrapper.vm.$vuetify
        const expectedColor = vuetifyInstance.theme.current.colors['tier-s']
        expect(tierCard.props('color')).toBe(expectedColor)
      })

      it('falls back to surface color when tier color not found', async () => {
        await wrapper.setProps({ tier: 'INVALID' as Tier })
        const tierCard = wrapper.findAllComponents(VCard)[1]
        const vuetifyInstance = wrapper.vm.$vuetify
        const expectedColor = vuetifyInstance.theme.current.colors.surface
        expect(tierCard.props('color')).toBe(expectedColor)
      })

      it('uses correct colors for all tier values', async () => {
        const tierValues: Tier[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F']

        for (const tier of tierValues) {
          await wrapper.setProps({ tier })
          const tierCard = wrapper.findAllComponents(VCard)[1]
          const vuetifyInstance = wrapper.vm.$vuetify
          const expectedColor = vuetifyInstance.theme.current.colors[`tier-${tier.toLowerCase()}`]
          expect(tierCard.props('color')).toBe(expectedColor)
        }
      })

      it('verifies tier colors are accessible from theme', () => {
        // Verify all tier colors exist in theme
        const tierColors = ['tier-s', 'tier-a', 'tier-b', 'tier-c', 'tier-d', 'tier-e', 'tier-f']
        const vuetifyInstance = wrapper.vm.$vuetify

        tierColors.forEach((tierColor) => {
          expect(vuetifyInstance.theme.current.colors[tierColor]).toBeDefined()
          expect(typeof vuetifyInstance.theme.current.colors[tierColor]).toBe('string')
        })

        // Test that the tier-s color (current prop) matches theme
        const tierCard = wrapper.findAllComponents(VCard)[1]
        const expectedColor = vuetifyInstance.theme.current.colors['tier-s']
        expect(tierCard.props('color')).toBe(expectedColor)
      })
    })

    describe('tierRowBackgroundStyle', () => {
      it('calls getTierColor with correct tier', () => {
        expect(getTierColor).toHaveBeenCalledWith('S')
      })

      it('applies the returned background style', () => {
        const mainCard = wrapper.findAllComponents(VCard)[0] // First card is the main container
        expect(mainCard.props('color')).toBe('rgba(var(--tier-s), 0.1)')
      })

      it('updates when tier prop changes', async () => {
        await wrapper.setProps({ tier: 'A' as Tier })
        expect(getTierColor).toHaveBeenCalledWith('A')
      })
    })
  })

  describe('Event Handling', () => {
    it('emits click:pokemon event when PokemonCard is clicked', async () => {
      const pokemonCard = wrapper.findAllComponents(PokemonCard)[0]
      await pokemonCard.trigger('click')

      expect(wrapper.emitted('click:pokemon')).toBeTruthy()
      expect(wrapper.emitted('click:pokemon')![0]).toEqual([mockPokemonData[0]])
    })

    it('emits correct pokemon data for different cards', async () => {
      const pokemonCards = wrapper.findAllComponents(PokemonCard)

      // Click first pokemon
      await pokemonCards[0].trigger('click')
      expect(wrapper.emitted('click:pokemon')![0]).toEqual([mockPokemonData[0]])

      // Click second pokemon
      await pokemonCards[1].trigger('click')
      expect(wrapper.emitted('click:pokemon')![1]).toEqual([mockPokemonData[1]])
    })

    it('handles multiple clicks on same pokemon', async () => {
      const pokemonCard = wrapper.findAllComponents(PokemonCard)[0]

      await pokemonCard.trigger('click')
      await pokemonCard.trigger('click')
      await pokemonCard.trigger('click')

      expect(wrapper.emitted('click:pokemon')!.length).toBe(3)
      expect(wrapper.emitted('click:pokemon')![0]).toEqual([mockPokemonData[0]])
      expect(wrapper.emitted('click:pokemon')![1]).toEqual([mockPokemonData[0]])
      expect(wrapper.emitted('click:pokemon')![2]).toEqual([mockPokemonData[0]])
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct CSS classes', () => {
      const mainCard = wrapper.findAllComponents(VCard)[0]
      expect(mainCard.classes()).toContain('flex-left')
      expect(mainCard.classes()).toContain('align-stretch')
      expect(mainCard.classes()).toContain('mb-3')
    })

    it('applies correct tier label styling', () => {
      const tierCard = wrapper.findAllComponents(VCard)[1]
      expect(tierCard.classes()).toContain('flex-center')
      expect(tierCard.props('minWidth')).toBe('60px')
      expect(tierCard.props('maxWidth')).toBe('60px')
    })

    it('applies correct text styling to tier label', () => {
      const tierText = wrapper.find('.text-h4')
      expect(tierText.classes()).toContain('font-weight-semibold')
    })

    it('applies correct layout classes to pokemon container', () => {
      const pokemonContainer = wrapper.find('.flex-left.flex-wrap.ml-1')
      expect(pokemonContainer.exists()).toBe(true)
    })

    it('applies margin classes to pokemon cards', () => {
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      pokemonCards.forEach((card) => {
        expect(card.classes()).toContain('ma-1')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles very long pokemon names', async () => {
      const longNamePokemon = [
        commonMocks.pokemonWithTiering({
          tier: 'S' as Tier,
          pokemonWithSettings: {
            ...commonMocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'VERY_VERY_VERY_LONG_POKEMON_NAME_THAT_MIGHT_BREAK_LAYOUT'
          }
        })
      ]

      await wrapper.setProps({ pokemonsInTier: longNamePokemon })
      expect(wrapper.exists()).toBe(true)
      const pokemonCard = wrapper.findAllComponents(PokemonCard)[0]
      expect(pokemonCard.exists()).toBe(true)
    })

    it('handles large numbers of pokemon in tier', async () => {
      const manyPokemon = Array.from({ length: 50 }, (_, i) =>
        commonMocks.pokemonWithTiering({
          tier: 'S' as Tier,
          pokemonWithSettings: {
            ...commonMocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: `POKEMON_${i}`
          }
        })
      )

      await wrapper.setProps({ pokemonsInTier: manyPokemon })
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards.length).toBe(50)
    })

    it('handles pokemon with special characters in names', async () => {
      const specialPokemon = [
        commonMocks.pokemonWithTiering({
          tier: 'S' as Tier,
          pokemonWithSettings: {
            ...commonMocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'POKEMON-WITH-DASHES_AND_UNDERSCORES'
          }
        })
      ]

      await wrapper.setProps({ pokemonsInTier: specialPokemon })
      const pokemonCard = wrapper.findAllComponents(PokemonCard)[0]
      expect(pokemonCard.props('pokemon')).toEqual(specialPokemon[0])
    })
  })

  describe('Integration Tests', () => {
    it('works correctly with all props and complex data', async () => {
      const complexPokemon = [
        commonMocks.pokemonWithTiering({
          tier: 'A' as Tier,
          diff: 5,
          pokemonWithSettings: {
            ...commonMocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'COMPLEX_POKEMON_1'
          }
        }),
        commonMocks.pokemonWithTiering({
          tier: 'A' as Tier,
          diff: -3,
          pokemonWithSettings: {
            ...commonMocks.pokemonWithTiering().pokemonWithSettings,
            pokemon: 'COMPLEX_POKEMON_2'
          }
        })
      ]

      await wrapper.setProps({
        tier: 'A' as Tier,
        pokemonsInTier: complexPokemon
      })

      // Check tier display
      expect(wrapper.find('.text-h4').text()).toBe('A')

      // Check pokemon cards
      const pokemonCards = wrapper.findAllComponents(PokemonCard)
      expect(pokemonCards.length).toBe(2)
      expect(pokemonCards[0].props('pokemon')).toEqual(complexPokemon[0])
      expect(pokemonCards[1].props('pokemon')).toEqual(complexPokemon[1])

      // Check tier color
      expect(getTierColor).toHaveBeenCalledWith('A')

      // Check click events still work
      await pokemonCards[0].trigger('click')
      expect(wrapper.emitted('click:pokemon')).toBeTruthy()
      expect(wrapper.emitted('click:pokemon')![0]).toEqual([complexPokemon[0]])
    })

    it('maintains reactivity when props change multiple times', async () => {
      // Initial state
      expect(wrapper.find('.text-h4').text()).toBe('S')
      expect(wrapper.findAllComponents(PokemonCard).length).toBe(2)

      // Change tier only
      await wrapper.setProps({ tier: 'B' as Tier })
      expect(wrapper.find('.text-h4').text()).toBe('B')
      expect(wrapper.findAllComponents(PokemonCard).length).toBe(2)

      // Change pokemon only
      const newPokemon = [mockPokemonData[0]]
      await wrapper.setProps({ pokemonsInTier: newPokemon })
      expect(wrapper.find('.text-h4').text()).toBe('B')
      expect(wrapper.findAllComponents(PokemonCard).length).toBe(1)

      // Change both
      await wrapper.setProps({
        tier: 'F' as Tier,
        pokemonsInTier: []
      })
      expect(wrapper.find('.text-h4').text()).toBe('F')
      expect(wrapper.findAllComponents(PokemonCard).length).toBe(0)
    })
  })
})
