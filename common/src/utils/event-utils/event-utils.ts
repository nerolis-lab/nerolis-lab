import type { Ingredient, Pokemon } from '../../domain';

export function addOneIngredient(pokemon: Pokemon): Pokemon {
  return {
    ...pokemon,
    ingredient0: { amount: pokemon.ingredient0.amount + 1, ingredient: pokemon.ingredient0.ingredient },
    ingredient30: pokemon.ingredient30.map(({ amount, ingredient }) => ({ amount: amount + 1, ingredient })),
    ingredient60: pokemon.ingredient60.map(({ amount, ingredient }) => ({ amount: amount + 1, ingredient }))
  };
}

export function strengthenIngredientByHalf(ingredient: Ingredient): Ingredient {
  return {
    ...ingredient,
    value: ingredient.value * 1.5,
    taxedValue: ingredient.taxedValue * 1.5
  };
}

export function strengthenIngredientSkillOutputByHalf(amount: number): number {
  return Math.floor(amount * 1.5);
}
