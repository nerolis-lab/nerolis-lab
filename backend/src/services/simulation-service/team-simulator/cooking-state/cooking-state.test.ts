import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import {
  defaultMealPlan,
  dessert,
  emptyIngredientInventoryFloat,
  ingredient,
  ingredientSetToFloatFlat,
  MAX_POT_SIZE,
  parseTime,
  recipeLevelBonus
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

function noCritRandom(): PreGeneratedRandom {
  const rng = (() => 0.99) as PreGeneratedRandom;
  rng.getUint8 = () => 255;
  rng.getIndex = () => 0;
  rng.randomElement = <T>(array: T[]) => array[0];
  return rng;
}

describe('CookingState', () => {
  it('shall include average cooked meal times in results', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.recordMealCookTime('breakfast', 120);
    cookingState.recordMealCookTime('lunch', 480);
    cookingState.recordMealCookTime('dinner', 840);

    const result = cookingState.results(1);

    expect(result.mealTimes).toEqual({
      breakfast: parseTime('08:00'),
      lunch: parseTime('14:00'),
      dinner: parseTime('20:00')
    });
  });

  it('shall cook the best recipe for which it has ingredients', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    const ingsForMacaronsAndFlan = ingredientSetToFloatFlat([
      ...dessert.JIGGLYPUFFS_FRUITY_FLAN.ingredients,
      ...dessert.FLOWER_GIFT_MACARONS.ingredients
    ]);
    cookingState.addIngredients(ingsForMacaronsAndFlan);

    cookingState.cook(false);

    const result = cookingState.results(1);

    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
      [
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });

  it('shall fallback to mixed meal if team cant cook', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_JUICE",
]
`);
    expect(result.curry.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_CURRY",
]
`);
    expect(result.salad.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_SALAD",
]
`);
  });

  it('shall cook mixed meal if team cant cook better', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }]));

    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.curry.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_CURRY",
]
`);
    expect(result.salad.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_SALAD",
]
`);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_JUICE",
]
`);
  });

  it('shall crit with max bonus on sunday', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FLOWER_GIFT_MACARONS.ingredients));
    cookingState.addCritBonus(0.7);
    cookingState.cook(true);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "FLOWER_GIFT_MACARONS",
]
`);
    expect(result.dessert.weeklyStrength).toEqual(dessert.FLOWER_GIFT_MACARONS.valueMax * 3);
    expect(result.dessert.sundayStrength).toEqual(dessert.FLOWER_GIFT_MACARONS.valueMax * 3);
  });

  it('shall be able to cook macarons with pot skill proc', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FLOWER_GIFT_MACARONS.ingredients));
    cookingState.addPotSize(30);
    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "FLOWER_GIFT_MACARONS",
]
`);
  });
  it('shall reset stockpiles at the start of a new week', () => {
    const initialStockpile = ingredientSetToFloatFlat([
      { amount: 10, ingredient: ingredient.SLOWPOKE_TAIL },
      { amount: 5, ingredient: ingredient.BEAN_SAUSAGE }
    ]);
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true, stockpiledIngredients: initialStockpile }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 5, ingredient: ingredient.SLOWPOKE_TAIL }]));
    cookingState.cook(false);
    cookingState['currentDessertStockpile'] = emptyIngredientInventoryFloat();

    expect(cookingState['currentDessertStockpile']).not.toEqual(initialStockpile);

    cookingState.startNewWeek();

    expect(cookingState['currentDessertStockpile']).toEqual(initialStockpile);
  });

  it('shall cook a planned recipe early and add only unreserved filler value after recipe strength', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        potSize: 20,
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'recipe', recipe: dessert.WARM_MOOMOO_MILK.name },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(
      ingredientSetToFloatFlat([
        ...dessert.WARM_MOOMOO_MILK.ingredients,
        { amount: 5, ingredient: ingredient.SLOWPOKE_TAIL }
      ])
    );

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: false, sunday: false })).toBe(true);

    const result = cookingState.results(1);
    expect(result.dessert.weeklyStrength).toBe(
      dessert.WARM_MOOMOO_MILK.value * recipeLevelBonus[60] + 5 * ingredient.SLOWPOKE_TAIL.value
    );
    expect(result.dessert.cookedRecipes[0].averageFillerValue).toBe(5 * ingredient.SLOWPOKE_TAIL.value);
    expect(result.dessert.cookedRecipes[0].isPlannedRecipe).toBe(true);
    expect(result.dessert.cookedRecipes[0].plannedAttempts).toBe(1);
    expect(result.dessert.cookedRecipes[0].plannedFailures).toBe(0);
  });

  it('records all shortages once at the deadline, including a recipe that never cooks', () => {
    const recipe = dessert.LUCKY_CHANT_APPLE_PIE;
    const state = new CookingState(
      mocks.teamSettings({
        potSize: 1,
        recipeType: 'dessert',
        stockpiledIngredients: ingredientSetToFloatFlat([{ ...recipe.ingredients[0], amount: 1 }]),
        mealPlan: {
          breakfast: { kind: 'recipe', recipe: recipe.name },
          lunch: { kind: 'none' },
          dinner: { kind: 'none' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: false, sunday: false });
    expect(state.results(1).dessert.cookedRecipes).toEqual([]);
    state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false });
    state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false });
    const result = state.results(1).dessert.cookedRecipes.find((entry) => entry.recipe.name === recipe.name)!;
    expect(result.count).toBe(0);
    expect(result.plannedAttempts).toBe(1);
    expect(result.plannedFailures).toBe(1);
    expect(result.totalSkipped).toBe(1);
    expect(result.averageFillerValue).toBe(0);
    expect(result.potLimited).toEqual({ count: 1, averageMissing: recipe.nrOfIngredients - 1 });
    expect(result.ingredientLimited).toEqual(
      expect.arrayContaining(
        recipe.ingredients.map((entry, index) => ({
          ingredientName: entry.ingredient.name,
          count: 1,
          averageMissing: entry.amount - (index === 0 ? 1 : 0)
        }))
      )
    );
  });

  it('combines automatic weekday skips with failed Sunday planned attempts', () => {
    const recipe = dessert.CRAFT_SODA_POP;
    const state = new CookingState(
      mocks.teamSettings({
        potSize: 100,
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: recipe.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    state.cook(false);
    state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: true });
    const result = state.results(7).dessert.cookedRecipes.find((entry) => entry.recipe.name === recipe.name)!;
    expect(result.plannedAttempts).toBe(1);
    expect(result.plannedFailures).toBe(1);
    expect(result.totalSkipped).toBe(2);
    expect(result.ingredientLimited).toEqual([{ ingredientName: ingredient.HONEY.name, count: 2, averageMissing: 9 }]);
  });

  it('shall use the Sunday meal plan only on Sunday', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: dessert.WARM_MOOMOO_MILK.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );

    expect(cookingState.hasMealPlan(false)).toBe(false);
    expect(cookingState.hasMealPlan(true)).toBe(true);
  });

  it.each([false, true])(
    'cooks the same planned recipe all week despite Sunday reservations (deadline: %s)',
    (finalAttempt) => {
      const recipe = dessert.FANCY_APPLE_JUICE;
      const dailyPlan = {
        breakfast: { kind: 'recipe' as const, recipe: recipe.name },
        lunch: { kind: 'recipe' as const, recipe: recipe.name },
        dinner: { kind: 'recipe' as const, recipe: recipe.name }
      };
      const state = new CookingState(
        mocks.teamSettings({
          recipeType: 'dessert',
          mealPlan: { ...dailyPlan, sunday: { ...dailyPlan } }
        }),
        defaultUserRecipes(),
        noCritRandom()
      );

      for (let day = 0; day < 7; day++) {
        state.startNewDay();
        for (const meal of ['breakfast', 'lunch', 'dinner'] as const) {
          // Only enough for this meal, never enough to cover Sunday's three meals too.
          state.addIngredients(ingredientSetToFloatFlat(recipe.ingredients));
          expect(state.cookPlannedMeal({ meal, finalAttempt, sunday: day === 6 })).toBe(true);
        }
      }

      const results = state.results(7).dessert.cookedRecipes;
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        recipe: { name: recipe.name },
        count: 21,
        sunday: 3,
        plannedAttempts: 21,
        plannedFailures: 0,
        totalSkipped: 0
      });
    }
  );

  it('protects Sunday ingredients from fallback when there is no surplus', () => {
    const recipe = dessert.FANCY_APPLE_JUICE;
    const state = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: recipe.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    state.addIngredients(ingredientSetToFloatFlat(recipe.ingredients));
    state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false });
    expect(state.results(1).dessert.cookedRecipes[0].recipe.name).toBe(dessert.MIXED_JUICE.name);
    state.startNewDay();
    expect(state.cookPlannedMeal({ meal: 'breakfast', finalAttempt: false, sunday: true })).toBe(true);
    expect(state.results(7).dessert.cookedRecipes.find((entry) => entry.recipe.name === recipe.name)).toMatchObject({
      count: 1,
      plannedFailures: 0
    });
  });

  it('shall allow weekday Best Recipe meals to use only Sunday ingredient surplus', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: dessert.FANCY_APPLE_JUICE.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 16, ingredient: ingredient.FANCY_APPLE }]));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    expect(cookingState.results(1).dessert.cookedRecipes[0].recipe.name).toBe(dessert.FANCY_APPLE_JUICE.name);
  });

  it('shall not spend ingredients reserved by weekday planned meals on Best Recipe meals', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'best' },
          lunch: { kind: 'recipe', recipe: dessert.FANCY_APPLE_JUICE.name },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 16, ingredient: ingredient.FANCY_APPLE }]));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    expect(cookingState.results(1).dessert.cookedRecipes[0].recipe.name).toBe(dessert.MIXED_JUICE.name);
  });

  it('shall skip None meals without consuming a pot-size bonus', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'none' },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addPotSize(10);

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(false);
    expect(cookingState['bonusPotSize']).toBe(10);
  });

  it('shall exclude ingredients reserved for planned recipes from deadline fallback recipes', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'recipe', recipe: dessert.CRAFT_SODA_POP.name },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FANCY_APPLE_JUICE.ingredients));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    const cookedRecipe = cookingState.results(1).dessert.cookedRecipes[0];
    expect(cookedRecipe.recipe.name).toBe(dessert.FANCY_APPLE_JUICE.name);
    expect(cookedRecipe.averageFillerValue).toBe(0);
    expect(cookedRecipe.isPlannedRecipe).toBe(false);
  });
});
