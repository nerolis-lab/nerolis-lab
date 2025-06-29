<template>
  <!-- Sticky avatar for mobile -->
  <div v-if="isMobile" class="sticky-avatar" :class="{ 'sticky-avatar--visible': showStickyAvatar }">
    <v-avatar size="32">
      <v-img :src="pokemonAvatarUrl" :alt="pokemonName" />
    </v-avatar>
  </div>

  <v-tabs v-model="activeTab" bg-color="background" color="primary" grow slider-color="primary" class="rounded-t-lg">
    <v-tab ref="overviewTabElement" value="overview">
      <v-avatar size="20" class="mr-2">
        <v-img :src="pokemonAvatarUrl" :alt="pokemonName" />
      </v-avatar>
      Overview
    </v-tab>
    <v-tab value="variants">
      <v-icon start size="small">mdi-dna</v-icon>Variants
      <v-chip v-if="variantCount > 20" size="x-small" class="ml-1" color="warning">{{ variantCount }}</v-chip>
    </v-tab>
    <v-tab value="recipes">
      <v-icon start size="small">mdi-silverware-fork-knife</v-icon>Recipes
      <v-chip v-if="isHighVariantCount" size="x-small" class="ml-1" color="warning">{{ variantCount }}</v-chip>
    </v-tab>
  </v-tabs>

  <v-window v-model="activeTab" class="bg-background pa-2 rounded-b-lg" style="height: 500px; overflow-y: auto">
    <!-- Overview Tab -->
    <v-window-item value="overview" class="pt-2">
      <div v-if="isHighVariantCount" class="performance-warning mb-3">
        <v-alert type="warning" density="compact" variant="tonal">
          Data may take longer to load due to {{ pokemonName }} having {{ variantCount }} variants.
        </v-alert>
      </div>
      <OverviewTab :pokemon="props.pokemon" />
    </v-window-item>

    <!-- Ingredient Variants Tab -->
    <v-window-item value="variants">
      <VariantsTab
        v-if="shouldRenderVariantsTab"
        :pokemon="props.pokemon"
        :all-pokemon-variants-data="props.allPokemonVariantsData"
        @select-variant-for-recipes="handleVariantSelection"
      />
      <div v-else class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
        <div class="text-body-2 mt-2">Loading variants...</div>
      </div>
    </v-window-item>

    <!-- Top Recipes Tab -->
    <v-window-item value="recipes">
      <RecipesTab
        v-if="shouldRenderRecipesTab"
        :pokemon="props.pokemon"
        :all-pokemon-variants-data="props.allPokemonVariantsData"
        :selected-variant-index="selectedVariantIndex"
      />
      <div v-else class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
        <div class="text-body-2 mt-2">Preparing recipe data...</div>
      </div>
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { useStickyAvatar } from '@/composables/use-sticky-avatar/use-sticky-avatar'
import { avatarImage } from '@/services/utils/image-utils'
import { getPokemon, type PokemonWithTiering } from 'sleepapi-common'
import { computed, nextTick, ref, watch } from 'vue'
import OverviewTab from './tabs/OverviewTab.vue'
import RecipesTab from './tabs/RecipesTab.vue'
import VariantsTab from './tabs/VariantsTab.vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
}>()

const activeTab = ref('overview')
const selectedVariantIndex = ref(0)
const shouldRenderVariantsTab = ref(false)
const shouldRenderRecipesTab = ref(false)
const isRecipesTabLoading = ref(false)
const overviewTabElement = ref<HTMLElement | null>(null)

const { isMobile } = useBreakpoint()
const { showStickyAvatar } = useStickyAvatar(overviewTabElement, isMobile)

const variantCount = computed(() => {
  return props.allPokemonVariantsData.length
})

const pokemonName = computed(() => getPokemon(props.pokemon.pokemonWithSettings.pokemon).displayName)

const pokemonAvatarUrl = computed(() =>
  avatarImage({
    pokemonName: props.pokemon.pokemonWithSettings.pokemon,
    shiny: false,
    happy: true
  })
)

const isHighVariantCount = computed(() => variantCount.value > 10)

// Lazy load tabs based on user interaction
watch(activeTab, async (newTab) => {
  if (newTab === 'variants' && !shouldRenderVariantsTab.value) {
    await nextTick()
    shouldRenderVariantsTab.value = true
  } else if (newTab === 'recipes' && !shouldRenderRecipesTab.value) {
    isRecipesTabLoading.value = true
    await nextTick()
    if (isHighVariantCount.value) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    shouldRenderRecipesTab.value = true
    isRecipesTabLoading.value = false
  }
})

const handleVariantSelection = (index: number) => {
  selectedVariantIndex.value = index
  activeTab.value = 'recipes'

  // Ensure recipes tab is loaded when switching to it
  if (!shouldRenderRecipesTab.value) {
    isRecipesTabLoading.value = true
    shouldRenderRecipesTab.value = true
    // Reset loading state after a short delay to allow component to render
    nextTick(() => {
      setTimeout(() => {
        isRecipesTabLoading.value = false
      }, 200)
    })
  }
}
</script>

<style scoped lang="scss">
.sticky-avatar {
  position: absolute;
  top: 8px;
  left: 16px;
  z-index: 10;
  background: rgba(var(--v-theme-surface), 0.9);
  border-radius: 50%;
  padding: 4px;
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  pointer-events: none;

  &--visible {
    opacity: 1;
    transform: scale(1);
  }
}

.performance-warning {
  .v-alert {
    border-left: 4px solid rgb(var(--v-theme-warning));
  }
}
</style>
