import { type IngredientSet, includesMagnet, ingredient } from 'sleepapi-common'

export interface ProductionDisplayItem {
  name: string
  amount: number
  isMagnet?: boolean
}

/**
 * Processes ingredients for display, handling ingredient magnet logic.
 * When a Pokemon produces all 17 ingredients (ingredient magnet), it groups
 * the base amount under a generic "magnet" entry and shows only the extra amounts
 * for specific ingredients.
 */
export function processIngredientsForDisplay(ingredients: IngredientSet[]): ProductionDisplayItem[] {
  if (includesMagnet(ingredients)) {
    // Find the minimum amount (this is the magnet amount)
    const ingMagnetAmount = ingredients.reduce(
      (min, cur) => (cur.amount < min ? cur.amount : min),
      ingredients[0].amount
    )

    // Get ingredients that are above the magnet amount
    const nonMagnetIngs = ingredients.filter((ing) => ing.amount !== ingMagnetAmount)

    const result: ProductionDisplayItem[] = []

    // Add non-magnet ingredients first (showing only the extra amount)
    nonMagnetIngs.forEach(({ amount, ingredient }) => {
      result.push({
        name: ingredient.name,
        amount: amount - ingMagnetAmount // Subtract magnet amount to show the extra
      })
    })

    // Add the magnet ingredient entry if there are other ingredients
    const uniqueIngredients = new Set(nonMagnetIngs.map(({ ingredient }) => ingredient.name))
    const otherIngredientCount = ingredient.INGREDIENTS.length - uniqueIngredients.size

    if (otherIngredientCount > 0) {
      result.push({
        name: 'magnet',
        amount: ingMagnetAmount,
        isMagnet: true
      })
    }

    // Sort by amount descending
    return result.sort((a, b) => b.amount - a.amount)
  } else {
    // No magnet, just return all ingredients normally
    return ingredients
      .map(({ amount, ingredient }) => ({
        name: ingredient.name,
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
  }
}

/**
 * Gets the appropriate image URL for an ingredient name.
 * Handles the special "magnet" case for grouped ingredients.
 */
export function getIngredientImageUrl(name: string): string {
  return name === 'magnet' ? '/images/ingredient/ingredients.png' : `/images/ingredient/${name.toLowerCase()}.png`
}
