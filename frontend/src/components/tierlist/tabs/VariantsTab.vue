<!-- TODO: add production and skill procs to each variant -->
<template>
  <v-row v-if="originalVariantCount > 10" dense class="flex-center mb-4" :class="{ 'flex-column': isMobile }">
    <v-col>
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Search ingredients..."
        variant="outlined"
        density="compact"
        hide-details
        clearable
      />
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
      <template #prepend>
        <v-chip :color="`tier-${variant.tier.toLowerCase()}`" variant="flat" class="mr-2 tier-chip">
          <span class="font-weight-bold">{{ variant.tier }}</span>
        </v-chip>
      </template>

      <!-- Score in Title Slot -->
      <template #title>
        <v-row align="center" no-gutters>
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
        </v-row>
      </template>

      <!-- Ingredients Row -->
      <v-row align="start" no-gutters class="mb-2">
        <v-col cols="12" sm="auto" class="mb-1 mb-sm-0">
          <span class="text-caption font-weight-medium text-medium-emphasis ingredient-label">Ingredients:</span>
        </v-col>
        <v-col cols="12" sm="">
          <div class="d-flex align-center flex-wrap ga-1">
            <CustomChip
              v-for="(ing, i) in variant.pokemonWithSettings.ingredientList"
              :key="i"
              color="ingredient"
              size="small"
              :prepend-avatar="ingredientDisplayImageUrl(ing.name)"
            >
              <span class="text-caption ml-1">{{ ing.amount }}</span>
            </CustomChip>
          </div>
        </v-col>
      </v-row>

      <!-- Production Row -->
      <v-row align="start" no-gutters class="mb-2">
        <v-col cols="12" sm="auto" class="mb-1 mb-sm-0">
          <span class="text-caption font-weight-medium text-medium-emphasis production-label"
            >Production per meal window:</span
          >
        </v-col>
        <v-col cols="12" sm="">
          <div class="d-flex align-center flex-wrap ga-1">
            <!-- Berry Production -->
            <CustomChip
              v-if="getPokemonByName(variant.pokemonWithSettings.pokemon)"
              color="berry"
              size="small"
              :prepend-avatar="berryDisplayImageUrl(getPokemonByName(variant.pokemonWithSettings.pokemon)!.berry)"
            >
              <span class="text-caption ml-1">{{ getBerryProduction(variant) }}</span>
            </CustomChip>

            <!-- Ingredient Production -->
            <CustomChip
              v-for="(production, i) in getIngredientProduction(variant)"
              :key="`prod-${i}`"
              color="ingredient"
              size="small"
              :prepend-avatar="ingredientDisplayImageUrl(production.name)"
            >
              <span class="text-caption ml-1">{{ production.amount }}</span>
            </CustomChip>
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
            <CustomChip
              v-for="(mate, mIndex) in getSynergisticTeammates(variant)"
              :key="mIndex"
              size="small"
              :prepend-avatar="pokemonDisplayImageUrlByName(mate.pokemonWithIngredients.pokemon)"
              color="accent"
            >
              <v-avatar
                v-for="ing in mate.pokemonWithIngredients.ingredientList"
                :key="ing.name"
                size="20"
                class="ingredient-avatar"
              >
                <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
              </v-avatar>

              <v-divider vertical class="mx-1" thickness="1" opacity="0.8" />

              <template #append>
                <v-avatar v-for="recipe in mate.recipes" :key="recipe" size="22" class="mr-1">
                  <v-img :src="recipeDisplayImageUrl(recipe)" :alt="recipe" eager></v-img>
                </v-avatar>
              </template>
            </CustomChip>
          </div>
        </v-col>
      </v-row>
    </v-list-item>

    <!-- No Results State - Inside the list -->
    <v-list-item v-if="pokemonVariants.length === 0 && searchQuery && searchQuery.trim()" class="text-center py-8">
      <div class="no-results-container">
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
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import {
  berryImage as getBerryImageUrlUtil,
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import { getTierColor } from '@/services/utils/tierlist-utils'
import {
  flatToIngredientSet,
  getPokemon,
  hashPokemonWithIngredients,
  localizeNumber,
  type PokemonWithIngredientsSimple,
  type PokemonWithTiering
} from 'sleepapi-common'
import { computed, ref, watch } from 'vue'

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

const sortOptions = [
  { text: 'Score (High to Low)', value: 'score' },
  { text: 'Score (Low to High)', value: 'score_asc' }
]

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)

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

const getPokemonByName = (name: string) => {
  return getPokemon(name)
}

const getBerryProduction = (variant: PokemonWithTiering) => {
  const pokemon = getPokemonByName(variant.pokemonWithSettings.pokemon)
  if (!pokemon) return '0'

  // Estimate berry production based on ingredient percentage
  // This is a rough estimate - actual production would need simulation
  const ingredientPercentage = pokemon.ingredientPercentage / 100
  const berryPercentage = 1 - ingredientPercentage

  // Assume roughly 20-30 helps per day for estimation
  const estimatedHelpsPerDay = 25
  const estimatedBerryProduction = Math.round(estimatedHelpsPerDay * berryPercentage)

  return estimatedBerryProduction.toString()
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

const berryDisplayImageUrl = (berry: any) => {
  return getBerryImageUrlUtil(berry)
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
.production-label,
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

.no-results-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
