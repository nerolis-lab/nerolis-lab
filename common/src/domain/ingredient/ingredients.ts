import type { Ingredient } from './ingredient';

export const FANCY_APPLE: Ingredient = createIngredient({
  name: 'Apple',
  value: 90,
  taxedValue: 23.7,
  longName: 'Fancy Apple'
});

export const MOOMOO_MILK: Ingredient = createIngredient({
  name: 'Milk',
  value: 98,
  taxedValue: 28.1,
  longName: 'Moomoo Milk'
});

export const GREENGRASS_SOYBEANS: Ingredient = createIngredient({
  name: 'Soybean',
  value: 100,
  taxedValue: 29.2,
  longName: 'Greengrass Soybeans'
});

export const HONEY: Ingredient = createIngredient({ name: 'Honey', value: 101, taxedValue: 29.8, longName: 'Honey' });

export const BEAN_SAUSAGE: Ingredient = createIngredient({
  name: 'Sausage',
  value: 103,
  taxedValue: 31,
  longName: 'Bean Sausage'
});

export const WARMING_GINGER: Ingredient = createIngredient({
  name: 'Ginger',
  value: 109,
  taxedValue: 34.7,
  longName: 'Warming Ginger'
});

export const SNOOZY_TOMATO: Ingredient = createIngredient({
  name: 'Tomato',
  value: 110,
  taxedValue: 35.4,
  longName: 'Snoozy Tomato'
});

export const FANCY_EGG: Ingredient = createIngredient({
  name: 'Egg',
  value: 115,
  taxedValue: 38.7,
  longName: 'Fancy Egg'
});

export const PURE_OIL: Ingredient = createIngredient({
  name: 'Oil',
  value: 121,
  taxedValue: 42.8,
  longName: 'Pure Oil'
});

export const SOFT_POTATO: Ingredient = createIngredient({
  name: 'Potato',
  value: 124,
  taxedValue: 45,
  longName: 'Soft Potato'
});

export const FIERY_HERB: Ingredient = createIngredient({
  name: 'Herb',
  value: 130,
  taxedValue: 49.4,
  longName: 'Fiery Herb'
});

export const GREENGRASS_CORN: Ingredient = createIngredient({
  name: 'Corn',
  value: 140,
  taxedValue: 57.3,
  longName: 'Greengrass Corn'
});

export const SOOTHING_CACAO: Ingredient = createIngredient({
  name: 'Cacao',
  value: 151,
  taxedValue: 66.7,
  longName: 'Soothing Cacao'
});

export const ROUSING_COFFEE: Ingredient = createIngredient({
  name: 'Coffee',
  value: 153,
  taxedValue: 68.4,
  longName: 'Rousing Coffee'
});

export const TASTY_MUSHROOM: Ingredient = createIngredient({
  name: 'Mushroom',
  value: 167,
  taxedValue: 81.5,
  longName: 'Tasty Mushroom'
});

export const LARGE_LEEK: Ingredient = createIngredient({
  name: 'Leek',
  value: 185,
  taxedValue: 100.1,
  longName: 'Large Leek'
});

export const SLOWPOKE_TAIL: Ingredient = createIngredient({
  name: 'Tail',
  value: 342,
  taxedValue: 342,
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
];

export const TOTAL_NUMBER_OF_INGREDIENTS = INGREDIENTS.length;

export function createIngredient(params: {
  name: string;
  value: number;
  taxedValue: number;
  longName: string;
}): Ingredient {
  const { name, value, taxedValue, longName } = params;
  return {
    name,
    value,
    taxedValue,
    longName
  };
}
