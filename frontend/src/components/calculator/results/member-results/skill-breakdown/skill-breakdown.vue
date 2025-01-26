<template>
  <v-row class="flex-center px-2" dense>
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Skill Breakdown </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  averageSkillProcsPlugin,
  getSkillProcChartData,
  getSkillProcChartOptions
} from '@/components/calculator/results/member-results/skill-breakdown/skill-proc-distribution-data'
import BarChart from '@/components/custom-components/charts/bar-chart/bar-chart.vue'
import { useViewport } from '@/composables/viewport-composable'
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { computed, defineComponent, type PropType } from 'vue'
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
    const themeColors = theme.current.value.colors
    const skillColor = themeColors['skill']
    const strengthColor = themeColors['strength']

    // Computed skill distributions
    const skillDistributions = computed(() => {
      return props.pokemonProduction.production.advanced?.skillProcDistribution ?? {}
    })

    // Generate chart data using the skill color
    const chartData = computed(() => getSkillProcChartData(skillDistributions.value, skillColor))

    const mostCommonProcsPerDay = computed(() => {
      const skillDistributions = props.pokemonProduction.production.advanced?.skillProcDistribution ?? {}
      const mostCommonProcs = Object.entries(skillDistributions).reduce((a, b) => (b[1] > a[1] ? b : a))
      return { procs: MathUtils.round(+mostCommonProcs[0], 1), percentage: MathUtils.round(+mostCommonProcs[1], 1) }
    })

    const averageSkillProcsPerDay = computed(() => {
      return MathUtils.round(props.pokemonProduction.production.skillProcs, 1)
    })

    // Generate chart options
    const chartOptions = computed(() => getSkillProcChartOptions())

    const chartPlugins = [averageSkillProcsPlugin(averageSkillProcsPerDay.value, strengthColor)]

    const { isMobile, viewportWidth } = useViewport()

    return {
      chartData,
      chartOptions,
      chartPlugins,
      mostCommonProcsPerDay,
      averageSkillProcsPerDay,
      isMobile,
      viewportWidth
    }
  }
})
</script>
