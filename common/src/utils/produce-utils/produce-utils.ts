import type { Produce } from '../../types/production';

export function multiplyProduce(produce: Produce, multiplyAmount: number): Produce {
  return {
    berries: produce.berries.map(({ amount, berry, level }) => ({ amount: amount * multiplyAmount, berry, level })),
    ingredients: produce.ingredients.map(({ amount, ingredient }) => ({ amount: amount * multiplyAmount, ingredient }))
  };
}
