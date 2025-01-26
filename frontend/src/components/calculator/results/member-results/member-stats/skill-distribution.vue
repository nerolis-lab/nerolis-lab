<template>
  <v-row class="px-2">
    <!-- Skill distribution -->
    <v-col class="flex-left">
      <v-dialog v-model="showSkillDistribution" :close-on-content-click="false" max-width="500">
        <template #activator="{ props }">
          <v-btn v-bind="props" append-icon="mdi-chart-bar"> Skill distribution </v-btn>
        </template>

        <v-card class="pa-2" id="chartDialog">
          <div class="text-body-2 font-weight-light pb-6">
            <span class="font-weight-medium">{{ pokemonProduction.member.name }}</span> averages
            <span class="text-strength font-weight-medium">{{ averageSkillProcsPerDay }}</span> skill procs per day.
            Most often, <span class="font-weight-medium">{{ pokemonProduction.member.name }}</span> gets
            <span class="text-primary font-weight-medium">{{ mostCommonProcsPerDay.procs }}</span> procs, occurring
            <span class="text-primary font-weight-medium">{{ mostCommonProcsPerDay.percentage }}%</span> of the time.
          </div>

          <BarChart class="mb-3" :chartData="chartData" :chartOptions="chartOptions" :chart-plugins="chartPlugins" />

          <v-btn color="secondary" @click="showSkillDistribution = false"> Close </v-btn>
        </v-card>
      </v-dialog>
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
import type { MemberProductionExt } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { computed, defineComponent, ref, type PropType } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  name: 'SkillDistribution',
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

    const showSkillDistribution = ref(false)

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

    return {
      chartData,
      chartOptions,
      chartPlugins,
      mostCommonProcsPerDay,
      averageSkillProcsPerDay,
      showSkillDistribution
    }
  }
})
</script>
