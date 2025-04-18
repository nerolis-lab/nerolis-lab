import type {
  Ingredient,
  IngredientIndexToFloatAmount,
  IngredientIndexToIntAmount,
  IngredientSet,
  IngredientSetSimple
} from '../../domain/ingredient/ingredient';
import { INGREDIENTS, TOTAL_NUMBER_OF_INGREDIENTS } from '../../domain/ingredient/ingredients';
import type { Pokemon } from '../../domain/pokemon/pokemon';
import '../../prototype/logger';
import { emptyIngredientInventoryFloat, emptyIngredientInventoryInt } from '../flat-utils';
import { MathUtils } from '../math-utils/math-utils';
import { capitalize } from '../string-utils/string-utils';

export const ING_ID_LOOKUP: Record<string, number> = Object.fromEntries(
  INGREDIENTS.map((ingredient, index) => [ingredient.name, index])
);

const ingredientBonusCache = new Map<string, number>();

export function getIngredientName(ingredient: Ingredient): string;
export function getIngredientName(ingredient: number): string;
export function getIngredientName(ingredient: Ingredient | number): string {
  return typeof ingredient === 'number' ? INGREDIENTS[ingredient].name : ingredient.name;
}

export function getIngredient(name: string): Ingredient;
export function getIngredient(index: number): Ingredient;
export function getIngredient(param: string | number): Ingredient {
  const index = typeof param === 'number' ? param : ING_ID_LOOKUP[param];
  return INGREDIENTS[index];
}
export function getIngredientNames(): string[] {
  return INGREDIENTS.map((ing) => ing.name);
}

export function emptyIngredientInventory(): IngredientSet[] {
  return [];
}

export function ingredientSetToFloatFlat(ingredientSet: IngredientSet[]): Float32Array {
  const result = emptyIngredientInventoryFloat();

  for (const { ingredient, amount } of ingredientSet) {
    const index = ING_ID_LOOKUP[ingredient.name];
    // we assume that this works since both ING_ID_LOOKUP and result contain one element for each Ingredient
    // we don't verify due to performance reasons
    result[index] += amount;
  }

  return result;
}
export function ingredientSetToIntFlat(ingredientSet: IngredientSet[]): Int16Array {
  const result = emptyIngredientInventoryInt();

  for (const { ingredient, amount } of ingredientSet) {
    const index = ING_ID_LOOKUP[ingredient.name];
    // we assume that this works since both ING_ID_LOOKUP and result contain one element for each Ingredient
    // we don't verify due to performance reasons
    result[index] += amount;
  }

  return result;
}

export function flatToIngredientSet(
  ingredients: IngredientIndexToFloatAmount | IngredientIndexToIntAmount
): IngredientSet[] {
  const result: IngredientSet[] = emptyIngredientInventory();
  for (let i = 0, len = ingredients.length; i < len; ++i) {
    const amount = ingredients[i];
    if (amount > 0) {
      result[result.length] = { ingredient: INGREDIENTS[i], amount };
    }
  }
  return result;
}

export function simplifyIngredientSet(ingredients: IngredientSet[]): IngredientSetSimple[] {
  const result: IngredientSetSimple[] = [];
  for (const { ingredient, amount } of ingredients) {
    result.push({ name: ingredient.name, amount });
  }
  return result;
}

export function unsimplifyIngredientSet(ingredients: IngredientSetSimple[]): IngredientSet[] {
  const result: IngredientSet[] = [];
  for (const { name, amount } of ingredients) {
    result.push({ ingredient: INGREDIENTS.find((ing) => ing.name === name), amount });
  }
  return result;
}

export function ingredientIndex(level: number) {
  return Math.floor(Math.min(level / 30, 2));
}
/**
 * Combines same ingredients in drop, e.g., [2 honey, 4 honey, 5 milk] => [6 honey, 5 milk]
 */
export function combineSameIngredientsInDrop(ingredients: IngredientSet[]): IngredientSet[] {
  const combined = new Map<string, IngredientSet>();

  for (const drop of ingredients) {
    const { name } = drop.ingredient;
    const existingDrop = combined.get(name);

    if (existingDrop) {
      existingDrop.amount += drop.amount;
    } else {
      combined.set(name, { ...drop });
    }
  }

  return Array.from(combined.values());
}

export function isFlat(
  ingredients: IngredientSet[] | IngredientSetSimple[] | IngredientIndexToFloatAmount | IngredientIndexToIntAmount
): ingredients is IngredientIndexToFloatAmount | IngredientIndexToIntAmount {
  return ingredients instanceof Float32Array || ingredients instanceof Int16Array;
}

export function shortPrettifyIngredientDrop(ingredients: IngredientSet[]): string;
export function shortPrettifyIngredientDrop(ingredients: IngredientIndexToFloatAmount): string;
export function shortPrettifyIngredientDrop(ingredients: IngredientIndexToIntAmount): string;
export function shortPrettifyIngredientDrop(
  ingredients: IngredientSet[] | IngredientIndexToFloatAmount | IngredientIndexToIntAmount
): string {
  const ingredientNames = Array(ingredients.length);

  if (isFlat(ingredients)) {
    for (let i = 0; i < TOTAL_NUMBER_OF_INGREDIENTS; ++i) {
      ingredientNames[i] = capitalize(getIngredientName(i));
    }
  } else {
    for (let i = 0; i < ingredients.length; ++i) {
      ingredientNames[i] = capitalize(getIngredientName(ingredients[i].ingredient));
    }
  }

  return ingredientNames.join('/');
}

/**
 * Performs a check if the ingredients array includes an ingredient with amount 0.
 * If so it does not include magnet ingredients
 * @returns true if the ingredients include magnet ingredients
 */
export function includesMagnet(ingredients: IngredientSet[]): boolean {
  return ingredients.length >= TOTAL_NUMBER_OF_INGREDIENTS;
}

export function prettifyIngredientDrop(ingredients: IngredientSet[], separator?: string): string;
export function prettifyIngredientDrop(ingredients: IngredientIndexToFloatAmount, separator?: string): string;
export function prettifyIngredientDrop(ingredients: IngredientIndexToIntAmount, separator?: string): string;
export function prettifyIngredientDrop(
  ingredients: IngredientSet[] | IngredientIndexToFloatAmount | IngredientIndexToIntAmount,
  separator = ', '
): string {
  const ingredientSet: IngredientSet[] = isFlat(ingredients) ? flatToIngredientSet(ingredients) : ingredients;

  if (!includesMagnet(ingredientSet)) {
    return ingredientSet
      .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${getIngredientName(ingredient)}`)
      .join(separator);
  }

  let ingMagnetAmount = Infinity;
  for (const { amount } of ingredientSet) {
    if (amount < ingMagnetAmount) ingMagnetAmount = amount;
  }

  const nonIngMagnetIngs = ingredientSet.filter(({ amount }) => amount !== ingMagnetAmount);

  if (nonIngMagnetIngs.length > 0) {
    const prettyString = nonIngMagnetIngs
      .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${getIngredientName(ingredient)}`)
      .join(separator);

    const uniqueIngredients = new Set(nonIngMagnetIngs.map(({ ingredient }) => ingredient.name));
    const otherIngredientCount = TOTAL_NUMBER_OF_INGREDIENTS - uniqueIngredients.size;
    return `${prettyString} and ${MathUtils.round(ingMagnetAmount, 2)} of all ${otherIngredientCount} other ingredients`;
  }

  // All ingredients are magnet ingredients
  return `${MathUtils.round(ingMagnetAmount, 2)} of all ${TOTAL_NUMBER_OF_INGREDIENTS} ingredients`;
}

export function getAllIngredientLists(pokemon: Pokemon, level: number): IngredientSet[][] {
  const result: IngredientSet[][] = [];

  const ing0 = pokemon.ingredient0;
  if (level < 30) {
    result.push([ing0]);
  } else {
    for (const ing30 of pokemon.ingredient30) {
      if (level < 60) {
        result.push([ing0, ing30]);
      } else {
        for (const ing60 of pokemon.ingredient60) {
          result.push([ing0, ing30, ing60]);
        }
      }
    }
  }

  return result;
}

export function calculateAveragePokemonIngredientSet(
  ingredients: IngredientIndexToIntAmount,
  level: number
): IngredientIndexToFloatAmount {
  const ingredientsUnlocked = Math.min(Math.floor(level / 30) + 1, 3);
  const multiplier = 1 / ingredientsUnlocked;
  const dividedIngredients = Float32Array.from(ingredients, (value) => value * multiplier);
  return dividedIngredients;
}

export function updateMaxIngredientBonus(ingredientSets: IngredientSet[], bonus: number): void {
  for (const ingredientSet of ingredientSets) {
    const ingredientName = ingredientSet.ingredient.name;
    const currentBonus = ingredientBonusCache.get(ingredientName);
    if (currentBonus === undefined || currentBonus < bonus) {
      ingredientBonusCache.set(ingredientName, bonus);
    }
  }
}

export function getMaxIngredientBonus(ingredientName: string): number {
  const bonus = ingredientBonusCache.get(ingredientName);
  if (bonus === undefined) {
    logger.error(`Error: Max bonus for ingredient "${ingredientName}" not found.`);
    return 0;
  }
  return bonus;
}
