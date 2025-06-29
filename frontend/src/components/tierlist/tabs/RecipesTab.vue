<template>
  <div v-if="pokemonVariants.length > 1" class="">
    <v-card variant="plain">
      <v-card-title>Variants</v-card-title>
      <v-chip-group v-model="selectedVariantIndex" mandatory :show-arrows="pokemonVariants.length > 6 || isMobile">
        <CustomChip
          v-for="(variant, index) in displayedVariantChips"
          :key="index"
          :value="index"
          :is-selected="selectedVariantIndex === index"
          :color="`tier-${variant.tier.toLowerCase()}`"
        >
          <div class="d-flex align-center flex-wrap">
            <div class="d-flex align-center">
              <v-avatar v-for="(ing, i) in variant.pokemonWithSettings.ingredientList" :key="i" size="25" tile>
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
          </div>
        </CustomChip>
      </v-chip-group>
    </v-card>
  </div>

  <!-- Custom navigation outside chip group -->
  <div v-if="totalChunks > 1" class="d-flex justify-center align-center">
    <v-btn :disabled="!hasPrevChunk" icon="mdi-chevron-left" variant="text" size="small" @click="goToPrevChunk" />
    <span class="mx-2 text-caption"
      >Showing {{ currentChunkIndex * chunkSize + 1 }}-{{
        Math.min((currentChunkIndex + 1) * chunkSize, pokemonVariants.length)
      }}
      of {{ pokemonVariants.length }} variants</span
    >
    <v-btn :disabled="!hasNextChunk" icon="mdi-chevron-right" variant="text" size="small" @click="goToNextChunk" />
  </div>

  <!-- Loading state -->
  <div v-if="isLoading" class="text-center py-8">
    <v-progress-circular indeterminate color="primary" size="64" />
    <div class="text-h6 mt-4">Loading recipe contributions...</div>
    <div class="text-caption text-medium-emphasis">
      Processing {{ pokemonVariants.length }} variants may take a moment
    </div>
  </div>

  <!-- Error state -->
  <v-alert v-else-if="hasError" type="error" class="mb-4">
    <div class="text-subtitle-1">Unable to load recipe data</div>
    <div class="text-body-2">
      This Pokemon has too many variants to process efficiently. Try selecting a specific variant first.
    </div>
    <template #append>
      <v-btn variant="outlined" size="small" @click="retryLoading"> Retry </v-btn>
    </template>
  </v-alert>

  <!-- Recipe contributions -->
  <v-list v-else density="comfortable" bg-color="transparent">
    <v-list-item
      v-for="(contrib, index) in topContributions"
      :key="index"
      class="mb-2"
      :base-color="contrib.recipe.type"
      rounded="lg"
      :style="{ backgroundColor: `${withOpacity(contrib.recipe.type, 0.1)}` }"
    >
      <template #prepend>
        <v-avatar rounded="lg" size="48" class="align-self-start">
          <v-img :src="recipeDisplayImageUrl(contrib.recipe.name)" :alt="contrib.recipe.name" eager></v-img>
        </v-avatar>
      </template>
      <v-list-item-title class="font-weight-bold text-subtitle-1">{{ contrib.recipe.displayName }}</v-list-item-title>
      <v-list-item-subtitle class="text-medium-emphasis">
        <div class="d-flex flex-wrap align-center ga-1">
          <span class="text-no-wrap">
            Contribution:
            <span class="font-weight-medium mr-2" :style="{ color: tierColorMapping.A }">{{
              localizeNumber(contrib.score)
            }}</span>
          </span>
          <span v-if="contrib.coverage !== undefined" class="text-no-wrap">
            Coverage: <span class="mr-2">{{ contrib.coverage.toFixed(1) }}%</span>
          </span>
          <span v-if="contrib.skillValue !== undefined && contrib.skillValue > 0" class="text-no-wrap">
            Support value: {{ localizeNumber(contrib.skillValue) }}
          </span>
        </div>
      </v-list-item-subtitle>
      <div v-if="contrib.team && contrib.team.length > 0" class="d-flex flex-column flex-sm-row align-start mt-2">
        <span class="text-medium-emphasis text-no-wrap mr-1">Team: </span>
        <div class="d-flex flex-wrap ga-1">
          <CustomChip
            v-for="(member, tIndex) in contrib.team"
            :key="tIndex"
            size="small"
            :interactive="false"
            :color="isCurrentVariantTeamMember(member) ? 'primary' : ''"
            :variant="isCurrentVariantTeamMember(member) ? 'elevated' : 'outlined'"
            :prepend-avatar="pokemonDisplayImageUrlByName(member.pokemon)"
          >
            <v-avatar
              v-for="(ing, index) in member.ingredientList"
              :key="index"
              size="20"
              :title="`${ing.amount} ${ing.name}`"
            >
              <v-img :src="ingredientDisplayImageUrl(ing.name)" :alt="ing.name" eager></v-img>
            </v-avatar>
          </CustomChip>
        </div>
      </div>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import CustomChip from '@/components/custom-components/custom-chip/CustomChip.vue'
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { withOpacity } from '@/services/utils/color-utils'
import {
  ingredientImage as getIngredientImageUrlUtil,
  avatarImage as getPokemonDisplayImageUrlUtil,
  recipeImage as getRecipeImageUrlUtil
} from '@/services/utils/image-utils'
import { getRecipe, localizeNumber, type PokemonWithTiering, type Tier } from 'sleepapi-common'
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
  selectedVariantIndex?: number
}>()

const { isMobile } = useBreakpoint()

const selectedVariantIndex = ref(0)
const isLoading = ref(false)
const hasError = ref(false)
const chunkSize = 10
const currentChunkIndex = ref(0)

// Sync with prop when it changes and calculate correct chunk
watch(
  () => props.selectedVariantIndex,
  (newIndex) => {
    if (newIndex !== undefined) {
      // Calculate which chunk contains this variant
      const targetChunk = Math.floor(newIndex / chunkSize)
      currentChunkIndex.value = targetChunk

      // Set the relative index within the current chunk
      selectedVariantIndex.value = newIndex % chunkSize
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

const displayedVariantChips = computed(() => {
  const startIndex = currentChunkIndex.value * chunkSize
  const endIndex = startIndex + chunkSize
  return pokemonVariants.value.slice(startIndex, endIndex)
})

const totalChunks = computed(() => Math.ceil(pokemonVariants.value.length / chunkSize))
const hasNextChunk = computed(() => currentChunkIndex.value < totalChunks.value - 1)
const hasPrevChunk = computed(() => currentChunkIndex.value > 0)

const goToNextChunk = () => {
  if (hasNextChunk.value) {
    currentChunkIndex.value++
    selectedVariantIndex.value = 0 // Reset to first item in new chunk
  }
}

const goToPrevChunk = () => {
  if (hasPrevChunk.value) {
    currentChunkIndex.value--
    selectedVariantIndex.value = 0 // Reset to first item in new chunk
  }
}

const selectedVariant = computed(() => {
  const actualIndex = currentChunkIndex.value * chunkSize + selectedVariantIndex.value
  return pokemonVariants.value[actualIndex] || props.pokemon
})

const topContributions = computed(() => {
  if (isLoading.value || hasError.value) {
    return []
  }

  try {
    return (
      selectedVariant.value.contributions?.map((c) => ({
        ...c,
        recipe: getRecipe(c.recipe)
      })) || []
    )
  } catch (error) {
    console.error('Error processing contributions:', error)
    hasError.value = true
    return []
  }
})

// Watch for variant changes and handle loading
watch(
  [selectedVariant, pokemonVariants],
  async ([newVariant, newVariants]) => {
    // Reset states first
    hasError.value = false

    if (newVariants.length > 100) {
      isLoading.value = true

      try {
        // Simulate processing time for large datasets
        await nextTick()

        // Check if the variant has contributions
        if (!newVariant.contributions || newVariant.contributions.length === 0) {
          hasError.value = true
        }

        // Add artificial delay for very large datasets to prevent UI freezing
        if (newVariants.length > 500) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        isLoading.value = false
      } catch (error) {
        console.error('Error loading variant data:', error)
        hasError.value = true
        isLoading.value = false
      }
    } else {
      // For smaller datasets, ensure loading is false
      isLoading.value = false

      // Still check if the variant has contributions
      if (!newVariant.contributions || newVariant.contributions.length === 0) {
        hasError.value = true
      }
    }
  },
  { immediate: true }
)

const retryLoading = () => {
  hasError.value = false
  isLoading.value = true

  // Force re-computation
  nextTick(() => {
    isLoading.value = false
  })
}

const recipeDisplayImageUrl = (name: string) => {
  return getRecipeImageUrlUtil(name)
}

const ingredientDisplayImageUrl = (name: string) => {
  return getIngredientImageUrlUtil(name)
}

const pokemonDisplayImageUrlByName = (name: string) => {
  return getPokemonDisplayImageUrlUtil({ pokemonName: name, shiny: false, happy: false })
}

const isCurrentVariantTeamMember = (member: any) => {
  return (
    member.pokemon === selectedVariant.value.pokemonWithSettings.pokemon &&
    JSON.stringify(member.ingredientList) === JSON.stringify(selectedVariant.value.pokemonWithSettings.ingredientList)
  )
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

<style scoped>
/* Minimal custom styles - most styling handled by Vuetify utilities */
</style>
