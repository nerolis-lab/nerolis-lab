import { describe, expect, it } from 'vitest'
import { generateIvData } from './iv-chart'

describe('ivTextPlugin', () => {
  it('initializes the chart data correctly', () => {
    expect(generateIvData.value.labels).toEqual(['Skill', 'Ingredient', 'Berry'])
    expect(generateIvData.value.datasets[0].data).toEqual([0, 0, 0])
  })

  it('updates the point colors on mount without mocks', () => {
    expect(generateIvData.value.datasets[0].pointBorderColor).toEqual(['#ff616e', '#fbe346', '#b297e7'])
    expect(generateIvData.value.datasets[0].pointBackgroundColor).toEqual(['#ff616e', '#fbe346', '#b297e7'])
  })
})
