<template>
  <v-tabs v-model="activeTab" bg-color="background" color="primary" grow slider-color="primary" class="rounded-t-lg">
    <v-tab value="overview"><v-icon start size="small">mdi-account-details-outline</v-icon>Overview</v-tab>
    <v-tab value="variants"><v-icon start size="small">mdi-dna</v-icon>Variants</v-tab>
    <v-tab value="recipes"><v-icon start size="small">mdi-silverware-fork-knife</v-icon>Recipes</v-tab>
  </v-tabs>

  <v-window
    v-model="activeTab"
    class="bg-background pa-2 rounded-b-lg"
    :style="{ height: isMobile ? '500px' : '320px', overflowY: 'auto' }"
  >
    <!-- Overview Tab -->
    <v-window-item value="overview" class="pt-2">
      <OverviewTab :pokemon="props.pokemon" />
    </v-window-item>

    <!-- Ingredient Variants Tab -->
    <v-window-item value="variants">
      <VariantsTab
        :pokemon="props.pokemon"
        :all-pokemon-variants-data="props.allPokemonVariantsData"
        @select-variant-for-recipes="handleVariantSelection"
      />
    </v-window-item>

    <!-- Top Recipes Tab -->
    <v-window-item value="recipes">
      <RecipesTab
        :pokemon="props.pokemon"
        :all-pokemon-variants-data="props.allPokemonVariantsData"
        :selected-variant-index="selectedVariantIndex"
      />
    </v-window-item>
  </v-window>
</template>

<script setup lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import type { PokemonWithTiering } from 'sleepapi-common'
import { ref } from 'vue'
import OverviewTab from './tabs/OverviewTab.vue'
import RecipesTab from './tabs/RecipesTab.vue'
import VariantsTab from './tabs/VariantsTab.vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
  allPokemonVariantsData: PokemonWithTiering[]
}>()

const activeTab = ref('overview')
const selectedVariantIndex = ref(0)

const { isMobile } = useBreakpoint()

const handleVariantSelection = (index: number) => {
  selectedVariantIndex.value = index
  activeTab.value = 'recipes'
}
</script>
