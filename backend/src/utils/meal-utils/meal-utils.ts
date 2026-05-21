import { MealError } from '@src/domain/error/meal/meal-error.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { MealTimes, Recipe, Time, TimePeriod } from 'sleepapi-common';
import { parseTime, RECIPES } from 'sleepapi-common';

export function getMeal(name: string) {
  const meal: Recipe | undefined = RECIPES.find((meal) => meal.name === name.toUpperCase());
  if (!meal) {
    throw new MealError("Couldn't find meal with name: " + name.toUpperCase());
  }
  return meal;
}

export function getMealsForFilter(params: {
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  minRecipeBonus?: number;
  maxPotSize?: number;
}) {
  const { curry = false, salad = false, dessert = false, minRecipeBonus = 0, maxPotSize } = params;
  let recipes = RECIPES;

  if (curry || salad || dessert) {
    recipes = recipes.filter(
      (meal) =>
        (meal.type === 'curry' && curry) || (meal.type === 'salad' && salad) || (meal.type === 'dessert' && dessert)
    );
  }
  const recipesWithBonus = recipes.filter((m) => m.bonus >= minRecipeBonus);

  return maxPotSize ? recipesWithBonus.filter((m) => m.nrOfIngredients <= maxPotSize) : recipesWithBonus;
}

export function getDefaultMealTimes(dayPeriod: TimePeriod): { meals: MealTimes; sorted: Time[] } {
  const breakfastWindow: TimePeriod = {
    start: parseTime('04:00'),
    end: parseTime('12:00')
  };
  const lunchWindow: TimePeriod = {
    start: parseTime('12:00'),
    end: parseTime('18:00')
  };
  const dinnerWindow: TimePeriod = {
    start: parseTime('18:00'),
    end: parseTime('04:00')
  };

  const mealTimes: Time[] = [];

  const latestBreakfastTime = TimeUtils.getLatestMinuteInOverlap(breakfastWindow, dayPeriod);
  const latestLunchTime = TimeUtils.getLatestMinuteInOverlap(lunchWindow, dayPeriod);
  const latestDinnerTime = TimeUtils.getLatestMinuteInOverlap(dinnerWindow, dayPeriod);

  if (latestBreakfastTime) {
    mealTimes.push(latestBreakfastTime);
  }
  if (latestLunchTime) {
    mealTimes.push(latestLunchTime);
  }
  if (latestDinnerTime) {
    mealTimes.push(latestDinnerTime);
  }

  return {
    meals: {
      breakfast: latestBreakfastTime,
      lunch: latestLunchTime,
      dinner: latestDinnerTime
    },
    sorted: mealTimes.sort((a, b) => TimeUtils.sortTimesForPeriod(a, b, dayPeriod))
  };
}

export function getMealRecoveryAmount(currentEnergy: number) {
  if (currentEnergy >= 81) {
    return 1;
  } else if (currentEnergy >= 71) {
    return 2;
  } else if (currentEnergy >= 61) {
    return 3;
  } else if (currentEnergy >= 51) {
    return 4;
  } else if (currentEnergy >= 41) {
    return 5;
  } else if (currentEnergy >= 31) {
    return 6;
  } else if (currentEnergy >= 21) {
    return 7;
  } else if (currentEnergy >= 11) {
    return 8;
  } else {
    return 9;
  }
}
