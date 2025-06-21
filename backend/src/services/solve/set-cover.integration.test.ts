import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  ProducersByIngredientIndex,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { mocks } from '@src/vitest/index.js';
import { commonMocks, ingredient, ingredientSetToIntFlat } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('Set Cover Integration', () => {
  it('should purge sub-optimal solutions when smaller team is found', () => {
    const { ingredientProducers, producersByIngredientIndex } = setupGreengrassProducers();

    const cachedSubRecipeSolves = new Map();
    const setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

    const maxTeamSize = 5;
    const mockedGreengrassSalad = [
      // Recipe: 22 Oil, 17 Corn, 14 Tomato, 9 Potato
      commonMocks.mockIngredientSet({ amount: 22, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 17, ingredient: ingredient.GREENGRASS_CORN }),
      commonMocks.mockIngredientSet({ amount: 14, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 9, ingredient: ingredient.SOFT_POTATO })
    ];
    const recipe = ingredientSetToIntFlat(mockedGreengrassSalad);

    const solutions = setCover.solveRecipe(recipe, maxTeamSize);

    expect(solutions.exhaustive).toBe(true);
    const firstTeam = solutions.teams[0];

    expect(firstTeam.members).toHaveLength(3); // team requires three members
  });
});

function setupGreengrassProducers(): {
  ingredientProducers: SetCoverPokemonSetupWithSettings[];
  producersByIngredientIndex: ProducersByIngredientIndex;
} {
  const ingredientProducers: SetCoverPokemonSetupWithSettings[] = [];
  const producersByIngredientIndex: Array<Array<number>> = Array.from(
    { length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS },
    () => []
  );

  // [
  //   "DRAGONITE 32 Oil, 28 Herb",
  //   "DRAGONITE 32 Oil, 8 Herb, 16 Corn",
  //   "CRAMORANT 29 Oil",
  //   "CRAMORANT 19 Oil, 8 Potato",
  //   "CRAMORANT 15 Oil, 15 Potato",
  //   "CRAMORANT 17 Egg, 15 Oil",
  //   "CRAMORANT 4 Oil, 23 Potato",
  //   "CRAMORANT 17 Egg, 4 Oil, 8 Potato"
  // ]
  // OIL - index 8
  const dragoniteAAC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 32, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 28, ingredient: ingredient.FIERY_HERB })
    ])
  });
  const dragoniteABC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 8, ingredient: ingredient.FIERY_HERB }),
      commonMocks.mockIngredientSet({ amount: 16, ingredient: ingredient.GREENGRASS_CORN }),
      commonMocks.mockIngredientSet({ amount: 32, ingredient: ingredient.PURE_OIL })
    ])
  });
  const cramorantAAA: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 29, ingredient: ingredient.PURE_OIL })
    ])
  });
  const cramorantABA: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 19, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 8, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantAAB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 15, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 15, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantAAC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 17, ingredient: ingredient.FANCY_EGG }),
      commonMocks.mockIngredientSet({ amount: 15, ingredient: ingredient.PURE_OIL })
    ])
  });
  const cramorantABB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 4, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const cramorantABC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'CRAMORANT',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 17, ingredient: ingredient.FANCY_EGG }),
      commonMocks.mockIngredientSet({ amount: 4, ingredient: ingredient.PURE_OIL }),
      commonMocks.mockIngredientSet({ amount: 8, ingredient: ingredient.SOFT_POTATO })
    ])
  });

  ingredientProducers.push(
    ...[dragoniteAAC, dragoniteABC, cramorantAAA, cramorantABA, cramorantAAB, cramorantAAC, cramorantABB, cramorantABC]
  );
  producersByIngredientIndex[8] = [0, 1, 2, 3, 4, 5, 6, 7];

  // [
  //   "DRAGONITE 8 Herb, 44 Corn",
  //   "DRAGONITE 28 Herb, 28 Corn",
  //   "DRAGONITE 36 Herb, 16 Corn",
  //   "DRAGONITE 32 Oil, 8 Herb, 16 Corn"
  // ]
  // CORN - index 11
  const dragoniteABB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 8, ingredient: ingredient.FIERY_HERB }),
      commonMocks.mockIngredientSet({ amount: 44, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });
  const dragoniteAAB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 28, ingredient: ingredient.FIERY_HERB }),
      commonMocks.mockIngredientSet({ amount: 28, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });
  const dragoniteABA: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'DRAGONITE',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 36, ingredient: ingredient.FIERY_HERB }),
      commonMocks.mockIngredientSet({ amount: 16, ingredient: ingredient.GREENGRASS_CORN })
    ])
  });

  ingredientProducers.push(...[dragoniteABB, dragoniteAAB, dragoniteABA]);
  producersByIngredientIndex[11] = [8, 9, 10, 1];

  // [
  //   "VICTREEBEL 47 Tomato",
  //   "VICTREEBEL 30 Tomato, 13 Potato",
  //   "VICTREEBEL 23 Tomato, 20 Potato",
  //   "VICTREEBEL 23 Tomato, 13 Leek",
  //   "VICTREEBEL 7 Tomato, 34 Potato",
  //   "VICTREEBEL 7 Tomato, 13 Potato, 13 Leek"
  // ]
  // TOMATO - index 6
  const victreebelAAA: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 47, ingredient: ingredient.SNOOZY_TOMATO })
    ])
  });
  const victreebelABA: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 13, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelAAB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 20, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelAAC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 23, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 13, ingredient: ingredient.LARGE_LEEK })
    ])
  });
  const victreebelABB: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 7, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 33, ingredient: ingredient.SOFT_POTATO })
    ])
  });
  const victreebelABC: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
    pokemonSet: {
      pokemon: 'VICTREEBEL',
      ingredients: ingredientSetToIntFlat([])
    },
    totalIngredients: ingredientSetToIntFlat([
      commonMocks.mockIngredientSet({ amount: 7, ingredient: ingredient.SNOOZY_TOMATO }),
      commonMocks.mockIngredientSet({ amount: 13, ingredient: ingredient.SOFT_POTATO }),
      commonMocks.mockIngredientSet({ amount: 13, ingredient: ingredient.LARGE_LEEK })
    ])
  });

  ingredientProducers.push(
    ...[victreebelAAA, victreebelABA, victreebelAAB, victreebelAAC, victreebelABB, victreebelABC]
  );
  producersByIngredientIndex[6] = [11, 12, 13, 14, 15, 16];

  // [
  //   "VICTREEBEL 7 Tomato, 34 Potato",
  //   "CRAMORANT 4 Oil, 23 Potato",
  //   "VICTREEBEL 23 Tomato, 20 Potato",
  //   "CRAMORANT 15 Oil, 15 Potato",
  //   "VICTREEBEL 30 Tomato, 13 Potato",
  //   "VICTREEBEL 7 Tomato, 13 Potato, 13 Leek",
  //   "CRAMORANT 19 Oil, 8 Potato",
  //   "CRAMORANT 17 Egg, 4 Oil, 8 Potato"
  // ]
  // SOFT_POTATO - index 9
  producersByIngredientIndex[9] = [15, 6, 13, 4, 12, 16, 3, 7];

  return { ingredientProducers, producersByIngredientIndex };
}
