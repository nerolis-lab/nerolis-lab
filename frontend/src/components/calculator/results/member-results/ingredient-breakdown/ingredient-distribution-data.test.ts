import { describe, expect, it } from 'vitest'
import {
  ingredientColor,
  ingredientCurve,
  ingredientUpperBound,
  summarizeIngredient
} from './ingredient-distribution-data'

describe('ingredient distributions', () => {
  it('uses observed probabilities for moments and quartiles', () => {
    const result = summarizeIngredient('Egg', { 0: 25, 2: 50, 4: 25 })
    expect(result.average).toBe(2)
    expect(result.median).toBe(2)
    expect(result.firstQuartile).toBe(1)
    expect(result.thirdQuartile).toBe(3)
    expect(result.standardDeviation).toBeCloseTo(Math.sqrt(2))
  })
  it('normalizes rounded percentages and preserves fractional production', () => {
    const result = summarizeIngredient('Egg', { 0.5: 33.33, 1.5: 33.33, 2.5: 33.33 })
    expect(result.average).toBeCloseTo(1.5)
    expect(result.median).toBe(1.5)
  })
  it('sets a shared upper bound from all ingredients', () => {
    const small = summarizeIngredient('Egg', { 1: 100 })
    const large = summarizeIngredient('Herb', { 0: 50, 20: 50 })
    expect(ingredientUpperBound([small, large])).toBe(40)
    expect(ingredientUpperBound([])).toBe(10)
    expect(ingredientUpperBound([summarizeIngredient('Egg', { 21: 100 })])).toBe(30)
  })
  it('keeps zero-variance and empty curves finite', () => {
    for (const distribution of [{ 0: 100 }, {}] as Record<number, number>[]) {
      const summary = summarizeIngredient('Egg', distribution)
      expect(
        ingredientCurve(summary, ingredientUpperBound([summary])).every(
          ({ x, y }) => Number.isFinite(x) && Number.isFinite(y)
        )
      ).toBe(true)
    }
  })
  it('retains separate modes instead of substituting a normal distribution', () => {
    const curve = ingredientCurve(summarizeIngredient('Egg', { 0: 50, 20: 50 }), 40)
    expect(curve[0].y).toBeGreaterThan(curve[60].y)
    expect(curve[120].y).toBeGreaterThan(curve[60].y)
  })
  it('provides stable ingredient colors compatible with the skill fill formula', () => {
    expect(ingredientColor('Egg')).toMatch(/^#[\da-f]{6}$/)
    expect(ingredientColor('Egg')).not.toBe(ingredientColor('Herb'))
  })
})
