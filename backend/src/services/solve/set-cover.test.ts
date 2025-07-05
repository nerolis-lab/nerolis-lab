import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  ProducersByIngredientIndex,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { RecipeSolutions, SubRecipeMeta } from '@src/services/solve/types/solution-types.js';
import * as setCoverUtils from '@src/services/solve/utils/set-cover-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { IngredientIndexToIntAmount, IngredientSet } from 'sleepapi-common';
import { commonMocks, ingredient, ingredientSetToIntFlat } from 'sleepapi-common';
import { vimic } from 'vimic';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SetCover', () => {
  let setCover: SetCover;
  let ingredientProducers: SetCoverPokemonSetupWithSettings[];
  let producersByIngredientIndex: ProducersByIngredientIndex;
  let cachedSubRecipeSolves: Map<number, RecipeSolutions>;
  let recipeWithSpotsLeft: IngredientIndexToIntAmount;
  const memoKey = 123;

  let mockedCornKeema: IngredientSet[];

  beforeEach(() => {
    mockedCornKeema = [
      commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
      commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE }),
      commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN }),
      commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB })
    ];

    recipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);

    ingredientProducers = [];
    producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
    cachedSubRecipeSolves = new Map();

    setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);
  });

  describe('solveRecipe', () => {
    let mockedKeyCall: Mock<typeof setCoverUtils.createMemoKey>;
    let recipe: Int16Array;

    beforeEach(() => {
      mockedKeyCall = vimic(setCoverUtils, 'createMemoKey', () => memoKey);
      recipe = recipeWithSpotsLeft.slice(0, ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
    });

    it('should return cached solutions if available', () => {
      recipe[0] = 5;
      const maxTeamSize = 3;
      ingredientProducers.push(mocks.setCoverPokemonWithSettings());

      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const cachedSolutions: RecipeSolutions = [[0]];
      cachedSubRecipeSolves.set(memoKey, cachedSolutions);

      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].members).toHaveLength(1);
      expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual('MOCKEMON');

      expect(mockedKeyCall).toHaveBeenCalledWith(
        new Int16Array([5, ...Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS - 1).fill(0), maxTeamSize])
      );
    });

    it('should solve recipe and cache the result if no cached solutions are available', () => {
      recipe[0] = 5;
      const maxTeamSize = 3;

      ingredientProducers = [mocks.setCoverPokemonWithSettings({ totalIngredients: recipe })];
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      producersByIngredientIndex[0] = [0];

      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].members).toHaveLength(1);
      expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual('MOCKEMON');

      expect(cachedSubRecipeSolves.has(memoKey)).toBe(true);
    });

    it('should solve realistic Inferno Corn Keema Curry', () => {
      // we really just want 3 unique cache keys, so we don't exit early, just create a new cache key every rec call
      const missingCacheKey = () => -1;
      const firstMemoKey = () => 123;
      const secondMemoKey = () => 456;
      mockedKeyCall = vimic(setCoverUtils, 'createMemoKey', missingCacheKey, firstMemoKey, secondMemoKey);

      vimic(setCoverUtils, 'findSortedRecipeIngredientIndices', () => [10, 4, 11, 5]);

      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const tyranitar: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'tyranitar',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE })
        ])
      });
      const dragonite: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'dragonite',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB }),
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN })
        ])
      });
      ingredientProducers = [tyranitar, dragonite];

      producersByIngredientIndex[4].push(0); // sausage
      producersByIngredientIndex[5].push(0); // ginger
      producersByIngredientIndex[10].push(1); // herb
      producersByIngredientIndex[11].push(1); // corn

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const maxTeamSize = 5;
      recipe.set(ingredientSetToIntFlat(mockedCornKeema));

      const solutions = setCover.solveRecipe(recipe, maxTeamSize);

      expect(solutions.exhaustive).toBe(true);
      expect(solutions.teams).toHaveLength(1); // one team found

      const firstTeam = solutions.teams[0];

      expect(firstTeam.members).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam.members[0];
      const teamMember2 = firstTeam.members[1];

      expect(teamMember1.pokemonSet.pokemon).toEqual('dragonite');
      expect(teamMember1.totalIngredients[10]).toMatchInlineSnapshot(`30`);
      expect(teamMember1.totalIngredients[11]).toMatchInlineSnapshot(`30`);

      expect(teamMember2.pokemonSet.pokemon).toEqual('tyranitar');
      expect(teamMember2.totalIngredients[4]).toMatchInlineSnapshot(`30`);
      expect(teamMember2.totalIngredients[5]).toMatchInlineSnapshot(`30`);

      expect(firstTeam.producedIngredients).toMatchInlineSnapshot(`
Int16Array [
  0,
  0,
  0,
  0,
  30,
  30,
  0,
  0,
  0,
  0,
  30,
  30,
  0,
  0,
  0,
  0,
  0,
]
`);
    });
  });

  describe('solve', () => {
    it('should solve a simple recipe correctly', () => {
      // this test does not require recursive call, the producer can solve the recipe alone

      // generate a pokemon that produces 10 apples
      // and push it into the apple ingredient index in the reverse index lookup
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const appleProducer: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'member1',
          ingredients: ingredientSetToIntFlat([
            commonMocks.mockIngredientSet({ amount: 1, ingredient: ingredient.FANCY_APPLE })
          ])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 5, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      ingredientProducers = [appleProducer];
      producersByIngredientIndex[0] = [0];

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const { solve } = setCover._testAccess();

      recipeWithSpotsLeft[0] = 5; // recipe requires 5 apples, first index is apple
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left from start

      const ingredientIndices = [0]; // only apple ingredient index
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(1); // team only has one member
      const teamMember = firstTeam[0];

      expect(ingredientProducers[teamMember].pokemonSet.pokemon).toEqual('member1');
      expect(ingredientProducers[teamMember].totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );
    });

    it('should solve a recipe that requires multiple members', () => {
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const appleProducer: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'member1',
          ingredients: ingredientSetToIntFlat([
            commonMocks.mockIngredientSet({ amount: 1, ingredient: ingredient.FANCY_APPLE })
          ])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 5, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      ingredientProducers = [appleProducer];
      producersByIngredientIndex[0] = [0];

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const { solve } = setCover._testAccess();

      recipeWithSpotsLeft[0] = 6; // recipe requires 5 apples, first index is apple
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left from start

      const ingredientIndices = [0]; // only apple ingredient index
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam[0];
      const teamMember2 = firstTeam[1];

      expect(ingredientProducers[teamMember1].pokemonSet.pokemon).toEqual('member1');
      expect(ingredientProducers[teamMember1].totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );

      expect(ingredientProducers[teamMember2].pokemonSet.pokemon).toEqual('member1');
      expect(ingredientProducers[teamMember2].totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );
    });

    it('should solve realistic Inferno Corn Keema Curry', () => {
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const tyranitar: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'tyranitar',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE })
        ])
      });
      const dragonite: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'dragonite',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB }),
          commonMocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN })
        ])
      });

      ingredientProducers = [tyranitar, dragonite];
      producersByIngredientIndex[4] = [0]; // sausage
      producersByIngredientIndex[5] = [0]; // ginger
      producersByIngredientIndex[10] = [1]; // herb
      producersByIngredientIndex[11] = [1]; // corn

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);

      const { solve } = setCover._testAccess();

      recipeWithSpotsLeft.set(ingredientSetToIntFlat(mockedCornKeema));
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots in team

      const ingredientIndices = [10, 4, 11, 5];
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam[0];
      const teamMember2 = firstTeam[1];

      expect(ingredientProducers[teamMember1].pokemonSet.pokemon).toEqual('tyranitar');
      expect(ingredientProducers[teamMember1].totalIngredients[4]).toMatchInlineSnapshot(`30`);
      expect(ingredientProducers[teamMember1].totalIngredients[5]).toMatchInlineSnapshot(`30`);

      expect(ingredientProducers[teamMember2].pokemonSet.pokemon).toEqual('dragonite');
      expect(ingredientProducers[teamMember2].totalIngredients[10]).toMatchInlineSnapshot(`30`);
      expect(ingredientProducers[teamMember2].totalIngredients[11]).toMatchInlineSnapshot(`30`);
    });

    it('should return cached solution if available', () => {
      const { solve } = setCover._testAccess();
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left

      const ingredientIndices = [0, 2, 3];
      ingredientProducers = [
        mocks.setCoverPokemonWithSettings({ pokemonSet: { pokemon: 'Cached member', ingredients: new Int16Array() } })
      ];
      const memoKey = setCoverUtils.createMemoKey(recipe);
      const cachedSolutions: RecipeSolutions = [];

      cachedSubRecipeSolves.set(memoKey, cachedSolutions);

      const result = solve(recipe, ingredientIndices);
      expect(result).toEqual(cachedSolutions);
    });

    it('should stop searching if no spots left in team', () => {
      const { solve } = setCover._testAccess();
      const appleProducer: SetCoverPokemonSetupWithSettings = mocks.setCoverPokemonWithSettings({
        pokemonSet: {
          pokemon: 'member1',
          ingredients: ingredientSetToIntFlat([
            commonMocks.mockIngredientSet({ amount: 1, ingredient: ingredient.FANCY_APPLE })
          ])
        },
        totalIngredients: ingredientSetToIntFlat([
          commonMocks.mockIngredientSet({ amount: 5, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      ingredientProducers = [appleProducer];
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 0; // team is full
      recipeWithSpotsLeft[0] = 5; // recipe requires 5 apples, first index is apple
      const ingredientIndices = [0]; // only apple ingredient index
      producersByIngredientIndex[0].push(0); // producer can solve the recipe alone

      const result = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(result).toEqual([]);
    });
  });

  describe('findTeams', () => {
    it('should handle case where producer solves remaining ingredients alone', () => {
      const { findTeams } = setCover._testAccess();

      const remainingRecipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 3; // 3 spots left
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft: new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1),
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 0,
          member: 0
        }
      ];
      const result = findTeams(subRecipesAfterProducerSubtract);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle case where no teams could solve the sub-recipe', () => {
      const { findTeams } = setCover._testAccess();
      const remainingRecipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 0; // no spots left
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft,
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 5,
          member: 0
        }
      ];
      const result = findTeams(subRecipesAfterProducerSubtract);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('ifStopSearching', () => {
    it('should stop searching if conditions are met', () => {
      const { ifStopSearching } = setCover._testAccess();
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3],
        startTime: 0,
        timeout: 1000
      };

      const mock = vimic(setCoverUtils, 'ifUnsolvableNode', () => false);

      const result = ifStopSearching(params);

      expect(result).toBeUndefined();
      expect(mock).toHaveBeenCalledWith({
        memoKey: 123,
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3],
        startTime: expect.any(Number),
        timeout: expect.any(Number)
      });
    });

    it('should return cached solution if available', () => {
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3],
        startTime: 0,
        timeout: 1000
      };
      const cachedSolutions: RecipeSolutions = [[0]];

      cachedSubRecipeSolves.set(params.memoKey, cachedSolutions);
      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);
      const { ifStopSearching } = setCover._testAccess();

      const result = ifStopSearching(params);

      expect(result).toEqual(cachedSolutions);
    });

    it('should return empty array if node is unsolvable', () => {
      const { ifStopSearching } = setCover._testAccess();
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 0,
        ingredientIndices: [1, 2, 3],
        startTime: 0,
        timeout: 1000
      };

      const mock = vimic(setCoverUtils, 'ifUnsolvableNode', () => true);

      const result = ifStopSearching(params);

      expect(result).toEqual([]);
      expect(mock).toHaveBeenCalledWith({
        memoKey: 123,
        spotsLeftInTeam: 0,
        ingredientIndices: [1, 2, 3],
        startTime: expect.any(Number),
        timeout: expect.any(Number)
      });
    });
  });

  describe('sortSubRecipesAfterProducerSubtract', () => {
    it('should create sub-recipes and sort after producer subtract', () => {
      const subRecipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      subRecipeWithSpotsLeft.set([5, 3, 2]);
      const ingredientIndices = [0, 1, 2];

      const producersToAdd = [
        mocks.setCoverPokemonWithSettings({ totalIngredients: new Int16Array([2, 1, 1]) }),
        mocks.setCoverPokemonWithSettings({ totalIngredients: new Int16Array([3, 2, 1]) })
      ];

      ingredientProducers.push(...producersToAdd);

      const producersOfFirstIngredient = [0, 1];
      producersByIngredientIndex[0] = producersOfFirstIngredient;

      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);
      const { sortSubRecipesAfterProducerSubtract } = setCover._testAccess();

      const result = sortSubRecipesAfterProducerSubtract(
        subRecipeWithSpotsLeft,
        ingredientIndices,
        producersOfFirstIngredient
      );

      expect(result).toHaveLength(2);

      // expect 2nd team to be first now in results since it has the least amount of ingredients left
      expect(result[0].remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([2, 1, 1, ...new Int16Array(ingredient.INGREDIENTS.length - 3), -1])
      );
      expect(result[0].remainingIngredientIndices).toEqual([0, 1, 2]);
      expect(result[0].sumRemainingRecipeIngredients).toBe(4);
      expect(result[0].member).toEqual(producersOfFirstIngredient[1]);

      expect(result[1].remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([3, 2, 1, ...new Int16Array(ingredient.INGREDIENTS.length - 3), -1])
      );
      expect(result[1].remainingIngredientIndices).toEqual([0, 1, 2]);
      expect(result[1].sumRemainingRecipeIngredients).toBe(6);
      expect(result[1].member).toEqual(producersOfFirstIngredient[0]);
    });

    it('should subtract 1 from spots left', () => {
      const subRecipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      subRecipeWithSpotsLeft.set([5, 3, 2]);
      subRecipeWithSpotsLeft[ingredient.INGREDIENTS.length] = 3;
      const ingredientIndices = [0, 1, 2];

      const producerToAdd = mocks.setCoverPokemonWithSettings({ totalIngredients: new Int16Array([2, 1, 1]) });
      ingredientProducers.push(producerToAdd);

      producersByIngredientIndex[0] = [0];
      producersByIngredientIndex[1] = [0];
      producersByIngredientIndex[2] = [0];

      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);
      const { sortSubRecipesAfterProducerSubtract } = setCover._testAccess();

      const result = sortSubRecipesAfterProducerSubtract(subRecipeWithSpotsLeft, ingredientIndices, [0]);
      expect(result).toHaveLength(1);
      result.forEach((subRecipe) => {
        expect(subRecipe.remainingRecipeWithSpotsLeft[ingredient.INGREDIENTS.length]).toBe(2);
      });
    });
  });

  describe('formatResult', () => {
    it('should format the result correctly', () => {
      const producersToAdd = [
        mocks.setCoverPokemonWithSettings({
          totalIngredients: new Int16Array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0]),
          pokemonSet: { ingredients: new Int16Array(), pokemon: '1stTeam1stMember' }
        }),
        mocks.setCoverPokemonWithSettings({
          totalIngredients: new Int16Array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
          pokemonSet: { ingredients: new Int16Array(), pokemon: '1stTeam2ndMember' }
        }),
        mocks.setCoverPokemonWithSettings({
          totalIngredients: new Int16Array([4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
          pokemonSet: { ingredients: new Int16Array(), pokemon: '2ndTeam1stMember' }
        })
      ];

      ingredientProducers.push(...producersToAdd);

      setCover = new SetCover(ingredientProducers, producersByIngredientIndex, cachedSubRecipeSolves);
      const { formatResult } = setCover._testAccess();

      const solutions: RecipeSolutions = [[0, 1], [2]];

      const startTime = Date.now();
      const timeout = 1000;

      const result = formatResult({ solutions, startTime, timeout });

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(2);
      expect(result.teams[0].producedIngredients).toEqual(
        new Int16Array([2, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0])
      );
      expect(result.teams[0].members).toHaveLength(2);
      expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual('1stTeam1stMember');
      expect(result.teams[0].members[1].pokemonSet.pokemon).toEqual('1stTeam2ndMember');
      expect(result.teams[1].members).toHaveLength(1);
      expect(result.teams[1].members[0].pokemonSet.pokemon).toEqual('2ndTeam1stMember');
    });

    it('should set exhaustive to false if timeout is reached', () => {
      const { formatResult } = setCover._testAccess();

      const solutions: RecipeSolutions = [];
      const startTime = Date.now() - 2000;
      const timeout = 1000;

      const result = formatResult({ solutions, startTime, timeout });

      expect(result.exhaustive).toBe(false);
    });
  });
});
