import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePokemonSearchStore = defineStore(
  'pokemonSearch',
  () => {
    const showPokebox = ref(false)
    const showPokeboxBadge = ref(true)

    // Separate sort settings for pokedex and pokebox
    const pokedexSort = ref('pokedex')
    const pokedexSortAscending = ref(true)
    const pokeboxSort = ref('rp')
    const pokeboxSortAscending = ref(false)

    const togglePokebox = () => {
      showPokebox.value = !showPokebox.value
    }

    const hidePokeboxBadge = () => {
      showPokeboxBadge.value = false
    }

    const setPokedexSort = (sortValue: string, ascending: boolean) => {
      pokedexSort.value = sortValue
      pokedexSortAscending.value = ascending
    }

    const setPokeboxSort = (sortValue: string, ascending: boolean) => {
      pokeboxSort.value = sortValue
      pokeboxSortAscending.value = ascending
    }

    return {
      showPokebox,
      showPokeboxBadge,
      pokedexSort,
      pokedexSortAscending,
      pokeboxSort,
      pokeboxSortAscending,
      togglePokebox,
      hidePokeboxBadge,
      setPokedexSort,
      setPokeboxSort
    }
  },
  {
    persist: true
  }
)
