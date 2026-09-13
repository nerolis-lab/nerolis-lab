import type { Produce } from '../../types/production';

export function multiplyProduce(produce: Produce, multiplyAmount: number): Produce {
  return {
    berries: produce.berries.map((set) => ({ ...set, amount: set.amount * multiplyAmount })),
    ingredients: produce.ingredients.map(({ amount, ingredient }) => ({ amount: amount * multiplyAmount, ingredient }))
  };
}
