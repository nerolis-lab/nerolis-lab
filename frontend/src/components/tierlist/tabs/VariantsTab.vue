<!-- TODO: add production and skill procs to each variant -->
<template>
  <v-row v-if="originalVariantCount > 10" dense class="flex-center mb-4" :class="{ 'flex-column': isMobile }">
    <v-col class="flex-center-y">
      <CustomSearchBar v-model="searchQuery" density="compact" label="Search ingredients..." />
    </v-col>

    <v-col :cols="isMobile ? 12 : 'auto'">
      <v-select
        v-model="selectedSort"
        :items="sortOptions"
        item-title="text"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Sort by"
        style="min-width: 120px"
      />
    </v-col>
  </v-row>

  <v-list density="compact" bg-color="transparent">
    <v-list-item
      v-for="(variant, index) in displayedVariants"
      :key="index"
      class="mb-2 variant-item clickable-variant"
      :style="{
        backgroundColor: getTierColor(variant.tier),
        borderColor: `tier-${variant.tier.toLowerCase()}`,
        borderWidth: '2px',
        '--tier-color': `var(--v-theme-tier-${variant.tier.toLowerCase()})`
      }"
      rounded="lg"
      @click="selectVariant(getOriginalIndex(variant))"
    >
      <div class="tier-bookmark">
        <span class="tier-text">{{ variant.tier }}</span>
      </div>

      <div class="pa-3">
        <!-- Header with Pokemon name and ingredients -->
        <div class="variant-header mb-3">
          <div class="flex-left flex-nowrap">
            <v-avatar
              v-show="!(variant.pokemonWithSettings.ingredientList.length >= 3 && isNarrowScreen)"
              size="32"
              class="pokemon-avatar-small mr-1"
            >
              <v-img
                :src="pokemonDisplayImageUrlByName(variant.pokemonWithSettings.pokemon)"
                :alt="variant.pokemonWithSettings.pokemon"
                eager
              />
            </v-avatar>
            <h3 class="text-h6 font-weight-medium mr-1">
              {{ pokemonDisplayData(variant.pokemonWithSettings.pokemon).displayName }}
            </h3>

            <!-- Ingredients with badges -->
            <div class="flex-left flex-nowrap">
              <v-badge
                v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
                :key="i"
                :content="ing.amount"
                color="accent"
                text-color="background"
                offset-x="5"
                offset-y="5"
                class="mr-1"
              >
                <v-avatar size="36" class="ingredient-avatar">
                  <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager />
                </v-avatar>
              </v-badge>
            </div>
          </div>
        </div>

        <div class="flex-top-left variant-content">
          <div class="left-column flex-shrink-0">
            <!-- Score and Recipe Breakdown -->
            <div class="score-breakdown">
              <div class="flex-between">
                <span class="text-caption text-medium-emphasis">Score:</span>
                <span class="text-h6 font-weight-bold" :style="{ color: `rgb(var(--tier-color))` }">{{
                  localizeNumber(variant.score)
                }}</span>
              </div>

              <div class="flex-column ga-1 mt-2">
                <div v-for="(contrib, index) in variant.contributions" :key="index" class="flex-between ga-2">
                  <v-chip
                    size="small"
                    :color="recipeDisplayData(contrib.recipe).type"
                    :prepend-avatar="recipeDisplayImageUrl(contrib.recipe)"
                    :interactive="false"
                    class="recipe-chip"
                  >
                    {{ recipeDisplayData(contrib.recipe).displayName }}
                  </v-chip>
                  <div class="flex-left flex-shrink-0">
                    <v-chip v-if="index === 0" size="x-small" color="warning" class="mr-1"> 1.5x </v-chip>
                    <span class="text-caption font-weight-medium" :style="{ color: `rgb(var(--tier-color))` }">{{
                      localizeNumber(contrib.score)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="right-column flex-grow-1">
            <!-- Production -->
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis mb-1">Production:</div>
              <div class="flex-left flex-wrap ga-1">
                <CustomChip
                  v-for="(production, i) in getIngredientProduction(variant)"
                  :key="`prod-${i}`"
                  color="ingredient"
                  size="x-small"
                  :prepend-avatar="ingredientDisplayImageUrl(production.name)"
                  :interactive="false"
                >
                  <span class="text-caption ml-1">{{ production.amount }}</span>
                </CustomChip>
              </div>
            </div>

            <!-- Synergies -->
            <div v-if="getSynergisticTeammates(variant).length > 0">
              <div class="text-caption text-medium-emphasis mb-1">Top synergies:</div>
              <div class="flex-left flex-wrap ga-1">
                <CustomChip
                  v-for="(mate, mIndex) in getSynergisticTeammates(variant).slice(0, 3)"
                  :key="mIndex"
                  size="x-small"
                  :prepend-avatar="pokemonDisplayImageUrlByName(mate.pokemonWithIngredients.pokemon)"
                  color="accent"
                  :interactive="false"
                >
                  <v-avatar
                    v-for="ing in mate.pokemonWithIngredients.ingredientList"
                    :key="ing.name"
                    size="16"
                    class="ingredient-avatar"
                  >
                    <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
                  </v-avatar>

                  <v-divider vertical class="mx-1" thickness="1" opacity="0.8" />

                  <template #append>
                    <v-avatar v-for="recipe in mate.recipes" :key="recipe" size="18" class="mr-1">
                      <v-img :src="recipeDisplayImageUrl(recipe)" :alt="recipe" eager></v-img>
                    </v-avatar>
                  </template>
                </CustomChip>

                <!-- More indicator -->
                <CustomChip
                  v-if="getSynergisticTeammates(variant).length > 3"
                  size="x-small"
                  color="surface-variant"
                  :interactive="false"
                  class="more-synergies-chip"
                >
                  <v-icon size="12" class="mr-1">mdi-plus</v-icon>
                  <span class="text-caption">{{ getSynergisticTeammates(variant).length - 3 }} more</span>
                </CustomChip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-list-item>

    <!-- No Results State - Inside the list -->
    <v-list-item v-if="pokemonVariants.length === 0 && searchQuery && searchQuery.trim()" class="text-center py-8">
      <div class="flex-column-center no-results-container">
        <v-icon size="48" color="primary" class="mb-4">mdi-magnify-scan</v-icon>
        <div class="text-h6 mb-2">No variants found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          No variants match your search for "<strong>{{ searchQuery.trim() }}</strong
          >"
        </div>
        <v-btn variant="outlined" @click="searchQuery = ''" size="small"> Clear Search </v-btn>
      </div>
    </v-list-item>
  </v-list>

  <!-- Pagination -->
  <v-row dense v-if="totalPages > 1" class="flex-center mb-4">
    <v-col cols="auto">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" density="compact" />
    </v-col>
    <v-col :cols="isMobile ? 12 : 'auto'">
      <v-select
        v-model="itemsPerPage"
        :items="[10, 25, 50, 100]"
        density="compact"
        variant="outlined"
        hide-details
        label="Per page"
        style="min-width: 80px"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import CustomSearchBar from '@/components/custom-components/search-bar/CustomSearchBar.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import { getTierColor } from '@/services/utils/tierlist-utils'
import {
  flatToIngredientSet,
  getPokemon,
  getRecipe,
  hashPokemonWithIngredients,
  localizeNumber,
  type PokemonWithIngredientsSimple,
  type PokemonWithTiering
} from 'sleepapi-common'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
}>()

const emit = defineEmits<{
  selectVariantForRecipes: [index: number]
}>()

const currentPage = ref(1)
const itemsPerPage = ref(25)
const searchQuery = ref('')
const selectedSort = ref('score')
const { isMobile } = useBreakpoint()

// TODO: should probably just add a breakpoint for 360px to use-breakpoint
const isNarrowScreen = ref(false)

const updateNarrowScreen = () => {
  isNarrowScreen.value = window.innerWidth <= 360
}

onMounted(() => {
  updateNarrowScreen()
  window.addEventListener('resize', updateNarrowScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateNarrowScreen)
})

const sortOptions = [
  { text: 'Score (High to Low)', value: 'score' },
  { text: 'Score (Low to High)', value: 'score_asc' }
]

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)

const pokemonCache = new Map<string, any>()
const recipeCache = new Map<string, any>()

// Memoized lookups for performance
const pokemonDisplayData = computed(() => {
  return (pokemonName: string) => {
    if (!pokemonCache.has(pokemonName)) {
      pokemonCache.set(pokemonName, getPokemon(pokemonName))
    }
    return pokemonCache.get(pokemonName)
  }
})

const recipeDisplayData = computed(() => {
  return (recipeName: string) => {
    if (!recipeCache.has(recipeName)) {
      recipeCache.set(recipeName, getRecipe(recipeName))
    }
    return recipeCache.get(recipeName)
  }
})

const originalVariantCount = computed(() => {
  return props.allPokemonVariantsData.length
})

const pokemonVariants = computed(() => {
  let variants = props.allPokemonVariantsData

  // Apply search filter
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    variants = variants.filter((variant) =>
      variant.pokemonWithSettings.ingredientList.some((ing) => ing.name.toLowerCase().includes(query))
    )
  }

  switch (selectedSort.value) {
    case 'score':
      variants.sort((a, b) => b.score - a.score)
      break
    case 'score_asc':
      variants.sort((a, b) => a.score - b.score)
      break
  }

  return variants
})

const totalPages = computed(() => Math.ceil(pokemonVariants.value.length / itemsPerPage.value))

const displayedVariants = computed(() => {
  if (pokemonVariants.value.length === 0) {
    return []
  }

  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return pokemonVariants.value.slice(start, end)
})

// Watch for search changes and reset pagination
watch([searchQuery, selectedSort], () => {
  currentPage.value = 1
})

// Watch for when variants become empty and reset page
watch(pokemonVariants, (newVariants) => {
  if (newVariants.length === 0) {
    currentPage.value = 1
  } else if (currentPage.value > Math.ceil(newVariants.length / itemsPerPage.value)) {
    currentPage.value = 1
  }
})

const getOriginalIndex = (variant: PokemonWithTiering) => {
  // Find the index in the same order that RecipesTab uses (score descending)
  const allVariantsForPokemon = props.allPokemonVariantsData
    .filter((p) => p.pokemonWithSettings.pokemon === pokemonName.value)
    .sort((a, b) => b.score - a.score) // Match RecipesTab sorting

  return allVariantsForPokemon.findIndex(
    (v) =>
      // Match by unique combination of ingredients to ensure we get the right variant
      JSON.stringify(v.pokemonWithSettings.ingredientList) ===
      JSON.stringify(variant.pokemonWithSettings.ingredientList)
  )
}

const getIngredientProduction = (variant: PokemonWithTiering) => {
  const totalIngredients = variant.pokemonWithSettings.totalIngredients

  // Convert object to Float32Array for flatToIngredientSet
  let ingredientsArray: Float32Array
  if (totalIngredients instanceof Float32Array) {
    ingredientsArray = totalIngredients
  } else {
    // Convert object to Float32Array
    const values = Object.values(totalIngredients) as number[]
    ingredientsArray = new Float32Array(values)
  }

  const ingredientSet = flatToIngredientSet(ingredientsArray)

  return ingredientSet
    .filter((ing) => ing.amount > 0.01) // Use small threshold
    .map((ing) => ({
      name: ing.ingredient.name,
      amount: Math.round(ing.amount).toString()
    }))
}

function getSynergisticTeammates(variant: PokemonWithTiering) {
  const selfHash = hashPokemonWithIngredients({
    pokemon: variant.pokemonWithSettings.pokemon,
    ingredientList: variant.pokemonWithSettings.ingredientList
  })
  const teammateCounts: Map<string, { pokemonWithIngredients: PokemonWithIngredientsSimple; recipes: string[] }> =
    new Map()

  for (const contribution of variant.contributions) {
    for (const teamMember of contribution.team) {
      const teamMemberHash = hashPokemonWithIngredients({
        pokemon: teamMember.pokemon,
        ingredientList: teamMember.ingredientList
      })
      // skip self
      if (teamMemberHash === selfHash) {
        continue
      }

      if (teammateCounts.has(teamMemberHash)) {
        teammateCounts.get(teamMemberHash)!.recipes.push(contribution.recipe)
      } else {
        teammateCounts.set(teamMemberHash, {
          pokemonWithIngredients: teamMember,
          recipes: [contribution.recipe]
        })
      }
    }
  }

  const sortedTeammates = Array.from(teammateCounts.values()).sort((a, b) => b.recipes.length - a.recipes.length)
  const maxCount = sortedTeammates.at(0)?.recipes.length || 0
  return sortedTeammates.filter((mate) => mate.recipes.length === maxCount)
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

const recipeDisplayImageUrl = (name: string) => {
  return getRecipeImageUrlUtil(name)
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
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: rgba(var(--tier-color), 0.5);
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(var(--tier-color), 0.15);
  }

  .pokemon-avatar {
    border: 2px solid rgba(var(--tier-color), 0.3);
    flex-shrink: 0;
  }

  .pokemon-avatar-small {
    border: 2px solid rgba(var(--tier-color), 0.3);
    flex-shrink: 0;
  }

  .variant-header {
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
    padding-bottom: 8px;

    h3 {
      color: rgb(var(--v-theme-on-surface));
      margin: 0;
    }

    .ingredient-avatar {
      border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    }
  }

  .tier-bookmark {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 60px;
    height: 60px;
    background-color: rgba(var(--tier-color), 1);
    transform: rotate(45deg);
    z-index: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));

    .tier-text {
      position: absolute;
      top: 50%;
      left: 40%;
      color: white;
      font-size: 14px;
      font-weight: bold;
      line-height: 1;
      transform: rotate(-45deg) translate(-8px, 8px);
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
  }

  // Horizontal layout
  .left-column {
    flex: 1;
    min-width: 250px;
    max-width: 400px;
    margin-right: 16px;
  }

  .right-column {
    flex: 1;
    min-width: 250px;
  }

  .recipe-chip {
    flex: 1;
    max-width: 180px;
  }

  .more-synergies-chip {
    opacity: 0.8;
    font-style: italic;

    .v-icon {
      opacity: 0.7;
    }
  }

  .more-synergies-chip {
    opacity: 0.8;
    font-style: italic;

    .v-icon {
      opacity: 0.7;
    }
  }

  @media (max-width: 599px) {
    .variant-header {
      .d-flex {
        flex-wrap: wrap;
        gap: 4px;
      }
    }

    .pokemon-avatar {
      margin-right: 8px !important;
    }

    .variant-content {
      flex-direction: column !important;
      gap: 8px !important;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .left-column {
      max-width: 100% !important;
      width: 100% !important;
      min-width: 0;
      overflow: hidden;
      margin-right: 0;
    }

    .right-column {
      min-width: 0 !important;
      width: 100% !important;
    }
  }
}

@media (max-width: 599px) {
  .d-flex.flex-wrap {
    gap: 2px;
  }

  .mb-2 {
    margin-bottom: 6px !important;
  }
}

.no-results-container {
  width: 100%;
  min-height: 200px;
}
</style>
