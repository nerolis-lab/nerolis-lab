import RadarChart from '@/components/custom-components/charts/radar-chart.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import type { ChartData } from 'chart.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('RadarChart', () => {
  let wrapper: VueWrapper<InstanceType<typeof RadarChart>>

  const chartData: ChartData<'radar', (number | null)[], string> = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        label: 'Sample Dataset',
        data: [10, 20, 30, 40],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true
      }
    }
  }

  const chartPlugins = [
    {
      id: 'customPlugin',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      beforeDraw: (chart: any) => {
        // Custom plugin logic
      }
    }
  ]

  beforeEach(() => {
    wrapper = mount(RadarChart, {
      props: {
        chartData,
        chartOptions,
        chartPlugins
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('receives chartData, chartOptions, and chartPlugins props correctly', () => {
    expect(wrapper.props('chartData')).toEqual(chartData)
    expect(wrapper.props('chartOptions')).toEqual(chartOptions)
    expect(wrapper.props('chartPlugins')).toEqual(chartPlugins)
  })

  it('renders the Radar component with correct data', () => {
    const radarComponent = wrapper.findComponent({ name: 'Radar' })
    expect(radarComponent.exists()).toBe(true)
    expect(radarComponent.props('data')).toEqual(chartData)
    expect(radarComponent.props('options')).toEqual(chartOptions)
    expect(radarComponent.props('plugins')).toEqual(chartPlugins)
  })
})
