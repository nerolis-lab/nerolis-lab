<template>
  <v-dialog v-model="pokemonMenu" max-width="550px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon size="120" color="transparent" v-bind="props" elevation="0" class="flex-center" @click="openMenu">
        <v-badge icon="mdi-pencil" color="primary" offset-x="30" offset-y="40">
          <v-img
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
        </v-badge>
      </v-btn>
    </template>

    <PokemonSearch @cancel="closeMenu" @save="selectPokemon" />
  </v-dialog>
</template>

<script lang="ts">
import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import { pokemonImage } from '@/services/utils/image-utils'
import type { PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'PokemonButton',
  components: {
    PokemonSearch
  },
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-pokemon'],
  setup() {
    return { pokemonImage }
  },
  data: () => ({
    pokemonMenu: false
  }),
  methods: {
    openMenu() {
      this.pokemonMenu = true
    },
    closeMenu() {
      this.pokemonMenu = false
    },
    selectPokemon(pokemon: PokemonInstanceExt) {
      this.pokemonMenu = false
      this.$emit('update-pokemon', pokemon)
    }
  }
}
</script>

<style lang="scss">
.v-btn > * {
  // Not sure why, but this makes the click area smaller
  pointer-events: none;
}
</style>
