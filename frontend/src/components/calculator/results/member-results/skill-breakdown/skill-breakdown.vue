<template>
  <v-row class="flex-center px-2" dense>
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Production Breakdown </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="4">
      <v-card flat class="pa-2">
        <v-card-title class="text-center text-body-1 pb-0">
          Skill Activation Distribution
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-1">mdi-information</v-icon>
            </template>
            Distribution of how many skill activations occur in each cycle
          </v-tooltip>
        </v-card-title>
        <BarChart
          :chart-data="skillProcChartData"
          :chart-options="skillProcChartOptions"
          :chart-plugins="skillProcPlugins"
        />
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card flat class="pa-2">
        <v-card-title class="text-center text-body-1 pb-0">
          Berry Production Distribution
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-1">mdi-information</v-icon>
            </template>
            Distribution of berry quantities produced in each cycle
          </v-tooltip>
        </v-card-title>
        <BarChart
          :chart-data="berryProdChartData"
          :chart-options="berryProdChartOptions"
          :chart-plugins="berryProdPlugins"
        />
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card flat class="pa-2">
        <v-card-title class="text-center text-body-1 pb-0">
          Ingredient Production Distribution
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-1">mdi-information</v-icon>
            </template>
            Distribution of ingredient quantities produced in each cycle, by level
          </v-tooltip>
        </v-card-title>
        <div v-if="hasAnyIngredients">
          <BarChart
            v-if="hasLevel0Ingredients"
            :chart-data="level0IngredientProdChartData"
            :chart-options="level0IngredientProdChartOptions"
            :chart-plugins="level0IngredientProdPlugins"
            class="mb-2"
          />
          <BarChart
            v-if="hasLevel30Ingredients"
            :chart-data="level30IngredientProdChartData"
            :chart-options="level30IngredientProdChartOptions"
            :chart-plugins="level30IngredientProdPlugins"
            class="mb-2"
          />
          <BarChart
            v-if="hasLevel60Ingredients"
            :chart-data="level60IngredientProdChartData"
            :chart-options="level60IngredientProdChartOptions"
            :chart-plugins="level60IngredientProdPlugins"
          />
        </div>
        <div v-else class="text-center pa-4">No ingredient production data available</div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import BarChart from '@/components/custom-components/charts/bar-chart/bar-chart.vue'
import {
  getSkillProcChartData,
  getSkillProcChartOptions,
  averageSkillProcsPlugin
} from './skill-proc-distribution-data'
import {
  getBerryProdChartData,
  getBerryProdChartOptions,
  averageBerryProcsPlugin
} from './berry-production-distribution-data'
import {
  getIngredientProdChartData,
  getIngredientProdChartOptions,
  averageIngredientProcsPlugin
} from './ingredient-production-distribution-data'
import type { MemberProductionExt } from '@/types/member/instanced'
import { defineComponent, type PropType, computed } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  name: 'SkillBreakdown',
  components: {
    BarChart
  },
  props: {
    pokemonProduction: {
      type: Object as PropType<MemberProductionExt>,
      required: true
    }
  },
  setup(props) {
    const theme = useTheme()
    const colors = theme.current.value.colors

    const skillProcChartData = computed(() =>
      getSkillProcChartData(props.pokemonProduction.production.advanced.skillProcDistribution, colors.primary)
    )
    const skillProcChartOptions = getSkillProcChartOptions()
    const skillProcPlugins = [
      averageSkillProcsPlugin(props.pokemonProduction.production.advanced.skillProcs, colors.primary)
    ]

    const berryProdChartData = computed(() =>
      getBerryProdChartData(props.pokemonProduction.production.advanced.berryProductionDistribution, colors.secondary)
    )
    const berryProdChartOptions = getBerryProdChartOptions()
    const berryProdPlugins = [
      averageBerryProcsPlugin(props.pokemonProduction.production.advanced.berryStrength, colors.secondary)
    ]

    // Check if each level of ingredients exists
    const hasLevel0Ingredients = computed(() => {
      const dist = props.pokemonProduction.production.advanced.level0IngredientDistribution
      return dist != null && Object.keys(dist).length > 0 && Object.values(dist).some((v) => v > 0)
    })
    const hasLevel30Ingredients = computed(() => {
      const dist = props.pokemonProduction.production.advanced.level30IngredientDistribution
      return dist != null && Object.keys(dist).length > 0 && Object.values(dist).some((v) => v > 0)
    })
    const hasLevel60Ingredients = computed(() => {
      const dist = props.pokemonProduction.production.advanced.level60IngredientDistribution
      return dist != null && Object.keys(dist).length > 0 && Object.values(dist).some((v) => v > 0)
    })

    const hasAnyIngredients = computed(
      () => hasLevel0Ingredients.value || hasLevel30Ingredients.value || hasLevel60Ingredients.value
    )

    // Level 0 ingredients
    const level0IngredientProdChartData = computed(() =>
      getIngredientProdChartData(
        props.pokemonProduction.production.advanced.level0IngredientDistribution || {},
        colors.accent
      )
    )
    const level0IngredientProdChartOptions = getIngredientProdChartOptions('0')
    const level0IngredientProdPlugins = [
      averageIngredientProcsPlugin(props.pokemonProduction.production.advanced.ingredientPercentage, colors.accent)
    ]

    // Level 30 ingredients
    const level30IngredientProdChartData = computed(() =>
      getIngredientProdChartData(
        props.pokemonProduction.production.advanced.level30IngredientDistribution || {},
        colors.info
      )
    )
    const level30IngredientProdChartOptions = getIngredientProdChartOptions('30')
    const level30IngredientProdPlugins = [
      averageIngredientProcsPlugin(props.pokemonProduction.production.advanced.ingredientPercentage, colors.info)
    ]

    // Level 60 ingredients
    const level60IngredientProdChartData = computed(() =>
      getIngredientProdChartData(
        props.pokemonProduction.production.advanced.level60IngredientDistribution || {},
        colors.success
      )
    )
    const level60IngredientProdChartOptions = getIngredientProdChartOptions('60')
    const level60IngredientProdPlugins = [
      averageIngredientProcsPlugin(props.pokemonProduction.production.advanced.ingredientPercentage, colors.success)
    ]

    return {
      skillProcChartData,
      skillProcChartOptions,
      skillProcPlugins,
      berryProdChartData,
      berryProdChartOptions,
      berryProdPlugins,
      hasAnyIngredients,
      hasLevel0Ingredients,
      hasLevel30Ingredients,
      hasLevel60Ingredients,
      level0IngredientProdChartData,
      level0IngredientProdChartOptions,
      level0IngredientProdPlugins,
      level30IngredientProdChartData,
      level30IngredientProdChartOptions,
      level30IngredientProdPlugins,
      level60IngredientProdChartData,
      level60IngredientProdChartOptions,
      level60IngredientProdPlugins
    }
  }
})
</script>
