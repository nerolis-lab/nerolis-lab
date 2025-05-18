<template>
  <div class="pa-2">
    <!-- Variant Selector -->
    <div v-if="pokemonVariants.length > 1" class="mb-3">
      <span class="text-caption font-weight-medium text-medium-emphasis mb-2 d-block">Select variant:</span>
      <v-chip-group v-model="selectedVariantIndex" mandatory class="ga-1 variant-selector">
        <v-chip
          v-for="(variant, index) in pokemonVariants"
          :key="index"
          :value="index"
          size="small"
          :variant="selectedVariantIndex === index ? 'elevated' : 'outlined'"
          :color="selectedVariantIndex === index ? 'primary' : 'surface-variant'"
          class="variant-selector-chip"
        >
          <div class="d-flex align-center flex-wrap">
            <div class="d-flex align-center ingredient-container">
              <v-avatar
                v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
                :key="i"
                size="16"
                class="mr-1 ingredient-mini"
                tile
              >
                <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
              </v-avatar>
            </div>
            <span class="ml-1 text-caption variant-info">{{ variant.tier }} ({{ variant.score.toFixed(0) }})</span>
          </div>
        </v-chip>
      </v-chip-group>
    </div>

    <p v-if="!topContributions || topContributions.length === 0" class="text-center text-medium-emphasis pa-4">
      No recipe contributions data for this variant.
    </p>
    <v-list density="compact" bg-color="transparent" lines="two">
      <v-list-item
        v-for="(contrib, index) in topContributions"
        :key="index"
        class="mb-2 contrib-item modal-list-item"
        rounded="lg"
      >
        <template v-slot:prepend>
          <v-avatar rounded="lg" size="48" class="mr-4 elevation-1 recipe-avatar-modal">
            <v-img :src="recipeDisplayImageUrl(contrib.recipe)" :alt="contrib.recipe" eager></v-img>
          </v-avatar>
        </template>
        <v-list-item-title class="font-weight-bold text-subtitle-1 recipe-title">{{
          contrib.recipe
        }}</v-list-item-title>
        <v-list-item-subtitle class="text-medium-emphasis contribution-info">
          <div class="d-flex flex-column flex-sm-row align-start">
            <div class="contribution-score">
              Contribution:
              <span class="font-weight-medium" :style="{ color: tierColorMapping.A }">{{
                contrib.score.toFixed(0)
              }}</span>
              <span v-if="contrib.coverage !== undefined"> (Coverage: {{ contrib.coverage?.toFixed(1) }}%)</span>
              <span
                v-if="contrib.skillValue !== undefined && contrib.skillValue > 0"
                class="ml-1 text-caption skill-value"
                >(Skill: {{ contrib.skillValue.toFixed(0) }})</span
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
  </div>
</template>

<script setup lang="ts">
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import type { PokemonWithTiering, RecipeContributionSimple, Tier } from 'sleepapi-common'
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

const topContributions = computed<RecipeContributionSimple[]>(() => {
  return selectedVariant.value.contributions?.slice(0, 3) || []
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
.contrib-item {
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease-out,
    box-shadow 0.2s ease;
  &:hover {
    background-color: rgba(var(--v-theme-surface-variant), 0.6);
    border-color: rgba(var(--v-theme-primary), 0.5);
    transform: translateY(-2px) scale(1.005);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 599px) {
    padding: 12px !important;
    margin-bottom: 12px !important;

    .recipe-avatar-modal {
      width: 40px !important;
      height: 40px !important;
      margin-right: 12px !important;
    }
  }
}

.recipe-avatar-modal {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

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

.variant-selector {
  @media (max-width: 599px) {
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

.variant-selector-chip {
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  flex-shrink: 0;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 599px) {
    min-width: auto;

    .ingredient-container {
      margin-right: 4px;
    }

    .variant-info {
      font-size: 0.7rem !important;
      white-space: nowrap;
    }
  }
}

.ingredient-mini {
  background-color: rgba(var(--v-theme-surface), 0.8);
  border-radius: 3px;
  padding: 1px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);

  @media (max-width: 599px) {
    width: 14px !important;
    height: 14px !important;
  }
}

// Mobile-specific improvements
@media (max-width: 599px) {
  .pa-2 {
    padding: 8px !important;
  }

  .mb-3 {
    margin-bottom: 12px !important;
  }

  .mb-2 {
    margin-bottom: 8px !important;
  }

  .mt-1 {
    margin-top: 6px !important;
  }
}
</style>
