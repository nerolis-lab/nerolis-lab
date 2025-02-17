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
        <BarChart
          :chart-data="ingredientProdChartData"
          :chart-options="ingredientProdChartOptions"
          :chart-plugins="ingredientProdPlugins"
        />
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

    const ingredientProdChartData = computed(() =>
      getIngredientProdChartData(
        props.pokemonProduction.production.advanced.ingredientProductionDistribution,
        colors.accent
      )
    )
    const ingredientProdChartOptions = getIngredientProdChartOptions()
    const ingredientProdPlugins = [
      averageIngredientProcsPlugin(props.pokemonProduction.production.advanced.ingredientPercentage, colors.accent)
    ]

    return {
      skillProcChartData,
      skillProcChartOptions,
      skillProcPlugins,
      berryProdChartData,
      berryProdChartOptions,
      berryProdPlugins,
      ingredientProdChartData,
      ingredientProdChartOptions,
      ingredientProdPlugins
    }
  }
})
</script>
