import { curry, dessert, salad, type CookingResult } from 'sleepapi-common'

export function mockCookingResult(attrs?: Partial<CookingResult>): CookingResult {
  return {
    curry: {
      weeklyStrength: 1000,
      sundayStrength: 100,
      cookedRecipes: [
        {
          recipe: curry.INFERNO_CORN_KEEMA_CURRY,
          level: 1,
          count: 1,
          sunday: 0,
          totalSkipped: 0,
          potLimited: { averageMissing: 0, count: 0 },
          ingredientLimited: []
        }
      ]
    },
    salad: {
      weeklyStrength: 1000,
      sundayStrength: 100,
      cookedRecipes: [
        {
          recipe: salad.GREENGRASS_SALAD,
          level: 1,
          count: 1,
          sunday: 0,
          totalSkipped: 0,
          potLimited: { averageMissing: 0, count: 0 },
          ingredientLimited: []
        }
      ]
    },
    dessert: {
      weeklyStrength: 1000,
      sundayStrength: 100,
      cookedRecipes: [
        {
          recipe: dessert.FLOWER_GIFT_MACARONS,
          level: 1,
          count: 1,
          sunday: 0,
          totalSkipped: 0,
          potLimited: { averageMissing: 0, count: 0 },
          ingredientLimited: []
        }
      ]
    },
    critInfo: {
      averageWeekdayPotSize: 10,
      averageCritChancePerCook: 20,
      averageCritMultiplierPerCook: 1.2
    },
    mealTimes: {
      breakfast: {
        hour: 8,
        minute: 0,
        second: 0
      },
      lunch: {
        hour: 12,
        minute: 0,
        second: 0
      },
      dinner: {
        hour: 18,
        minute: 0,
        second: 0
      }
    },
    ...attrs
  }
}
