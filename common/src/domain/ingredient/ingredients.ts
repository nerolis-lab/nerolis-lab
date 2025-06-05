import type { Ingredient } from './ingredient';
import { MathUtils } from '../../utils/math-utils';
import { strengthenIngredientByHalf } from '../../utils/event-utils';

const SLOWPOKE_TAIL_VALUE = 342;

export const FANCY_APPLE: Ingredient = createIngredient({
  name: 'Apple',
  value: 90,
  longName: 'Fancy Apple'
});

export const MOOMOO_MILK: Ingredient = createIngredient({
  name: 'Milk',
  value: 98,
  longName: 'Moomoo Milk'
});

export const GREENGRASS_SOYBEANS: Ingredient = createIngredient({
  name: 'Soybean',
  value: 100,
  longName: 'Greengrass Soybeans'
});

export const HONEY: Ingredient = createIngredient({
  name: 'Honey',
  value: 101,
  longName: 'Honey'
});

export const BEAN_SAUSAGE: Ingredient = createIngredient({
  name: 'Sausage',
  value: 103,
  longName: 'Bean Sausage'
});

export const WARMING_GINGER: Ingredient = createIngredient({
  name: 'Ginger',
  value: 109,
  longName: 'Warming Ginger'
});

export const SNOOZY_TOMATO: Ingredient = createIngredient({
  name: 'Tomato',
  value: 110,
  longName: 'Snoozy Tomato'
});

export const FANCY_EGG: Ingredient = createIngredient({
  name: 'Egg',
  value: 115,
  longName: 'Fancy Egg'
});

export const PURE_OIL: Ingredient = createIngredient({
  name: 'Oil',
  value: 121,
  longName: 'Pure Oil'
});

export const SOFT_POTATO: Ingredient = createIngredient({
  name: 'Potato',
  value: 124,
  longName: 'Soft Potato'
});

export const FIERY_HERB: Ingredient = createIngredient({
  name: 'Herb',
  value: 130,
  longName: 'Fiery Herb'
});

export const GREENGRASS_CORN: Ingredient = createIngredient({
  name: 'Corn',
  value: 140,
  longName: 'Greengrass Corn'
});

export const SOOTHING_CACAO: Ingredient = createIngredient({
  name: 'Cacao',
  value: 151,
  longName: 'Soothing Cacao'
});

export const ROUSING_COFFEE: Ingredient = createIngredient({
  name: 'Coffee',
  value: 153,
  longName: 'Rousing Coffee'
});

export const TASTY_MUSHROOM: Ingredient = createIngredient({
  name: 'Mushroom',
  value: 167,
  longName: 'Tasty Mushroom'
});

export const LARGE_LEEK: Ingredient = createIngredient({
  name: 'Leek',
  value: 185,
  longName: 'Large Leek'
});

export const SLOWPOKE_TAIL: Ingredient = createIngredient({
  name: 'Tail',
  value: SLOWPOKE_TAIL_VALUE,
  longName: 'Slowpoke Tail'
});

export const INGREDIENTS: Ingredient[] = [
  FANCY_APPLE,
  MOOMOO_MILK,
  GREENGRASS_SOYBEANS,
  HONEY,
  BEAN_SAUSAGE,
  WARMING_GINGER,
  SNOOZY_TOMATO,
  FANCY_EGG,
  PURE_OIL,
  SOFT_POTATO,
  FIERY_HERB,
  GREENGRASS_CORN,
  SOOTHING_CACAO,
  ROUSING_COFFEE,
  TASTY_MUSHROOM,
  LARGE_LEEK,
  SLOWPOKE_TAIL
].map(strengthenIngredientByHalf);

export const TOTAL_NUMBER_OF_INGREDIENTS = INGREDIENTS.length;

export function createIngredient(params: { name: string; value: number; longName: string }): Ingredient {
  const { name, value, longName } = params;
  return {
    name,
    value,
    taxedValue: MathUtils.round(value * (value / SLOWPOKE_TAIL_VALUE), 1),
    longName
  };
}
