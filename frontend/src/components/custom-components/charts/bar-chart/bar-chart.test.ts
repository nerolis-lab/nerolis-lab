import BarChart from '@/components/custom-components/charts/bar-chart/bar-chart.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import type { ChartData } from 'chart.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('BarChart', () => {
  let wrapper: VueWrapper<InstanceType<typeof BarChart>>

  const chartData: ChartData<'bar', (number | null)[], string> = {
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
      y: {
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
    wrapper = mount(BarChart, {
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

  it('renders the Bar component with correct data', () => {
    const barComponent = wrapper.findComponent({ name: 'Bar' })
    expect(barComponent.exists()).toBe(true)
    expect(barComponent.props('data')).toEqual(chartData)
    expect(barComponent.props('options')).toEqual(chartOptions)
    expect(barComponent.props('plugins')).toEqual(chartPlugins)
  })
})
