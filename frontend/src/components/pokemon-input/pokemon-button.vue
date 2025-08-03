<template>
  <v-btn icon size="120" color="transparent" elevation="0" class="flex-center" @click="openMenu">
    <v-badge :model-value="pokemonInstance !== undefined" icon="mdi-pencil" color="primary" offset-x="30" offset-y="40">
      <v-img
        v-if="pokemonInstance"
        :src="
          pokemonImage({
            pokemonName: pokemonInstance.pokemon.name,
            shiny: pokemonInstance.shiny
          })
        "
        height="150px"
        width="150px"
        cover
      />
      <div v-else class="plus-icon-container">
        <v-icon size="96" color="primary">mdi-circle</v-icon>
        <v-icon size="48" color="white" class="plus-overlay">mdi-plus</v-icon>
      </div>
    </v-badge>
  </v-btn>
</template>

<script setup lang="ts">
import { pokemonImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { PokemonInstanceExt } from 'sleepapi-common'

const props = defineProps<{
  pokemonInstance?: PokemonInstanceExt
}>()

const emit = defineEmits<{
  'update-pokemon': [pokemon: PokemonInstanceExt]
}>()

const dialogStore = useDialogStore()

const openMenu = () => {
  dialogStore.openPokemonSearch((pokemon: PokemonInstanceExt) => {
    emit('update-pokemon', pokemon)
  }, props.pokemonInstance)
}
</script>

<style lang="scss">
.v-btn > * {
  // Not sure why, but this makes the click area smaller
  pointer-events: none;
}

.plus-icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.plus-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
