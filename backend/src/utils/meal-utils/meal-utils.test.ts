import { MealError } from '@src/domain/error/meal/meal-error.js';
import {
  getDefaultMealTimes,
  getMeal,
  getMealRecoveryAmount,
  getMealsForFilter
} from '@src/utils/meal-utils/meal-utils.js';
import { MOCKED_MAIN_SLEEP } from '@src/utils/test-utils/defaults.js';
import { RECIPES, curry, dessert, parseTime, salad } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('getMeal', () => {
  it('shall return Lovely Kiss for lovely_kIsS_smOOthie name', () => {
    expect(getMeal('lovely_kIsS_smOOthie')).toBe(dessert.LOVELY_KISS_SMOOTHIE);
  });

  it("shall throw if Meal can't be found", () => {
    expect(() => getMeal('missing')).toThrow(MealError);
  });
});

describe('getMealsForFilter', () => {
  it('should return curry meals when curry is true', () => {
    expect(
      getMealsForFilter({
        curry: true,
        salad: false,
        dessert: false
      })
    ).toEqual(curry.CURRIES);
  });

  it('should return salad meals when salad is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: true,
        dessert: false
      })
    ).toEqual(salad.SALADS);
  });

  it('should return dessert meals when dessert is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: true
      })
    ).toEqual(dessert.DESSERTS);
  });

  it('should return all meals when no specific filters are applied', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false
      })
    ).toEqual(RECIPES);
  });

  it('shall return all meals above 35% bonus', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        minRecipeBonus: 35
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "DIZZY_PUNCH_SPICY_CURRY",
        "NINJA_CURRY",
        "DREAM_EATER_BUTTER_CURRY",
        "INFERNO_CORN_KEEMA_CURRY",
        "HIDDEN_POWER_PERK_UP_STEW",
        "CUT_SUKIYAKI_CURRY",
        "ROLE_PLAY_PUMPKABOO_STEW",
        "OVERGROW_AVOCADO_GRATIN",
        "CALM_MIND_FRUIT_SALAD",
        "CROSS_CHOP_SALAD",
        "GREENGRASS_SALAD",
        "NINJA_SALAD",
        "PETAL_BLIZZARD_LAYERED_SALAD",
        "APPLE_ACID_YOGURT_DRESSED_SALAD",
        "DEFIANT_COFFEE_DRESSED_SALAD",
        "LUSCIOUS_AVOCADO_SALAD",
        "BULLDOZE_GUACAMOLE_AND_CHIPS",
        "SCALD_CHUNKY_SALAD",
        "HUGE_POWER_SOY_DONUTS",
        "EXPLOSION_POPCORN",
        "EARLY_BIRD_COFFEE_JELLY",
        "MOLD_BREAKER_CORN_TIRAMISU",
        "JIGGLYPUFFS_FRUITY_FLAN",
        "TEATIME_CORN_SCONES",
        "FLOWER_GIFT_MACARONS",
        "ZING_ZAP_SPICED_COLA",
        "CLODSIRE_ECLAIR",
        "HONEY_GATHER_CHOCOLATE_WAFFLES",
        "SCARY_FACE_PANCAKES",
        "LEAF_TORNADO_SMOOTHIE",
      ]
    `);
  });

  it('shall return all meals below pot limit 57', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        maxPotSize: 57
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "FANCY_APPLE_CURRY",
        "SIMPLE_CHOWDER",
        "MILD_HONEY_CURRY",
        "BEANBURGER_CURRY",
        "HEARTY_CHEESEBURGER_CURRY",
        "DROUGHT_KATSU_CURRY",
        "SOLAR_POWER_TOMATO_CURRY",
        "MELTY_OMELETTE_CURRY",
        "SOFT_POTATO_CHOWDER",
        "BULK_UP_BEAN_CURRY",
        "SPORE_MUSHROOM_CURRY",
        "EGG_BOMB_CURRY",
        "LIMBER_CORN_STEW",
        "DIZZY_PUNCH_SPICY_CURRY",
        "SPICY_LEEK_CURRY",
        "NINJA_CURRY",
        "GRILLED_TAIL_CURRY",
        "DREAM_EATER_BUTTER_CURRY",
        "FANCY_APPLE_SALAD",
        "BEAN_HAM_SALAD",
        "SNOOZY_TOMATO_SALAD",
        "SNOW_CLOAK_CAESAR_SALAD",
        "WATER_VEIL_TOFU_SALAD",
        "HEAT_WAVE_TOFU_SALAD",
        "FURY_ATTACK_CORN_SALAD",
        "DAZZLING_APPLE_CHEESE_SALAD",
        "MOOMOO_CAPRESE_SALAD",
        "IMMUNITY_LEEK_SALAD",
        "SUPERPOWER_EXTREME_SALAD",
        "CONTRARY_CHOCOLATE_MEAT_SALAD",
        "GLUTTONY_POTATO_SALAD",
        "OVERHEAT_GINGER_SALAD",
        "SPORE_MUSHROOM_SALAD",
        "CALM_MIND_FRUIT_SALAD",
        "SLOWPOKE_TAIL_PEPPER_SALAD",
        "CROSS_CHOP_SALAD",
        "NINJA_SALAD",
        "LUSCIOUS_AVOCADO_SALAD",
        "WARM_MOOMOO_MILK",
        "FANCY_APPLE_JUICE",
        "CRAFT_SODA_POP",
        "LUCKY_CHANT_APPLE_PIE",
        "FLUFFY_SWEET_POTATOES",
        "EMBER_GINGER_TEA",
        "CLOUD_NINE_SOY_CAKE",
        "STALWART_VEGETABLE_JUICE",
        "BIG_MALASADA",
        "HUSTLE_PROTEIN_SMOOTHIE",
        "HUGE_POWER_SOY_DONUTS",
        "SWEET_SCENT_CHOCOLATE_CAKE",
        "PETAL_DANCE_CHOCOLATE_TART",
        "LOVELY_KISS_SMOOTHIE",
        "STEADFAST_GINGER_COOKIES",
        "NEROLIS_RESTORATIVE_TEA",
        "EXPLOSION_POPCORN",
        "EARLY_BIRD_COFFEE_JELLY",
        "MOLD_BREAKER_CORN_TIRAMISU",
        "JIGGLYPUFFS_FRUITY_FLAN",
        "LEAF_TORNADO_SMOOTHIE",
      ]
    `);
  });
});

describe('getDefaultMealTimes', () => {
  it('shall return default meal times late in each window', () => {
    const mealTimes = getDefaultMealTimes(MOCKED_MAIN_SLEEP);
    expect(mealTimes).toEqual({
      meals: {
        breakfast: parseTime('11:59'),
        lunch: parseTime('17:59'),
        dinner: parseTime('21:29')
      },
      sorted: [parseTime('11:59'), parseTime('17:59'), parseTime('21:29')]
    });
  });

  it('shall skip dinner if we go to sleep at dinner time', () => {
    const mealTimes = getDefaultMealTimes({
      start: parseTime('06:00'),
      end: parseTime('18:00')
    });

    expect(mealTimes).toEqual({
      meals: {
        breakfast: parseTime('11:59'),
        lunch: parseTime('17:59')
      },
      sorted: [parseTime('11:59'), parseTime('17:59')]
    });
  });

  it('shall work with night schedule', () => {
    const mealTimes = getDefaultMealTimes({
      start: parseTime('17:00'),
      end: parseTime('05:00')
    });
    expect(mealTimes).toEqual({
      meals: {
        breakfast: parseTime('04:59'),
        lunch: parseTime('17:59'),
        dinner: parseTime('03:59')
      },
      sorted: [parseTime('17:59'), parseTime('03:59'), parseTime('04:59')]
    });
  });
});

describe('getMealRecoveryAmount', () => {
  it('shall return 1 for 81 <= currentEnergy', () => {
    expect(getMealRecoveryAmount(81)).toBe(1);
    expect(getMealRecoveryAmount(99)).toBe(1);
    expect(getMealRecoveryAmount(150)).toBe(1);
  });

  it('shall return 2 for 71 <= currentEnergy < 81', () => {
    expect(getMealRecoveryAmount(71)).toBe(2);
    expect(getMealRecoveryAmount(80)).toBe(2);
  });

  it('shall return 3 for 61 <= currentEnergy < 71', () => {
    expect(getMealRecoveryAmount(61)).toBe(3);
    expect(getMealRecoveryAmount(70)).toBe(3);
  });

  it('shall return 4 for 51 <= currentEnergy < 61', () => {
    expect(getMealRecoveryAmount(51)).toBe(4);
    expect(getMealRecoveryAmount(60)).toBe(4);
  });

  it('shall return 5 for 41 <= currentEnergy < 51', () => {
    expect(getMealRecoveryAmount(41)).toBe(5);
    expect(getMealRecoveryAmount(50)).toBe(5);
  });

  it('shall return 6 for 31 <= currentEnergy < 41', () => {
    expect(getMealRecoveryAmount(31)).toBe(6);
    expect(getMealRecoveryAmount(40)).toBe(6);
  });

  it('shall return 7 for 21 <= currentEnergy < 31', () => {
    expect(getMealRecoveryAmount(21)).toBe(7);
    expect(getMealRecoveryAmount(30)).toBe(7);
  });

  it('shall return 8 for 11 <= currentEnergy < 21', () => {
    expect(getMealRecoveryAmount(11)).toBe(8);
    expect(getMealRecoveryAmount(20)).toBe(8);
  });

  it('shall return 9 for currentEnergy < 11', () => {
    expect(getMealRecoveryAmount(10)).toBe(9);
    expect(getMealRecoveryAmount(0)).toBe(9);
  });
});
