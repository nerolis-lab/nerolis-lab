import { describe, expect, it } from 'vitest'
import {
  averageSkillProcsPlugin,
  getSkillProcChartData,
  getSkillProcChartOptions
} from './skill-proc-distribution-data'

describe('skillProcDistributionData', () => {
  describe('getSkillProcChartData', () => {
    it('returns correct chart data', () => {
      const skillDistributions = { 0: 10, 1: 20, 2: 30 }
      const result = getSkillProcChartData(skillDistributions, '#FF0000')
      expect(result.labels).toEqual(['0', '1', '2'])
      expect(result.datasets[0].data).toEqual([10, 20, 30])
      expect(result.datasets[0].backgroundColor).toEqual('#FF000033')
      expect(result.datasets[0].borderColor).toEqual('#FF0000')
    })
  })

  describe('averageSkillProcsPlugin', () => {
    it('creates a plugin with the correct id', () => {
      const plugin = averageSkillProcsPlugin(2, '#00FF00')
      expect(plugin.id).toEqual('averageLine')
    })
  })

  describe('getSkillProcChartOptions', () => {
    it('returns correct chart options', () => {
      const options = getSkillProcChartOptions()
      expect(options.responsive).toBe(true)
      expect(options.plugins.legend.display).toBe(false)
      expect(options.plugins.tooltip.enabled).toBe(true)
      expect(options.scales.x.ticks.color).toEqual('#FFFFFF')
      expect(options.scales.y.ticks.color).toEqual('#FFFFFF')
      expect(options.scales.y.beginAtZero).toBe(true)
    })
  })
})
