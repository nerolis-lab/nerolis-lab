import { createCurry, recipesToFlat } from '../../utils/recipe-utils/recipe-utils';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GLOSSY_AVOCADO,
  GREENGRASS_CORN,
  GREENGRASS_SOYBEANS,
  HONEY,
  LARGE_LEEK,
  MOOMOO_MILK,
  PLUMP_PUMPKIN,
  PURE_OIL,
  ROUSING_COFFEE,
  SLOWPOKE_TAIL,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER
} from '../ingredient/ingredients';
import type { Recipe, RecipeFlat } from './recipe';

export const MIXED_CURRY = createCurry({
  name: 'MIXED_CURRY',
  displayName: 'Mixed Curry',
  ingredients: [],
  bonus: 0
});

export const FANCY_APPLE_CURRY = createCurry({
  name: 'FANCY_APPLE_CURRY',
  displayName: 'Fancy Apple Curry',
  ingredients: [{ amount: 7, ingredient: FANCY_APPLE }],
  bonus: 18.7
});

export const SIMPLE_CHOWDER = createCurry({
  name: 'SIMPLE_CHOWDER',
  displayName: 'Simple Chowder',
  ingredients: [{ amount: 7, ingredient: MOOMOO_MILK }],
  bonus: 18.7
});

export const MILD_HONEY_CURRY = createCurry({
  name: 'MILD_HONEY_CURRY',
  displayName: 'Mild Honey Curry',
  ingredients: [{ amount: 7, ingredient: HONEY }],
  bonus: 18.7
});

export const BEANBURGER_CURRY = createCurry({
  name: 'BEANBURGER_CURRY',
  displayName: 'Beanburger Curry',
  ingredients: [{ amount: 7, ingredient: BEAN_SAUSAGE }],
  bonus: 18.7
});

export const HEARTY_CHEESEBURGER_CURRY = createCurry({
  name: 'HEARTY_CHEESEBURGER_CURRY',
  displayName: 'Hearty Cheeseburger Curry',
  ingredients: [
    { amount: 8, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: BEAN_SAUSAGE }
  ],
  bonus: 18.77
});

export const DROUGHT_KATSU_CURRY = createCurry({
  name: 'DROUGHT_KATSU_CURRY',
  displayName: '"Drought" Katsu Curry',
  ingredients: [
    { amount: 10, ingredient: BEAN_SAUSAGE },
    { amount: 5, ingredient: PURE_OIL }
  ],
  bonus: 18.77
});

export const SOLAR_POWER_TOMATO_CURRY = createCurry({
  name: 'SOLAR_POWER_TOMATO_CURRY',
  displayName: '"Solar Power" Tomato Curry',
  ingredients: [
    { amount: 10, ingredient: SNOOZY_TOMATO },
    { amount: 5, ingredient: FIERY_HERB }
  ],
  bonus: 18.77
});

export const MELTY_OMELETTE_CURRY = createCurry({
  name: 'MELTY_OMELETTE_CURRY',
  displayName: 'Melty Omelette Curry',
  ingredients: [
    { amount: 10, ingredient: FANCY_EGG },
    { amount: 6, ingredient: SNOOZY_TOMATO }
  ],
  bonus: 18.77
});

export const SOFT_POTATO_CHOWDER = createCurry({
  name: 'SOFT_POTATO_CHOWDER',
  displayName: 'Soft Potato Chowder',
  ingredients: [
    { amount: 10, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: SOFT_POTATO },
    { amount: 4, ingredient: TASTY_MUSHROOM }
  ],
  bonus: 20.51
});

export const BULK_UP_BEAN_CURRY = createCurry({
  name: 'BULK_UP_BEAN_CURRY',
  displayName: '"Bulk Up" Bean Curry',
  ingredients: [
    { amount: 12, ingredient: GREENGRASS_SOYBEANS },
    { amount: 6, ingredient: BEAN_SAUSAGE },
    { amount: 4, ingredient: FIERY_HERB },
    { amount: 4, ingredient: FANCY_EGG }
  ],
  bonus: 20.51
});

export const SPORE_MUSHROOM_CURRY = createCurry({
  name: 'SPORE_MUSHROOM_CURRY',
  displayName: '"Spore" Mushroom Curry',
  ingredients: [
    { amount: 14, ingredient: TASTY_MUSHROOM },
    { amount: 9, ingredient: SOFT_POTATO }
  ],
  bonus: 20.51
});

export const EGG_BOMB_CURRY = createCurry({
  name: 'EGG_BOMB_CURRY',
  displayName: '"Egg Bomb" Curry',
  ingredients: [
    { amount: 12, ingredient: HONEY },
    { amount: 11, ingredient: FANCY_APPLE },
    { amount: 8, ingredient: FANCY_EGG },
    { amount: 4, ingredient: SOFT_POTATO }
  ],
  bonus: 25
});

export const LIMBER_CORN_STEW = createCurry({
  name: 'LIMBER_CORN_STEW',
  displayName: '"Limber" Corn Stew',
  ingredients: [
    { amount: 14, ingredient: GREENGRASS_CORN },
    { amount: 8, ingredient: MOOMOO_MILK },
    { amount: 8, ingredient: SOFT_POTATO }
  ],
  bonus: 25
});

export const DIZZY_PUNCH_SPICY_CURRY = createCurry({
  name: 'DIZZY_PUNCH_SPICY_CURRY',
  displayName: '"Dizzy Punch" Spicy Curry',
  ingredients: [
    { amount: 11, ingredient: ROUSING_COFFEE },
    { amount: 11, ingredient: FIERY_HERB },
    { amount: 11, ingredient: HONEY }
  ],
  bonus: 35
});

export const SPICY_LEEK_CURRY = createCurry({
  name: 'SPICY_LEEK_CURRY',
  displayName: 'Spicy Leek Curry',
  ingredients: [
    { amount: 14, ingredient: LARGE_LEEK },
    { amount: 10, ingredient: WARMING_GINGER },
    { amount: 8, ingredient: FIERY_HERB }
  ],
  bonus: 25
});

export const NINJA_CURRY = createCurry({
  name: 'NINJA_CURRY',
  displayName: 'Ninja Curry',
  ingredients: [
    { amount: 24, ingredient: GREENGRASS_SOYBEANS },
    { amount: 9, ingredient: BEAN_SAUSAGE },
    { amount: 12, ingredient: LARGE_LEEK },
    { amount: 5, ingredient: TASTY_MUSHROOM }
  ],
  bonus: 48
});

export const GRILLED_TAIL_CURRY = createCurry({
  name: 'GRILLED_TAIL_CURRY',
  displayName: 'Grilled Tail Curry',
  ingredients: [
    { amount: 8, ingredient: SLOWPOKE_TAIL },
    { amount: 25, ingredient: FIERY_HERB }
  ],
  bonus: 25
});

export const DREAM_EATER_BUTTER_CURRY = createCurry({
  name: 'DREAM_EATER_BUTTER_CURRY',
  displayName: '"Dream Eater" Butter Curry',
  ingredients: [
    { amount: 18, ingredient: SOFT_POTATO },
    { amount: 15, ingredient: SNOOZY_TOMATO },
    { amount: 12, ingredient: SOOTHING_CACAO },
    { amount: 10, ingredient: MOOMOO_MILK }
  ],
  bonus: 35
});

export const INFERNO_CORN_KEEMA_CURRY = createCurry({
  name: 'INFERNO_CORN_KEEMA_CURRY',
  displayName: '"Inferno" Corn Keema Curry',
  ingredients: [
    { amount: 27, ingredient: FIERY_HERB },
    { amount: 24, ingredient: BEAN_SAUSAGE },
    { amount: 14, ingredient: GREENGRASS_CORN },
    { amount: 12, ingredient: WARMING_GINGER }
  ],
  bonus: 48
});

export const HIDDEN_POWER_PERK_UP_STEW = createCurry({
  name: 'HIDDEN_POWER_PERK_UP_STEW',
  displayName: '"Hidden Power" Perk-Up Stew',
  ingredients: [
    { amount: 28, ingredient: GREENGRASS_SOYBEANS },
    { amount: 25, ingredient: SNOOZY_TOMATO },
    { amount: 23, ingredient: TASTY_MUSHROOM },
    { amount: 16, ingredient: ROUSING_COFFEE }
  ],
  bonus: 61
});

export const CUT_SUKIYAKI_CURRY = createCurry({
  name: 'CUT_SUKIYAKI_CURRY',
  displayName: '"Cut" Sukiyaki Curry',
  ingredients: [
    { amount: 27, ingredient: LARGE_LEEK },
    { amount: 26, ingredient: BEAN_SAUSAGE },
    { amount: 26, ingredient: HONEY },
    { amount: 22, ingredient: FANCY_EGG }
  ],
  bonus: 61
});

export const ROLE_PLAY_PUMPKABOO_STEW = createCurry({
  name: 'ROLE_PLAY_PUMPKABOO_STEW',
  displayName: '"Role Play" Pumpkaboo Stew',
  ingredients: [
    { amount: 10, ingredient: PLUMP_PUMPKIN },
    { amount: 16, ingredient: BEAN_SAUSAGE },
    { amount: 18, ingredient: SOFT_POTATO },
    { amount: 25, ingredient: TASTY_MUSHROOM }
  ],
  bonus: 48
});

export const OVERGROW_AVOCADO_GRATIN = createCurry({
  name: 'OVERGROW_AVOCADO_GRATIN',
  displayName: '"Overgrow" Avocado Gratin',
  ingredients: [
    { amount: 22, ingredient: GLOSSY_AVOCADO },
    { amount: 20, ingredient: SOFT_POTATO },
    { amount: 41, ingredient: MOOMOO_MILK },
    { amount: 32, ingredient: PURE_OIL }
  ],
  bonus: 78
});

export const CURRIES: Recipe[] = [
  FANCY_APPLE_CURRY,
  SIMPLE_CHOWDER,
  MILD_HONEY_CURRY,
  BEANBURGER_CURRY,
  HEARTY_CHEESEBURGER_CURRY,
  DROUGHT_KATSU_CURRY,
  SOLAR_POWER_TOMATO_CURRY,
  MELTY_OMELETTE_CURRY,
  SOFT_POTATO_CHOWDER,
  BULK_UP_BEAN_CURRY,
  SPORE_MUSHROOM_CURRY,
  EGG_BOMB_CURRY,
  LIMBER_CORN_STEW,
  DIZZY_PUNCH_SPICY_CURRY,
  SPICY_LEEK_CURRY,
  NINJA_CURRY,
  GRILLED_TAIL_CURRY,
  DREAM_EATER_BUTTER_CURRY,
  INFERNO_CORN_KEEMA_CURRY,
  HIDDEN_POWER_PERK_UP_STEW,
  CUT_SUKIYAKI_CURRY,
  ROLE_PLAY_PUMPKABOO_STEW,
  OVERGROW_AVOCADO_GRATIN
];

export const MIXED_CURRY_FLAT: RecipeFlat = recipesToFlat(MIXED_CURRY);
export const CURRIES_FLAT: RecipeFlat[] = recipesToFlat(CURRIES);
