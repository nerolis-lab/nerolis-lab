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
            Distribution of ingredient quantities produced in each cycle
          </v-tooltip>
        </v-card-title>
        <div v-if="hasIngredients">
          <template v-for="(chartData, ingredientName) in ingredientCharts" :key="ingredientName">
            <div class="text-subtitle-2 text-center">{{ ingredientName }}</div>
            <BarChart
              :chart-data="chartData.data"
              :chart-options="chartData.options"
              :chart-plugins="chartData.plugins"
              class="mb-4"
            />
          </template>
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

// Define a set of colors to cycle through for ingredient charts
const INGREDIENT_COLORS = ['accent', 'info', 'success', 'warning', 'error']

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
    const skillProcPlugins: any[] = [
      //averageSkillProcsPlugin(props.pokemonProduction.production.advanced.skillProcs, colors.primary)
    ]

    const berryProdChartData = computed(() =>
      getBerryProdChartData(props.pokemonProduction.production.advanced.berryProductionDistribution, colors.secondary)
    )
    const berryProdChartOptions = getBerryProdChartOptions()
    const berryProdPlugins: any[] = [
      //averageBerryProcsPlugin(props.pokemonProduction.production.advanced.berryStrength, colors.secondary)
    ]

    const hasIngredients = computed(() => {
      const distributions = props.pokemonProduction.production.advanced.ingredientDistributions
      console.log('Debug - Received ingredient distributions:', distributions)
      return (
        Object.keys(distributions).length > 0 &&
        Object.values(distributions).some((dist) => Object.values(dist).some((v) => v > 0))
      )
    })

    const ingredientCharts = computed(() => {
      const distributions = props.pokemonProduction.production.advanced.ingredientDistributions
      const charts: Record<string, { data: any; options: any; plugins: any }> = {}

      console.log('Debug - Creating charts for distributions:', distributions)
      Object.entries(distributions).forEach(([ingredientName, distribution], index) => {
        console.log(`Debug - Processing ingredient ${ingredientName}:`, distribution)
        // Skip if distribution is not valid
        if (!distribution || typeof distribution !== 'object') {
          console.log(`Debug - Skipping invalid distribution for ${ingredientName}`)
          return
        }

        // Cycle through colors for different ingredients
        const colorName = INGREDIENT_COLORS[index % INGREDIENT_COLORS.length]
        const color = colors[colorName]
        console.log(`Debug - Using color ${colorName} for ${ingredientName}`)

        // Convert distribution to Record<number, number>
        const typedDistribution = Object.entries(distribution).reduce(
          (acc, [key, value]) => {
            acc[Number(key)] = Number(value)
            return acc
          },
          {} as Record<number, number>
        )
        console.log(`Debug - Converted distribution for ${ingredientName}:`, typedDistribution)

        charts[ingredientName] = {
          data: getIngredientProdChartData(typedDistribution, color),
          options: getIngredientProdChartOptions(ingredientName),
          plugins: [
            //averageIngredientProcsPlugin(props.pokemonProduction.production.advanced.ingredientPercentage, color)
          ]
        }
        console.log(`Debug - Created chart for ${ingredientName}:`, charts[ingredientName])
      })

      console.log('Debug - Final charts object:', charts)
      return charts
    })

    return {
      skillProcChartData,
      skillProcChartOptions,
      skillProcPlugins,
      berryProdChartData,
      berryProdChartOptions,
      berryProdPlugins,
      hasIngredients,
      ingredientCharts
    }
  }
})
</script>
