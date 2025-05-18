<template>
  <v-list density="compact" bg-color="transparent" lines="three">
    <v-list-item
      v-for="(variant, index) in pokemonVariants"
      :key="index"
      class="mb-3 variant-item clickable-variant"
      :style="{
        backgroundColor: getTierColor(variant.tier),
        borderColor: `tier-${variant.tier.toLowerCase()}`,
        borderWidth: '2px',
        '--tier-color': `var(--v-theme-tier-${variant.tier.toLowerCase()})`
      }"
      rounded="lg"
      @click="selectVariant(index)"
    >
      <template #prepend>
        <v-chip :color="`tier-${variant.tier.toLowerCase()}`" variant="flat" class="mr-2 tier-chip">
          <span class="font-weight-bold">{{ variant.tier }}</span>
        </v-chip>
      </template>

      <!-- Score in Title Slot -->
      <template #title>
        <v-row align="center" no-gutters class="mb-2">
          <v-col cols="12" sm="auto" class="mb-1 mb-sm-0 mr-2">
            <div class="d-flex align-center">
              <span class="text-caption text-medium-emphasis mr-2">Score:</span>
              <span class="font-weight-bold text-h6">{{ localizeNumber(variant.score) }}</span>
            </div>
          </v-col>
          <v-col v-if="getSupportValue(variant) > 0" cols="12" sm="auto">
            <div class="support-block">
              <span class="text-caption text-medium-emphasis">
                {{ localizeNumber(getSupportValue(variant)) }} ({{ getSupportPercentage(variant) }}%) support value
              </span>
            </div>
          </v-col>
          <v-col cols="12" class="my-1">
            <v-divider />
          </v-col>
        </v-row>
      </template>

      <!-- Ingredients Row -->
      <v-row class="mb-2" align="start" no-gutters>
        <v-col cols="12" sm="auto" class="mb-1 mb-sm-0">
          <span class="text-caption font-weight-medium text-medium-emphasis ingredient-label">Ingredients:</span>
        </v-col>
        <v-col cols="12" sm="">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
              :key="i"
              size="small"
              class="ingredient-chip"
            >
              <template #prepend>
                <v-avatar size="20">
                  <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
                </v-avatar>
              </template>
              <span class="text-caption">{{ ing.name }}</span>
              <span class="text-caption ml-1">x{{ ing.amount }}</span>
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Synergies Row -->
      <v-row v-if="getSynergisticTeammates(variant).length > 0" align="start" no-gutters>
        <v-col cols="12" sm="auto" class="mb-1 mb-sm-0">
          <span class="text-caption font-weight-medium text-medium-emphasis synergy-label">Top synergies:</span>
        </v-col>
        <v-col cols="12" sm="">
          <div class="d-flex align-center flex-wrap ga-1">
            <v-chip
              v-for="(mate, mIndex) in getSynergisticTeammates(variant)"
              :key="mIndex"
              size="small"
              class="synergy-chip"
              variant="outlined"
              color="accent"
            >
              <template #prepend>
                <v-avatar size="18">
                  <v-img :src="pokemonDisplayImageUrlByName(mate.name)" :alt="mate.name" eager></v-img>
                </v-avatar>
              </template>
              <span class="text-caption">{{ mate.name }}</span>
              <span class="text-caption ml-1 opacity-75">({{ mate.count }})</span>
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil
} from '@/services/utils/image-utils'
import { getTierColor } from '@/services/utils/tierlist-utils'
import { localizeNumber, type PokemonWithTiering } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
}>()

const emit = defineEmits<{
  selectVariantForRecipes: [index: number]
}>()

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)

const pokemonVariants = computed(() => {
  return props.allPokemonVariantsData
    .filter((p) => p.pokemonWithSettings.pokemon === pokemonName.value)
    .sort((a, b) => b.score - a.score)
})

const getSynergisticTeammates = (variant: PokemonWithTiering) => {
  const teammateCounts: Record<string, { name: string; count: number }> = {}
  variant.contributions?.forEach((contrib) => {
    contrib.team?.forEach((teamMember) => {
      if (teamMember.pokemon !== pokemonName.value) {
        if (!teammateCounts[teamMember.pokemon]) {
          teammateCounts[teamMember.pokemon] = { name: teamMember.pokemon, count: 0 }
        }
        teammateCounts[teamMember.pokemon].count++
      }
    })
  })
  return Object.values(teammateCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
}

const getSupportValue = (variant: PokemonWithTiering) => {
  return variant.contributions?.reduce((sum, contrib) => sum + (contrib.skillValue || 0), 0) || 0
}

const getSupportPercentage = (variant: PokemonWithTiering) => {
  const totalScore = variant.score
  const supportValue = getSupportValue(variant)
  if (totalScore === 0) return '0'
  return ((supportValue / totalScore) * 100).toFixed(1)
}

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrlUtil(name)
}

const pokemonDisplayImageUrlByName = (name: string) => {
  return getPokemonDisplayImageUrlUtil({ pokemonName: name, shiny: false, happy: false })
}

const selectVariant = (index: number) => {
  emit('selectVariantForRecipes', index)
}
</script>

<style scoped lang="scss">
.variant-item {
  transition:
    border-color 0.2s ease,
    transform 0.15s ease-out,
    box-shadow 0.2s ease;
  padding: 16px !important;
  cursor: pointer;

  &:hover {
    border-color: rgba(var(--tier-color), 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(var(--tier-color), 0.2);
  }

  @media (max-width: 599px) {
    padding: 12px !important;

    .tier-chip {
      margin-bottom: 8px;
    }
  }
}

.support-block {
  @media (max-width: 599px) {
    margin-left: 0;
  }
}

.ingredient-label,
.synergy-label {
  @media (max-width: 599px) {
    display: block;
    margin-bottom: 4px;
    min-width: 100%;
  }

  @media (min-width: 600px) {
    margin-right: 8px;
    white-space: nowrap;
  }
}

.ingredient-chip,
.synergy-chip {
  margin-bottom: 4px;

  @media (max-width: 599px) {
    font-size: 0.7rem;

    .v-avatar {
      width: 16px !important;
      height: 16px !important;
    }
  }
}

.synergy-chip {
  border: 1px solid rgba(var(--v-theme-accent), 0.4) !important;
  color: rgb(var(--v-theme-accent)) !important;
  background-color: rgba(var(--v-theme-accent), 0.08) !important;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(var(--v-theme-accent), 0.15) !important;
    border-color: rgba(var(--v-theme-accent), 0.6) !important;
    transform: translateY(-1px);
  }
}

@media (max-width: 599px) {
  .variant-item {
    .v-list-item__prepend {
      margin-right: 8px;
    }
  }

  .d-flex.flex-wrap {
    gap: 2px;
  }

  .mb-2 {
    margin-bottom: 8px !important;
  }

  .mb-3 {
    margin-bottom: 12px !important;
  }
}
</style>
