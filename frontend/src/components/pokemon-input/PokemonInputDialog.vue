<template>
  <v-dialog v-model="dialogStore.pokemonInputDialog" max-width="600px">
    <PokemonInput
      v-if="dialogStore.pokemonInputProps.preSelectedPokemonInstance"
      :pre-selected-pokemon-instance="dialogStore.pokemonInputProps.preSelectedPokemonInstance"
      @cancel="dialogStore.closePokemonInput"
      @save="dialogStore.savePokemonInput"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import PokemonInput from './pokemon-input.vue'

const dialogStore = useDialogStore()
</script>
