import { defineStore } from 'pinia'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  // ==================== POKEMON SEARCH DIALOG ====================
  const pokemonSearchDialog = ref(false)
  const pokemonSearchCallback = ref<((pokemonInstance: PokemonInstanceExt) => void) | null>(null)
  const pokemonSearchReturnFullInstance = ref(false)

  const openPokemonSearch = (callback: (pokemonInstance: PokemonInstanceExt) => void) => {
    pokemonSearchCallback.value = callback
    pokemonSearchReturnFullInstance.value = true
    pokemonSearchDialog.value = true
  }

  const closePokemonSearch = () => {
    pokemonSearchDialog.value = false
    pokemonSearchCallback.value = null
    pokemonSearchReturnFullInstance.value = false
  }

  const handlePokemonSelected = (pokemonInstance: PokemonInstanceExt) => {
    if (pokemonSearchCallback.value) {
      pokemonSearchCallback.value(pokemonInstance)
    }
    closePokemonSearch()
  }

  // ==================== POKEMON INPUT DIALOG ====================
  const pokemonInputDialog = ref(false)
  const pokemonInputCallback = ref<((pokemon: PokemonInstanceExt) => void) | null>(null)
  const pokemonInputProps = ref<{ preSelectedPokemonInstance: PokemonInstanceExt | null }>({
    preSelectedPokemonInstance: null
  })

  const openPokemonInput = (
    callback: (pokemon: PokemonInstanceExt) => void,
    preSelectedPokemonInstance: PokemonInstanceExt
  ) => {
    pokemonInputCallback.value = callback
    pokemonInputProps.value = { preSelectedPokemonInstance }
    pokemonInputDialog.value = true
  }

  const closePokemonInput = () => {
    pokemonInputDialog.value = false
    pokemonInputCallback.value = null
    pokemonInputProps.value = { preSelectedPokemonInstance: null }
  }

  const handlePokemonInputSaved = (pokemon: PokemonInstanceExt) => {
    // eslint-disable-next-line SleepAPILogger/no-console
    console.debug('handlePokemonInputSaved', pokemon)
    if (pokemonInputCallback.value) {
      pokemonInputCallback.value(pokemon)
    }
    closePokemonInput()
  }

  // ==================== SLOT ACTIONS DIALOG ====================
  const slotActionsDialog = ref(false)
  const slotActionsProps = ref<{
    pokemon: PokemonInstanceExt | null
    fullTeam: boolean
    onUpdate?: (pokemon: PokemonInstanceExt) => void
    onDuplicate?: () => void
    onToggleSaved?: (state: boolean) => void
    onRemove?: () => void
  }>({
    pokemon: null,
    fullTeam: false
  })

  const openSlotActions = (
    pokemon: PokemonInstanceExt,
    fullTeam: boolean,
    callbacks: {
      onUpdate?: (pokemonInstance: PokemonInstanceExt) => void
      onDuplicate?: () => void
      onToggleSaved?: (state: boolean) => void
      onRemove?: () => void
    }
  ) => {
    slotActionsProps.value = {
      pokemon,
      fullTeam,
      onUpdate: callbacks.onUpdate,
      onDuplicate: callbacks.onDuplicate,
      onToggleSaved: callbacks.onToggleSaved,
      onRemove: callbacks.onRemove
        ? () => {
            callbacks.onRemove?.()
            closeSlotActions()
          }
        : undefined
    }
    slotActionsDialog.value = true
  }

  const closeSlotActions = () => {
    slotActionsDialog.value = false
    slotActionsProps.value = {
      pokemon: null,
      fullTeam: false
    }
  }

  // ==================== PUBLIC API ====================
  return {
    // Pokemon Search
    pokemonSearchDialog,
    pokemonSearchReturnFullInstance,
    openPokemonSearch,
    closePokemonSearch,
    handlePokemonSelected,

    // Pokemon Input
    pokemonInputDialog,
    pokemonInputProps,
    openPokemonInput,
    closePokemonInput,
    handlePokemonInputSaved,

    // Slot Actions
    slotActionsDialog,
    slotActionsProps,
    openSlotActions,
    closeSlotActions
  }
})
