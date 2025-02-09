import type { Ingredient } from './ingredient';

export const FANCY_APPLE: Ingredient = createIngredient('Apple', 90, 23.7, 'Fancy Apple');

export const MOOMOO_MILK: Ingredient = createIngredient('Milk', 98, 28.1, 'Moomoo Milk');

export const GREENGRASS_SOYBEANS: Ingredient = createIngredient('Soybean', 100, 29.2, 'Greengrass Soybeans');

export const HONEY: Ingredient = createIngredient('Honey', 101, 29.8, 'Honey');

export const BEAN_SAUSAGE: Ingredient = createIngredient('Sausage', 103, 31, 'Bean Sausage');

export const WARMING_GINGER: Ingredient = createIngredient('Ginger', 109, 34.7, 'Warming Ginger');

export const SNOOZY_TOMATO: Ingredient = createIngredient('Tomato', 110, 35.4, 'Snoozy Tomato');

export const FANCY_EGG: Ingredient = createIngredient('Egg', 115, 38.7, 'Fancy Egg');

export const PURE_OIL: Ingredient = createIngredient('Oil', 121, 42.8, 'Pure Oil');

export const SOFT_POTATO: Ingredient = createIngredient('Potato', 124, 45, 'Soft Potato');

export const FIERY_HERB: Ingredient = createIngredient('Herb', 130, 49.4, 'Fiery Herb');

export const GREENGRASS_CORN: Ingredient = createIngredient('Corn', 140, 57.3, 'Greengrass Corn');

export const SOOTHING_CACAO: Ingredient = createIngredient('Cacao', 151, 66.7, 'Soothing Cacao');

export const ROUSING_COFFEE: Ingredient = createIngredient('Coffee', 153, 68.4, 'Rousing Coffee');

export const TASTY_MUSHROOM: Ingredient = createIngredient('Mushroom', 167, 81.5, 'Tasty Mushroom');

export const LARGE_LEEK: Ingredient = createIngredient('Leek', 185, 100.1, 'Large Leek');

export const SLOWPOKE_TAIL: Ingredient = createIngredient('Tail', 342, 342, 'Slowpoke Tail');

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

export function createIngredient(name: string, value: number, taxedValue: number, longName: string): Ingredient {
  return {
    name,
    value,
    taxedValue,
    longName
  };
}
