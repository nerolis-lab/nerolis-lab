<template>
  <div
    class="tier-row-wrapper mb-md-4 mb-3"
    :class="`tier-row-wrapper-${tier.toLowerCase()}`"
    :style="tierRowBackgroundStyle"
  >
    <v-card class="tier-label-card elevation-6" :style="tierLabelCardStyle">
      <span class="tier-letter">{{ tier }}</span>
    </v-card>
    <div class="pokemon-grid-container">
      <div class="pokemon-grid-content">
        <PokemonCard
          v-for="pokemonInTier in pokemonsInTier"
          :key="pokemonInTier.pokemonWithSettings.settings.externalId || pokemonInTier.pokemonWithSettings.pokemon"
          :pokemon="pokemonInTier"
          @click:pokemon="$emit('click:pokemon', $event)"
        />
        <div v-if="pokemonsInTier.length === 0" class="empty-tier-message text-disabled pa-4">
          <v-icon size="x-large" class="mb-1">mdi-sleep</v-icon>
          <div>No Pokémon currently in this tier.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PokemonWithTiering, Tier } from 'sleepapi-common'
import { computed } from 'vue'
import PokemonCard from './PokemonCard.vue'

const props = defineProps<{
  tier: Tier
  pokemonsInTier: PokemonWithTiering[]
}>()

const emit = defineEmits(['click:pokemon'])

const tierColors: Record<Tier, string> = {
  S: 'var(--v-theme-primary)',
  A: 'var(--v-theme-strength)',
  B: 'var(--v-theme-pretty-purple, #9771e0)',
  C: 'var(--v-theme-secondary)',
  D: 'var(--v-theme-secondary-dark)',
  E: 'var(--v-theme-surface-variant, #5b577c)',
  F: 'var(--v-theme-surface, #403d58)'
}

const tierTextColors: Record<Tier, string> = {
  S: 'var(--v-theme-on-primary)',
  A: '#000000',
  B: 'var(--v-theme-on-primary)',
  C: 'var(--v-theme-on-secondary)',
  D: 'var(--v-theme-on-secondary)',
  E: 'var(--v-theme-on-surface)',
  F: 'var(--v-theme-on-surface)'
}

const tierLabelCardStyle = computed(() => ({
  backgroundColor: `${tierColors[props.tier]} !important`,
  color: `${tierTextColors[props.tier]} !important`,
  boxShadow: `inset 0 0 12px -2px rgba(0,0,0,0.5), 0 0 18px -4px ${tierColors[props.tier]}`,
  borderRight: `3px solid rgba(0,0,0,0.3)`
}))

// New computed property for the row background
const tierRowBackgroundStyle = computed(() => {
  // Using a helper to generate a desaturated/darker version of the tier color for the row background
  // This is a conceptual helper. Actual implementation might vary based on Vuetify/Sass capabilities.
  // For now, let's use a very transparent version of the tier color.
  const tierBaseColor = tierColors[props.tier]
  let rgbaColor = 'rgba(var(--v-theme-surface), 0.35)' // Default fallback
  if (tierBaseColor && tierBaseColor.startsWith('var(--v-theme-')) {
    // This is tricky without knowing the exact hex. Assume a default semi-transparent for now.
    // A better way would be to have SCSS variables for these desaturated versions.
    // Or, if Vuetify theme colors are hex, parse and manipulate.
    // For simplicity, we'll keep the default row background and let border/label provide tier color.
    // To implement truly dynamic desaturated backgrounds from CSS vars is complex here.
  } else if (tierBaseColor) {
    // If it's a direct hex, we could parse it (e.g., #RRGGBB)
    // Example: make it 20% opaque
    const hex = tierBaseColor.replace('#', '')
    if (hex.length === 6 || hex.length === 3) {
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      rgbaColor = `rgba(${r}, ${g}, ${b}, 0.1)` // Very subtle
    }
  }
  return {
    // backgroundColor: rgbaColor // Enable this if you want subtle tier-colored row backgrounds
  }
})
</script>

<style scoped lang="scss">
.tier-row-wrapper {
  display: flex;
  align-items: stretch;
  background-color: rgba(var(--v-theme-surface), 0.35);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-surface), 0.5);
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(var(--v-theme-surface), 0.1);
}

.tier-label-card {
  min-width: 60px;
  max-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0 !important;
  padding: 4px 0;
  position: relative;
  z-index: 1;
  &::v-deep(.v-card-item) {
    padding: 0;
  }
  &::v-deep(.v-card-title) {
    display: none;
  }
}

.tier-letter {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
}

.pokemon-grid-container {
  flex-grow: 1;
  padding: 6px;
}

.pokemon-grid-content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px;
  justify-content: flex-start;
}

.empty-tier-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70px;
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.8rem;
  .v-icon {
    font-size: 2rem;
  }
}

// Desktop adjustments for TierRow
@media (min-width: 960px) {
  .tier-row-wrapper {
    border-radius: 12px;
  }
  .tier-label-card {
    min-width: 100px;
    max-width: 100px;
    padding: 8px 0;
  }
  .tier-letter {
    font-size: 3rem;
  }
  .pokemon-grid-container {
    padding: 8px;
  }
  .pokemon-grid-content {
    gap: 6px;
  }
  .empty-tier-message {
    min-height: 80px;
    font-size: 0.9rem;
    .v-icon {
      font-size: 2.5rem;
    }
  }
}
</style>
