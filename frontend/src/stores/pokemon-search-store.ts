import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePokemonSearchStore = defineStore(
  'pokemonSearch',
  () => {
    const showPokebox = ref(false)
    const showPokeboxBadge = ref(true)

    // Persisted user preference for final stage only
    const userFinalStageOnly = ref(true)
    // Temporary state that can be auto-unchecked when typing (not persisted)
    const finalStageOnly = ref(true)

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

    const setFinalStageOnly = (value: boolean) => {
      finalStageOnly.value = value
    }

    const setUserFinalStageOnly = (value: boolean) => {
      userFinalStageOnly.value = value
      finalStageOnly.value = value
    }

    const restoreFinalStageOnly = () => {
      finalStageOnly.value = userFinalStageOnly.value
    }

    return {
      showPokebox,
      showPokeboxBadge,
      userFinalStageOnly,
      finalStageOnly,
      pokedexSort,
      pokedexSortAscending,
      pokeboxSort,
      pokeboxSortAscending,
      togglePokebox,
      hidePokeboxBadge,
      setPokedexSort,
      setPokeboxSort,
      setFinalStageOnly,
      setUserFinalStageOnly,
      restoreFinalStageOnly
    }
  },
  {
    persist: {
      pick: [
        'showPokebox',
        'showPokeboxBadge',
        'userFinalStageOnly',
        'pokedexSort',
        'pokedexSortAscending',
        'pokeboxSort',
        'pokeboxSortAscending'
      ]
    }
  }
)
