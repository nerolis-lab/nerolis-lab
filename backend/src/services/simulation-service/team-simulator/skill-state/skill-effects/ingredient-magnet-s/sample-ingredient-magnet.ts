import { emptyIngredientInventoryFloat, ingredient } from 'sleepapi-common';

/** Pick three distinct ingredients, splitting the activation total as evenly as possible. */
export function sampleIngredientMagnet(amount: number, rng: () => number) {
  const result = emptyIngredientInventoryFloat();
  const options = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, (_, id) => id);
  for (let slot = 0; slot < 3; slot++) {
    const index = Math.floor(rng() * options.length);
    const [id] = options.splice(index, 1);
    result[id] = Math.floor(amount / 3) + (slot < amount % 3 ? 1 : 0);
  }
  return result;
}
