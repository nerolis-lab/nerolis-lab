import type { GroupData } from '@/components/custom-components/group-list.vue'
import { defineStore } from 'pinia'
import { COMPLETE_POKEDEX } from 'sleepapi-common'
import { capitalize } from 'vue'

export interface PokedexState {
  groupedPokedex: GroupData[]
}

export const usePokedexStore = defineStore('pokedex', {
  state: (): PokedexState => {
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

    return {
      groupedPokedex: categories.map((category) => ({
        category,
        list: categorizedPokedex[category]
      }))
    }
  }
})
