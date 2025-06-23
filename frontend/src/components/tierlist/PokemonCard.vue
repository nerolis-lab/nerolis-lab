<template>
  <v-card
    :width="isTinyMobile ? 55 : 78"
    :height="isTinyMobile ? 55 : 78"
    class="flex-center pokemon-glyph-card flex-column"
    @click="emit('click:pokemon', pokemon)"
  >
    <div class="corner-bookmark" :style="{ backgroundColor: diffInfo.color }" v-if="pokemon.diff !== 0">
      <span v-if="pokemon.diff" class="bookmark-text">{{ diffInfo.text }}</span>
      <v-icon v-else size="20" class="bookmark-text text-yellow">mdi-star-plus</v-icon>
    </div>

    <v-img :width="isTinyMobile ? 40 : 60" :src="pokemonDisplayImageUrl" eager />

    <v-card height="20" width="10000" class="flex-center">
      <v-avatar v-for="ingredient in bestIngredients" :key="ingredient.name" :size="isTinyMobile ? 16 : 24">
        <v-img :src="ingredientDisplayImageUrl(ingredient.name)" eager />
      </v-avatar>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { avatarImage, ingredientImage } from '@/services/utils/image-utils'
import { getDiffDisplayInfo, type DiffDisplayInfo } from '@/services/utils/ui-utils'
import type { PokemonWithTiering } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
}>()

const emit = defineEmits(['click:pokemon'])

const { isTinyMobile } = useBreakpoint()

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)
const pokemonDisplayImageUrl = computed(() =>
  avatarImage({
    pokemonName: pokemonName.value,
    shiny: false,
    happy: (props.pokemon.diff && props.pokemon.diff > 0) || props.pokemon.tier === 'S' || !props.pokemon.diff
  })
)

const bestIngredients = computed(() => {
  return props.pokemon.pokemonWithSettings.ingredientList.slice(0, 3)
})
const ingredientDisplayImageUrl = (name: string) => {
  return ingredientImage(name)
}

const diffInfo = computed<DiffDisplayInfo>(() => {
  return getDiffDisplayInfo(props.pokemon.diff)
})
</script>

<style scoped lang="scss">
.pokemon-glyph-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  background-color: rgba(var(--v-theme-surface), 0.5);
  backdrop-filter: blur(4px) saturate(100%);
  -webkit-backdrop-filter: blur(4px) saturate(100%);
  border-radius: 6px !important;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
}

.corner-bookmark {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 36px;
  height: 36px;
  transform: rotate(45deg);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));

  .bookmark-text {
    color: white;
    font-size: 10px;
    font-weight: bold;
    line-height: 1;
    transform: rotate(-45deg) translate(-8px, 8px);
    pointer-events: none;
  }
}
</style>
