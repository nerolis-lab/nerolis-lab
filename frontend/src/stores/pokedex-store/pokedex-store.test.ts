import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { capitalize } from 'vue'

describe('Pokedex Store', () => {
  it('should have the expected default state', () => {
    const pokedexStore = usePokedexStore()

    const categories = ['ingredient', 'berry', 'skill', 'all']
    const completePokedex = [...COMPLETE_POKEDEX].sort((a, b) => a.displayName.localeCompare(b.displayName))

    const categorizedPokedex: { [key: string]: string[] } = {
      ingredient: [],
      berry: [],
      skill: [],
      all: []
    }

    for (const pkmn of completePokedex) {
      if (categorizedPokedex[pkmn.specialty]) {
        categorizedPokedex[pkmn.specialty].push(capitalize(pkmn.displayName))
      }
    }

    const expectedGroupedPokedex = categories.map((category) => ({
      category,
      list: categorizedPokedex[category]
    }))

    expect(pokedexStore.$state.groupedPokedex).toEqual(expectedGroupedPokedex)
  })

  it('should sort Pokémon names alphabetically within each category', () => {
    const pokedexStore = usePokedexStore()

    for (const group of pokedexStore.groupedPokedex) {
      const sortedList = [...group.list].sort((a, b) => a.localeCompare(b))
      expect(group.list).toEqual(sortedList)
    }
  })
})
