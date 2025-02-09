<template>
  <v-btn
    v-if="pokemonInstance.gender !== undefined"
    icon
    color="surface"
    elevation="0"
    style="right: 4px; position: absolute; bottom: 0"
    size="40"
    @click="toggleGender"
  >
    <v-icon v-if="pokemonInstance.gender === 'male'" color="blue" size="24">mdi-gender-male</v-icon>
    <v-icon v-else color="primary" size="24">mdi-gender-female</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'GenderButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-gender'],
  computed: {
    pokemon() {
      return this.pokemonInstance.pokemon
    }
  },
  methods: {
    toggleGender() {
      const newGender = this.pokemonInstance.gender === 'male' ? 'female' : 'male'
      this.$emit('update-gender', newGender)
    }
  }
}
</script>
