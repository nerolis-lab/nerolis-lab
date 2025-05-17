<template>
  <v-card class="pokemon-glyph-card ma-1" @click="onCardClick" :style="cardStyle" elevation="2">
    <v-img :src="pokemonDisplayImageUrl" aspect-ratio="1" height="72" width="72" contain class="pokemon-image" eager>
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        </v-row>
      </template>

      <!-- Diff Overlay -->
      <div v-if="pokemon.diff !== undefined && pokemon.diff !== 0" class="diff-badge" :class="diffClass">
        <span>{{ pokemon.diff > 0 ? '▲' : '▼' }}</span>
        <span>{{ Math.abs(pokemon.diff) }}</span>
      </div>
      <div v-else-if="pokemon.diff === 0" class="diff-badge neutral-diff-badge">
        <span>-</span>
      </div>
      <div v-else-if="pokemon.diff === undefined" class="diff-badge new-addition-badge">
        <span>NEW</span>
      </div>

      <!-- Ingredient Overlay -->
      <div class="ingredient-overlay-container" v-if="bestIngredients.length > 0">
        <div class="ingredient-backdrop"></div>
        <v-avatar
          v-for="(ingredient, index) in bestIngredients"
          :key="index"
          size="18"
          class="ingredient-avatar-glyph"
          tile
        >
          <v-img
            :src="ingredientDisplayImageUrl(ingredient.name)"
            :alt="ingredient.name"
            class="ingredient-img-glyph"
            eager
          ></v-img>
          <v-tooltip activator="parent" location="top" open-delay="200">
            {{ ingredient.name }} x{{ ingredient.amount }}
          </v-tooltip>
        </v-avatar>
      </div>
    </v-img>
    <v-tooltip activator="parent" location="bottom" open-delay="300">
      <div class="font-weight-bold text-center">{{ pokemonName }}</div>
      <div>Score: {{ pokemon.score.toFixed(0) }}</div>
      <div v-if="pokemon.diff !== undefined">Change: {{ pokemon.diff > 0 ? '+' : '' }}{{ pokemon.diff }}</div>
    </v-tooltip>
  </v-card>
</template>

<script setup lang="ts">
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil
} from '@/services/utils/image-utils'
import type { PokemonWithTiering, Tier } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
}>()

const emit = defineEmits(['click:pokemon'])

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)
const pokemonDisplayImageUrl = computed(() =>
  getPokemonDisplayImageUrlUtil({
    pokemonName: pokemonName.value,
    shiny: false,
    happy: (props.pokemon.diff && props.pokemon.diff > 0) || props.pokemon.tier === 'S'
  })
)

const bestIngredients = computed(() => {
  return props.pokemon.pokemonWithSettings.ingredientList.slice(0, 3)
})

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrlUtil(name)
}

const onCardClick = () => {
  emit('click:pokemon', props.pokemon)
}

const tierColorMapping: Record<Tier, string> = {
  S: 'var(--v-theme-primary)',
  A: 'var(--v-theme-strength)',
  B: 'var(--v-theme-pretty-purple, #9771e0)',
  C: 'var(--v-theme-secondary)',
  D: 'var(--v-theme-secondary-dark)',
  E: 'var(--v-theme-surface-variant, #5b577c)',
  F: 'var(--v-theme-surface, #403d58)'
}

const tierColor = computed(() => tierColorMapping[props.pokemon.tier] || tierColorMapping.F)

const cardStyle = computed(() => ({
  border: `2px solid ${tierColor.value}`
  // boxShadow: `0 0 8px -3px ${tierColor.value}, inset 0 0 6px -4px ${tierColor.value}`
}))

const diffClass = computed(() => {
  if (props.pokemon.diff === undefined) return 'new-addition-badge'
  if (props.pokemon.diff === 0) return 'neutral-diff-badge'
  if (props.pokemon.diff > 0) return 'positive-diff-badge'
  return 'negative-diff-badge'
})
</script>

<style scoped lang="scss">
@use 'sass:color'; // TODO: why is this needed?

.pokemon-glyph-card {
  width: 76px; // Image (72px) + border (2*2px)
  height: 76px;
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  background-color: rgba(var(--v-theme-surface), 0.5);
  backdrop-filter: blur(4px) saturate(100%);
  -webkit-backdrop-filter: blur(4px) saturate(100%);
  border-radius: 6px !important;
  position: relative; // For positioning overlays

  &:hover {
    transform: scale(1.1);
    box-shadow:
      0 4px 15px rgba(0, 0, 0, 0.2),
      0 0 12px -2px v-bind(tierColor),
      inset 0 0 10px -5px v-bind(tierColor) !important;
    z-index: 10;
  }
}

.pokemon-image {
  border-radius: 4px; // Inner rounding for the image itself
  display: flex; // For aligning overlays
  align-items: flex-end; // Align ingredient overlay to bottom
  justify-content: center; // Center ingredient overlay if it's a single line
  overflow: hidden; // Clip content within the image area like overlays
}

.diff-badge {
  position: absolute;
  top: 2px; // Adjusted position to be more inside
  right: 2px; // Adjusted position to be more inside
  background-color: $background; // Placeholder, will be tier specific
  color: white;
  border-radius: 50%;
  width: 20px; // Slightly smaller badge
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem; // Smaller font for badge
  font-weight: bold;
  border: 1px solid white; // Thinner border
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
  z-index: 1;
  padding-bottom: 1px; // Optical centering for triangle
  span:first-child {
    margin-right: 1px; // Space between triangle and number
    line-height: 1;
  }
  span:last-child {
    line-height: 1;
  }
}

.positive-diff-badge {
  background-color: $nature-up;
  border-color: color.adjust($nature-up, $lightness: 15%);
}

.negative-diff-badge {
  background-color: $nature-down;
  border-color: color.adjust($nature-down, $lightness: 15%);
}

.neutral-diff-badge {
  background-color: $accent;
  border-color: color.adjust($accent, $lightness: 15%);
  font-size: 0.7rem;
}

.new-addition-badge {
  background-color: $primary;
  border-color: color.adjust($primary, $lightness: 15%);
  color: $on-primary;
  font-size: 0.6rem;
  padding: 0 3px;
}

.ingredient-overlay-container {
  position: absolute;
  bottom: 2px; // Small offset from the bottom
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  padding: 0 2px;
  z-index: 1;
}

.ingredient-backdrop {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px; // Covers the bottom part for ingredients
  background-color: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 0 0 3px 3px; // Match image rounding
}

.ingredient-avatar-glyph {
  background-color: transparent; // Let backdrop show through
  border-radius: 3px;
  // padding: 1px;
  z-index: 2; // Above backdrop
  img.ingredient-img-glyph {
    border-radius: 2px;
  }
}
</style>
