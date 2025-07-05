import { ingredient, type IngredientSet } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { getIngredientImageUrl, processIngredientsForDisplay } from './ingredient-display-utils'

describe('ingredient-display-utils', () => {
  describe('processIngredientsForDisplay', () => {
    it('processes normal ingredients without grouping', () => {
      const ingredients: IngredientSet[] = [
        { amount: 10, ingredient: ingredient.FANCY_APPLE },
        { amount: 5, ingredient: ingredient.WARMING_GINGER }
      ]

      const result = processIngredientsForDisplay(ingredients)

      expect(result).toEqual([
        { name: 'Apple', amount: 10 },
        { name: 'Ginger', amount: 5 }
      ])
    })

    it('processes ingredient magnet with extra ingredients', () => {
      // Create all 17 ingredients with minimum of 2.0, some with extras
      const ingredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing, index) => ({
        amount: index < 3 ? 5.0 : 2.0, // First 3 have extra amounts
        ingredient: ing
      }))

      const result = processIngredientsForDisplay(ingredients)

      // Should have 3 extra ingredients + 1 magnet entry
      expect(result).toHaveLength(4)

      // First 3 should be the extra ingredients (amount 3.0 = 5.0 - 2.0)
      expect(result.slice(0, 3)).toEqual([
        { name: ingredient.INGREDIENTS[0].name, amount: 3.0 },
        { name: ingredient.INGREDIENTS[1].name, amount: 3.0 },
        { name: ingredient.INGREDIENTS[2].name, amount: 3.0 }
      ])

      // Last should be magnet entry
      expect(result[3]).toEqual({
        name: 'magnet',
        amount: 2.0,
        isMagnet: true
      })
    })

    it('processes pure ingredient magnet (all same amount)', () => {
      // All 17 ingredients with same amount
      const ingredients: IngredientSet[] = ingredient.INGREDIENTS.map((ing) => ({
        amount: 2.5,
        ingredient: ing
      }))

      const result = processIngredientsForDisplay(ingredients)

      // Should only have magnet entry
      expect(result).toEqual([{ name: 'magnet', amount: 2.5, isMagnet: true }])
    })

    it('sorts results by amount descending', () => {
      const ingredients: IngredientSet[] = [
        { amount: 1, ingredient: ingredient.FANCY_APPLE },
        { amount: 5, ingredient: ingredient.WARMING_GINGER },
        { amount: 3, ingredient: ingredient.BEAN_SAUSAGE }
      ]

      const result = processIngredientsForDisplay(ingredients)

      expect(result.map((r) => r.amount)).toEqual([5, 3, 1])
    })
  })

  describe('getIngredientImageUrl', () => {
    it('returns generic ingredients image for magnet', () => {
      const result = getIngredientImageUrl('magnet')
      expect(result).toBe('/images/ingredient/ingredients.png')
    })

    it('returns specific ingredient image for normal ingredients', () => {
      const result = getIngredientImageUrl('Apple')
      expect(result).toBe('/images/ingredient/apple.png')
    })

    it('handles lowercase ingredient names', () => {
      const result = getIngredientImageUrl('Apple')
      expect(result).toBe('/images/ingredient/apple.png')
    })
  })
})
