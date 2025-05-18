<template>
  <div v-if="pokemonVariants.length > 1" class="">
    <v-card variant="plain">
      <v-card-title>Variants</v-card-title>
      <v-card-text class="pt-0">
        <v-chip-group v-model="selectedVariantIndex" mandatory class="ga-1">
          <v-chip
            v-for="(variant, index) in pokemonVariants"
            :key="index"
            :value="index"
            :variant="selectedVariantIndex === index ? 'elevated' : 'outlined'"
            :color="`tier-${variant.tier.toLowerCase()}`"
          >
            <div class="d-flex align-center flex-wrap">
              <div class="d-flex align-center ingredient-container">
                <v-avatar
                  v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
                  :key="i"
                  size="22"
                  class="mr-1"
                  tile
                >
                  <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
                </v-avatar>
              </div>
              <span
                :class="[
                  'ml-1',
                  selectedVariantIndex !== index ? `text-tier-${variant.tier.toLowerCase()}` : '',
                  'font-weight-bold'
                ]"
                >{{ variant.tier }}</span
              >
              <span class="ml-1">({{ localizeNumber(variant.score) }})</span>
            </div>
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
  </div>

  <v-list density="compact" bg-color="transparent" lines="two">
    <v-list-item
      v-for="(contrib, index) in topContributions"
      :key="index"
      class="mb-2"
      :base-color="contrib.recipe.type"
      rounded="lg"
      :style="{ backgroundColor: `${withOpacity(contrib.recipe.type, 0.1)}` }"
    >
      <template #prepend>
        <v-avatar rounded="lg" size="48">
          <v-img :src="recipeDisplayImageUrl(contrib.recipe.name)" :alt="contrib.recipe.name" eager></v-img>
        </v-avatar>
      </template>
      <v-list-item-title class="font-weight-bold text-subtitle-1 recipe-title">{{
        contrib.recipe.displayName
      }}</v-list-item-title>
      <v-list-item-subtitle class="text-medium-emphasis contribution-info">
        <div class="d-flex flex-column flex-sm-row align-start">
          <div class="contribution-score">
            Contribution:
            <span class="font-weight-medium" :style="{ color: tierColorMapping.A }">{{
              localizeNumber(contrib.score)
            }}</span>
            <span v-if="contrib.coverage !== undefined" class="skill-value">
              Coverage: {{ contrib.coverage.toFixed(1) }}%</span
            >
            <span
              v-if="contrib.skillValue !== undefined && contrib.skillValue > 0"
              class="ml-1 text-caption skill-value"
              >Support value: {{ localizeNumber(contrib.skillValue) }}</span
            >
          </div>
        </div>
      </v-list-item-subtitle>
      <div v-if="contrib.team && contrib.team.length > 0" class="mt-1 text-caption team-section">
        <div class="team-label-container mb-1">
          <span class="font-weight-medium text-medium-emphasis">Team:</span>
        </div>
        <div class="team-chips">
          <v-chip
            v-for="(member, tIndex) in contrib.team"
            :key="tIndex"
            density="compact"
            class="team-chip"
            label
            size="small"
            variant="tonal"
          >
            <v-avatar start size="18"
              ><v-img :src="pokemonDisplayImageUrlByName(member.pokemon)" :alt="member.pokemon" eager></v-img
            ></v-avatar>
            <span class="team-member-name">{{ member.pokemon }}</span>
          </v-chip>
        </div>
      </div>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { withOpacity } from '@/services/utils/color-utils'
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import { getRecipe, localizeNumber, type PokemonWithTiering, type Tier } from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
  selectedVariantIndex?: number
}>()

const selectedVariantIndex = ref(0)

// Sync with prop when it changes
watch(
  () => props.selectedVariantIndex,
  (newIndex) => {
    if (newIndex !== undefined) {
      selectedVariantIndex.value = newIndex
    }
  },
  { immediate: true }
)

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)

const pokemonVariants = computed(() => {
  return props.allPokemonVariantsData
    .filter((p) => p.pokemonWithSettings.pokemon === pokemonName.value)
    .sort((a, b) => b.score - a.score)
})

const selectedVariant = computed(() => {
  return pokemonVariants.value[selectedVariantIndex.value] || props.pokemon
})

const topContributions = computed(() => {
  return selectedVariant.value.contributions.map((c) => ({
    ...c,
    recipe: getRecipe(c.recipe)
  }))
})

const recipeDisplayImageUrl = (name: string) => {
  return getRecipeImageUrlUtil(name)
}

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrlUtil(name)
}

const pokemonDisplayImageUrlByName = (name: string) => {
  return getPokemonDisplayImageUrlUtil({ pokemonName: name, shiny: false, happy: false })
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
</script>

<style scoped lang="scss">
.recipe-title {
  @media (max-width: 599px) {
    font-size: 0.9rem !important;
    line-height: 1.3;
  }
}

.contribution-info {
  @media (max-width: 599px) {
    font-size: 0.8rem;
  }
}

.contribution-score {
  @media (max-width: 599px) {
    margin-bottom: 4px;
  }
}

.skill-value {
  margin-left: 10px !important;
  @media (max-width: 599px) {
    display: block;
    margin-top: 2px;
    margin-left: 0 !important;
  }
}

.team-section {
  @media (max-width: 599px) {
    margin-top: 8px !important;
  }
}

.team-label-container {
  @media (max-width: 599px) {
    margin-bottom: 6px !important;
  }
}

.team-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  @media (max-width: 599px) {
    gap: 3px;
  }
}

.team-chip {
  background-color: rgba(var(--v-theme-surface), 0.95) !important;
  color: $on-surface;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.25);
  font-size: 0.75rem;
  padding: 0 8px !important;
  margin: 0 !important;

  @media (max-width: 599px) {
    font-size: 0.7rem;
    padding: 0 6px !important;

    .v-avatar {
      width: 16px !important;
      height: 16px !important;
      margin-right: 2px !important;
    }
  }

  .v-avatar {
    filter: brightness(0.9);
    margin-right: 4px;
  }

  .team-member-name {
    @media (max-width: 599px) {
      font-size: 0.7rem;
    }
  }
}
</style>
