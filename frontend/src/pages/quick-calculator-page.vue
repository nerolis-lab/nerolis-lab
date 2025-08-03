<template>
  <div class="pokemon-calculator">
    <!-- Transition between PokemonSearch and PokemonInput -->
    <Transition
      name="pokemon-collapse"
      mode="out-in"
      @enter="onInputEnter"
      @leave="onSearchLeave"
    >
      <!-- Initial PokemonSearch state -->
      <div v-if="!selectedPokemon" key="search" class="search-container">
        <PokemonSearch
          :prevent-dialog="true"
          @save="handlePokemonSelected"
          @cancel="handleSearchCancel"
        />
      </div>
      
      <!-- PokemonInput after selection -->
      <div v-else key="input" class="input-container">
        <PokemonInput
          :pre-selected-pokemon-instance="selectedPokemon"
          @save="handlePokemonSaved"
          @cancel="handlePokemonCancel"
        />
        
        <!-- Floating action button to change pokemon -->
        <v-btn
          class="change-pokemon-fab"
          color="primary"
          icon
          size="large"
          elevation="4"
          @click="handleChangePokemon"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import PokemonInput from '@/components/pokemon-input/PokemonInput.vue'
import PokemonSearch from '@/components/pokemon-input/PokemonSearch.vue'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { ref } from 'vue'

const selectedPokemon = ref<PokemonInstanceExt | null>(null)

const handlePokemonSelected = (pokemon: PokemonInstanceExt) => {
  selectedPokemon.value = pokemon
}

const handleSearchCancel = () => {
  // If no pokemon selected, could navigate away or do nothing
  console.log('Search cancelled')
}

const handleChangePokemon = () => {
  selectedPokemon.value = null
}

const handlePokemonSaved = (pokemon: PokemonInstanceExt) => {
  // Handle final save - could navigate away or show results
  console.log('Pokemon saved:', pokemon)
}

const handlePokemonCancel = () => {
  selectedPokemon.value = null
}

const onInputEnter = (el: Element) => {
  // Animate PokemonInput entering from collapsed state
  const htmlEl = el as HTMLElement
  htmlEl.style.transform = 'scale(0.3)'
  htmlEl.style.opacity = '0'
  
  requestAnimationFrame(() => {
    htmlEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    htmlEl.style.transform = 'scale(1)'
    htmlEl.style.opacity = '1'
  })
}

const onSearchLeave = (el: Element) => {
  // Animate PokemonSearch collapsing toward where PokemonButton will be
  const htmlEl = el as HTMLElement
  const searchCard = htmlEl.querySelector('.v-card') as HTMLElement
  
  if (searchCard) {
    // Get the center of the current search container
    const rect = searchCard.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Approximate where the Pokemon button will be (center of viewport, slightly above center)
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight * 0.4 // Slightly above center
    
    const deltaX = viewportCenterX - centerX
    const deltaY = viewportCenterY - centerY
    
    htmlEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    htmlEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`
    htmlEl.style.opacity = '0'
  }
}
</script>

<style scoped lang="scss">
.pokemon-calculator {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  position: relative;
}

.search-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.change-pokemon-fab {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

// Transition animations
.pokemon-collapse-enter-active,
.pokemon-collapse-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.pokemon-collapse-enter-from {
  transform: scale(0.3);
  opacity: 0;
}

.pokemon-collapse-leave-to {
  transform: scale(0.2);
  opacity: 0;
}
</style>
