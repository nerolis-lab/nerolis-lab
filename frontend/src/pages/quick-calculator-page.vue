<template>
  <div class="pokemon-calculator">
    <div class="content-container">
      <!-- PokemonSearch at the top -->
      <v-expand-transition>
        <div v-if="showSearch" class="search-container">
          <PokemonSearch :prevent-dialog="true" @save="handlePokemonSelected" @cancel="handleSearchCancel" />
        </div>
      </v-expand-transition>

      <!-- PokemonInput below with PokemonButton -->
      <div class="input-container">
        <div v-if="!selectedPokemon" class="flex-center">
          <v-btn icon size="120" color="transparent" elevation="0" class="flex-center" @click="toggleSearch">
            <div class="plus-icon-container">
              <v-icon size="96" color="primary">mdi-circle</v-icon>
              <v-icon size="48" color="white" class="plus-overlay">mdi-plus</v-icon>
            </div>
          </v-btn>
        </div>

        <PokemonInput
          v-if="selectedPokemon"
          :pre-selected-pokemon-instance="selectedPokemon"
          :quick-mode="true"
          @save="handlePokemonSaved"
          @cancel="handlePokemonCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PokemonInput from '@/components/pokemon-input/PokemonInput.vue'
import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { nextTick, ref, watch } from 'vue'

const selectedPokemon = ref<PokemonInstanceExt | null>(null)
const showSearch = ref(true) // Start with search visible

// Override the PokemonButton click behavior when pokemon is selected
watch(selectedPokemon, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const pokemonButton = document.querySelector('.input-container .v-btn[size="120"]')
      if (pokemonButton) {
        pokemonButton.addEventListener('click', (e) => {
          e.stopPropagation()
          toggleSearch()
        })
      }
    })
  }
})

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

const handlePokemonSelected = (pokemon: PokemonInstanceExt) => {
  selectedPokemon.value = pokemon
  showSearch.value = false
}

const handleSearchCancel = () => {
  if (selectedPokemon.value) {
    showSearch.value = false
  }
}

const handlePokemonSaved = (pokemon: PokemonInstanceExt) => {
  console.log('Pokemon saved:', pokemon)
}

const handlePokemonCancel = () => {
  selectedPokemon.value = null
  showSearch.value = true
}
</script>

<style scoped lang="scss">
.pokemon-calculator {
  width: 100%;
  min-height: 100vh;
}

.search-container {
  width: 100%;
}

.plus-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
