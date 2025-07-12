import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePokemonSearchStore = defineStore(
  'pokemonSearch',
  () => {
    const showPokebox = ref(false)
    const showPokeboxBadge = ref(true)

    const togglePokebox = () => {
      showPokebox.value = !showPokebox.value
    }

    const hidePokeboxBadge = () => {
      showPokeboxBadge.value = false
    }

    return {
      showPokebox,
      showPokeboxBadge,
      togglePokebox,
      hidePokeboxBadge
    }
  },
  {
    persist: true
  }
)
