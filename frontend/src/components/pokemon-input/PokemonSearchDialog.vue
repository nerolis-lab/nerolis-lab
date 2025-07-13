<template>
  <v-dialog v-model="dialogStore.pokemonSearchDialog" max-width="600px">
    <PokemonSearch :standalone="false" @cancel="dialogStore.closePokemonSearch" @save="handlePokemonSave" />
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { PokemonInstanceExt } from 'sleepapi-common'
import PokemonSearch from './PokemonSearch.vue'

const dialogStore = useDialogStore()

const handlePokemonSave = (instance: PokemonInstanceExt) => {
  dialogStore.handlePokemonSelected(instance)
}
</script>
