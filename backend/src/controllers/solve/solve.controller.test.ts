import SolveController from '@src/controllers/solve/solve.controller.js';
import { BadRequestError } from '@src/domain/error/api/api-error.js';
import * as mealUtils from '@src/utils/meal-utils/meal-utils.js';
import { mocks } from '@src/vitest/index.js';
import * as common from 'sleepapi-common';
import { commonMocks } from 'sleepapi-common';
import { vimic } from 'vimic';

describe('solve.controller', () => {
  describe('enrichSolveSettings', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should enrich solve settings with valid inputs', () => {
      const settings = mocks.solveSettings();

      const enrichSolveSettings = controller._testAccess().enrichSolveSettings;
      const result = enrichSolveSettings(settings);

      expect(result).toEqual({
        camp: settings.camp,
        level: settings.level,
        bedtime: mocks.bedtime(),
        wakeup: mocks.wakeup(),
        includeCooking: false,
        stockpiledIngredients: common.emptyIngredientInventoryFloat(),
        potSize: common.MAX_POT_SIZE
      });
    });

    it('should throw BadRequestError for invalid sleep duration', () => {
      const settings = mocks.solveSettings({ wakeup: '12:00', bedtime: '12:01' });

      const enrichSolveSettings = controller._testAccess().enrichSolveSettings;

      expect(() => enrichSolveSettings(settings)).toThrowError(BadRequestError);
    });
  });

  describe('enrichMemberSettings', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should enrich member settings with valid inputs', () => {
      const settings = mocks.teamMemberSettings();

      const natureMock = vimic(common, 'getNature', () => common.nature.BASHFUL);

      const enrichMemberSettings = controller._testAccess().enrichMemberSettings;
      const result = enrichMemberSettings({ ...settings });

      expect(natureMock).toHaveBeenCalledWith(settings.nature);
      expect(result).toEqual({ ...settings, nature: common.nature.BASHFUL, subskills: new Set() });

      natureMock.mockRestore();
    });
  });

  describe('resultToResponse', () => {
    let controller: SolveController;

    beforeEach(() => {
      controller = new SolveController();
    });

    it('should map result to response correctly', () => {
      const result = mocks.solveRecipeResultWithSettings();
      vimic(mealUtils, 'getMeal', () => commonMocks.mockRecipe());

      const mockedIngredientSet: common.IngredientSet[] = [
        commonMocks.mockIngredientSet({ amount: 10, ingredient: common.ingredient.FANCY_APPLE })
      ];
      const mockedPokemon = commonMocks.mockPokemon();

      const flatToIngredientSetMock = vimic(common, 'flatToIngredientSet', () => mockedIngredientSet);
      const getPokemonMock = vimic(common, 'getPokemon', () => mockedPokemon);

      const resultToResponse = controller._testAccess().resultToResponse;
      const response = resultToResponse(result, 'fake-recipe');

      expect(response).toEqual({
        exhaustive: result.exhaustive,
        teams: result.teams.map((team) => ({
          producedIngredients: mockedIngredientSet,
          surplus: {
            total: mockedIngredientSet,
            extra: mockedIngredientSet,
            relevant: []
          },
          members: team.members.map((member) => ({
            producedIngredients: mockedIngredientSet,
            member: {
              pokemonWithIngredients: {
                pokemon: mockedPokemon,
                ingredientList: [commonMocks.mockIngredientSet()]
              },
              settings: member.settings
            }
          }))
        }))
      });

      expect(flatToIngredientSetMock).toHaveBeenCalledWith(new Int16Array());
      expect(getPokemonMock).toHaveBeenCalledWith('MOCKEMON');
      flatToIngredientSetMock.mockRestore();
    });
  });
});
