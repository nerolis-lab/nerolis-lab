import { describe, expect, it } from 'vitest'
import { generateIvData } from './iv-chart'

describe('ivTextPlugin', () => {
  const testTheme: { [key: string]: string } = {
    berry: 'berryVal',
    skill: 'skillVal',
    ingredient: 'ingVal'
  }
  it('initializes the chart data correctly', () => {
    const value = generateIvData(testTheme).value
    expect(value.labels).toEqual(['Skill', 'Ingredient', 'Berry'])
    expect(value.datasets[0].data).toEqual([0, 0, 0])
  })

  it('updates the point colors on mount without mocks', () => {
    const value = generateIvData(testTheme).value
    expect(value.datasets[0].pointBorderColor).toEqual(['skillVal', 'ingVal', 'berryVal'])
    expect(value.datasets[0].pointBackgroundColor).toEqual(['skillVal', 'ingVal', 'berryVal'])
  })
})
