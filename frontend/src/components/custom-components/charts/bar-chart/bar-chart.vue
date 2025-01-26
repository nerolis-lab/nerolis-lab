<template>
  <Bar :options="chartOptions" :data="chartData" :plugins="chartPlugins" />
</template>

<script lang="ts">
import type { ChartData, Plugin } from 'chart.js'
import { Bar } from 'vue-chartjs'

export default {
  name: 'BarChart',
  components: {
    Bar
  },
  props: {
    chartData: {
      type: Object as () => ChartData<'bar'>,
      required: true
    },
    chartOptions: {
      type: Object,
      required: true
    },
    chartPlugins: {
      type: Array as () => Plugin<'bar'>[],
      required: false,
      default: () => []
    }
  }
}
</script>
