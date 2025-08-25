import { UserRecipeDAO } from '@src/database/dao/user-recipe/user-recipe-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error.js';
import { SleepAPIError } from '@src/domain/error/sleepapi-error.js';
import * as productionService from '@src/services/api-service/production/production-service.js';
import type {
  CalculateIvRequest,
  CalculateTeamRequest,
  IngredientInstance,
  SingleProductionRequest
} from 'sleepapi-common';
import * as common from 'sleepapi-common';
import { commonMocks } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductionController from './production.controller.js';

describe('ProductionController', () => {
  let controller: ProductionController;

  beforeEach(() => {
    controller = new ProductionController();
    vi.clearAllMocks();
  });

  describe('calculatePokemonProduction', () => {
    it('should calculate pokemon production successfully', async () => {
      const mockPokemon = commonMocks.mockPokemon();
      const mockRequest: SingleProductionRequest = {
        level: 60,
        ribbon: 0,
        nature: 'BASHFUL',
        subskills: [],
        skillLevel: 6,
        helperBoostUnique: 0,
        helperBoostProcs: 0,
        helperBoostLevel: 6,
        helpingbonus: 0,
        camp: false,
        erb: 0,
        recoveryIncense: false,
        e4eProcs: 0,
        e4eLevel: 5,
        cheer: 0,
        extraHelpful: 0,
        nrOfEvolutions: 0,
        mainBedtime: '21:30',
        mainWakeup: '06:00',
        ingredientSet: ['FANCY_APPLE', 'BEAN_SAUSAGE']
      };
      const mockResult = { production: 'mock-result' };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);
      const calculatePokemonProductionMock = vimic(productionService, 'calculatePokemonProduction', () => mockResult);

      const result = await controller.calculatePokemonProduction('MOCKEMON', mockRequest, false);

      expect(getPokemonMock).toHaveBeenCalledWith('MOCKEMON');
      expect(calculatePokemonProductionMock).toHaveBeenCalledWith(
        mockPokemon,
        expect.objectContaining({
          level: 60,
          nature: common.nature.BASHFUL
        }),
        ['FANCY_APPLE', 'BEAN_SAUSAGE'],
        false,
        5000
      );
      expect(result).toBe(mockResult);

      getPokemonMock.mockRestore();
      calculatePokemonProductionMock.mockRestore();
    });

    it('should throw SleepAPIError for invalid sleep duration', async () => {
      const mockPokemon = commonMocks.mockPokemon();
      const mockRequest: SingleProductionRequest = {
        level: 60,
        ribbon: 0,
        nature: 'BASHFUL',
        subskills: [],
        skillLevel: 6,
        helperBoostUnique: 0,
        helperBoostProcs: 0,
        helperBoostLevel: 6,
        helpingbonus: 0,
        camp: false,
        erb: 0,
        recoveryIncense: false,
        e4eProcs: 0,
        e4eLevel: 5,
        cheer: 0,
        extraHelpful: 0,
        nrOfEvolutions: 0,
        mainBedtime: '06:00',
        mainWakeup: '06:30',
        ingredientSet: ['FANCY_APPLE']
      };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);

      await expect(controller.calculatePokemonProduction('MOCKEMON', mockRequest)).rejects.toThrowError(SleepAPIError);

      getPokemonMock.mockRestore();
    });

    it('should throw PokemonError for invalid evolution count', async () => {
      const mockPokemon = commonMocks.mockPokemon({ previousEvolutions: 1 });
      const mockRequest: SingleProductionRequest = {
        level: 60,
        ribbon: 0,
        nature: 'BASHFUL',
        subskills: [],
        skillLevel: 6,
        helperBoostUnique: 0,
        helperBoostProcs: 0,
        helperBoostLevel: 6,
        helpingbonus: 0,
        camp: false,
        erb: 0,
        recoveryIncense: false,
        e4eProcs: 0,
        e4eLevel: 5,
        cheer: 0,
        extraHelpful: 0,
        nrOfEvolutions: 3,
        mainBedtime: '21:30',
        mainWakeup: '06:00',
        ingredientSet: ['FANCY_APPLE']
      };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);

      await expect(controller.calculatePokemonProduction('MOCKEMON', mockRequest)).rejects.toThrowError(PokemonError);

      getPokemonMock.mockRestore();
    });
  });

  describe('calculateTeam', () => {
    it('should calculate team production successfully', async () => {
      const mockUser: DBUser = { id: 'user-123' } as DBUser;
      const mockPokemon = commonMocks.mockPokemon();
      const mockRequest: CalculateTeamRequest = {
        members: [
          {
            pokemon: 'MOCKEMON',
            level: 60,
            ribbon: 0,
            nature: 'BASHFUL',
            subskills: [],
            skillLevel: 6,
            ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
            externalId: 'test-1'
          }
        ],
        settings: {
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };
      const mockResult = { team: 'mock-result' };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);
      const getNatureMock = vimic(common, 'getNature', () => common.nature.BASHFUL);
      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.FANCY_APPLE);
      const calculateTeamMock = vimic(productionService, 'calculateTeam', () => mockResult);
      const userRecipesFindMock = vimic(UserRecipeDAO, 'findMultiple', () => []);

      const result = await controller.calculateTeam(mockRequest, mockUser);

      expect(calculateTeamMock).toHaveBeenCalled();
      expect(result).toBe(mockResult);

      getPokemonMock.mockRestore();
      getNatureMock.mockRestore();
      getIngredientMock.mockRestore();
      calculateTeamMock.mockRestore();
      userRecipesFindMock.mockRestore();
    });

    it('should use default user recipes when no user provided', async () => {
      const mockPokemon = commonMocks.mockPokemon();
      const mockRequest: CalculateTeamRequest = {
        members: [
          {
            pokemon: 'MOCKEMON',
            level: 60,
            ribbon: 0,
            nature: 'BASHFUL',
            subskills: [],
            skillLevel: 6,
            ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
            externalId: 'test-1'
          }
        ],
        settings: {
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };
      const mockResult = { team: 'mock-result' };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);
      const getNatureMock = vimic(common, 'getNature', () => common.nature.BASHFUL);
      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.FANCY_APPLE);
      const calculateTeamMock = vimic(productionService, 'calculateTeam', () => mockResult);

      const result = await controller.calculateTeam(mockRequest);

      expect(calculateTeamMock).toHaveBeenCalled();
      expect(result).toBe(mockResult);

      getPokemonMock.mockRestore();
      getNatureMock.mockRestore();
      getIngredientMock.mockRestore();
      calculateTeamMock.mockRestore();
    });

    it('should throw SleepAPIError for invalid sleep duration in team settings', async () => {
      const mockRequest: CalculateTeamRequest = {
        members: [
          {
            pokemon: 'MOCKEMON',
            level: 60,
            ribbon: 0,
            nature: 'BASHFUL',
            subskills: [],
            skillLevel: 6,
            ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
            externalId: 'test-1'
          }
        ],
        settings: {
          camp: false,
          bedtime: '06:00',
          wakeup: '06:30',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };

      await expect(controller.calculateTeam(mockRequest)).rejects.toThrowError(SleepAPIError);
    });
  });

  describe('calculateIv', () => {
    it('should calculate IV successfully', async () => {
      const mockPokemon = commonMocks.mockPokemon();
      const mockRequest: CalculateIvRequest = {
        members: [
          {
            pokemon: 'MOCKEMON',
            level: 60,
            ribbon: 0,
            nature: 'BASHFUL',
            subskills: [],
            skillLevel: 6,
            ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
            externalId: 'test-1'
          }
        ],
        variants: [
          {
            pokemon: 'MOCKEMON',
            level: 60,
            ribbon: 0,
            nature: 'RASH',
            subskills: [],
            skillLevel: 6,
            ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
            externalId: 'test-2'
          }
        ],
        settings: {
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };
      const mockResult = { iv: 'mock-result' };

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);
      const getNatureMock = vimic(common, 'getNature', (nature: string) =>
        nature === 'BASHFUL' ? common.nature.BASHFUL : common.nature.RASH
      );
      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.FANCY_APPLE);
      const calculateIvMock = vimic(productionService, 'calculateIv', () => mockResult);

      const result = await controller.calculateIv(mockRequest);

      expect(calculateIvMock).toHaveBeenCalled();
      expect(result).toBe(mockResult);

      getPokemonMock.mockRestore();
      getNatureMock.mockRestore();
      getIngredientMock.mockRestore();
      calculateIvMock.mockRestore();
    });

    it('should throw BadRequestError when team has more than 4 members', async () => {
      const memberTemplate = {
        pokemon: 'MOCKEMON',
        level: 60,
        ribbon: 0,
        nature: 'BASHFUL',
        subskills: [],
        skillLevel: 6,
        ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }]
      };

      const mockRequest: CalculateIvRequest = {
        members: [
          { ...memberTemplate, externalId: 'test-1' },
          { ...memberTemplate, externalId: 'test-2' },
          { ...memberTemplate, externalId: 'test-3' },
          { ...memberTemplate, externalId: 'test-4' },
          { ...memberTemplate, externalId: 'test-5' }
        ],
        variants: [{ ...memberTemplate, externalId: 'variant-1' }],
        settings: {
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };

      await expect(controller.calculateIv(mockRequest)).rejects.toThrowError(BadRequestError);
    });

    it('should throw BadRequestError when variants has more than 10 items', async () => {
      const memberTemplate = {
        pokemon: 'MOCKEMON',
        level: 60,
        ribbon: 0,
        nature: 'BASHFUL',
        subskills: [],
        skillLevel: 6,
        ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }]
      };

      const mockRequest: CalculateIvRequest = {
        members: [{ ...memberTemplate, externalId: 'test-1' }],
        variants: Array.from({ length: 11 }, (_, i) => ({
          ...memberTemplate,
          externalId: `variant-${i + 1}`
        })),
        settings: {
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          island: 'GREENGRASS',
          stockpiledIngredients: []
        }
      };

      await expect(controller.calculateIv(mockRequest)).rejects.toThrowError(BadRequestError);
    });
  });

  describe('parseSettings', () => {
    it('should parse settings successfully', async () => {
      const mockUser: DBUser = { id: 'user-123' } as DBUser;
      const mockUserSettings = { pot_size: 15, fk_user_id: 'user-123' };
      const settings = {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        island: 'GREENGRASS',
        stockpiledIngredients: [{ name: 'FANCY_APPLE', amount: 5 }]
      };

      const userSettingsFindMock = vimic(UserSettingsDAO, 'find', () => mockUserSettings);
      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.FANCY_APPLE);

      const parseSettings = controller._testAccess().parseSettings;
      const result = await parseSettings({
        settings,
        includeCooking: true,
        maybeUser: mockUser
      });

      expect(result).toEqual({
        camp: false,
        bedtime: { hour: 21, minute: 30, second: 0 },
        wakeup: { hour: 6, minute: 0, second: 0 },
        includeCooking: true,
        stockpiledIngredients: expect.any(Object),
        potSize: 15,
        island: 'GREENGRASS'
      });

      expect(userSettingsFindMock).toHaveBeenCalledWith({ fk_user_id: 'user-123' });

      userSettingsFindMock.mockRestore();
      getIngredientMock.mockRestore();
    });

    it('should use default pot size when no user settings found', async () => {
      const mockUser: DBUser = { id: 'user-123' } as DBUser;
      const settings = {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        island: 'GREENGRASS',
        stockpiledIngredients: []
      };

      const userSettingsFindMock = vimic(UserSettingsDAO, 'find', () => null);

      const parseSettings = controller._testAccess().parseSettings;
      const result = await parseSettings({
        settings,
        includeCooking: true,
        maybeUser: mockUser
      });

      expect(result.potSize).toBe(common.MAX_POT_SIZE);

      userSettingsFindMock.mockRestore();
    });
  });

  describe('parseTeamMembers', () => {
    it('should parse team members successfully', () => {
      const mockPokemon = commonMocks.mockPokemon();
      const members = [
        {
          pokemon: 'MOCKEMON',
          level: 60,
          ribbon: 0,
          nature: 'BASHFUL',
          subskills: [{ subskill: 'BERRY_FINDING_S', level: 10 }],
          skillLevel: 6,
          ingredients: [{ name: 'FANCY_APPLE', amount: 2, level: 1 }],
          externalId: 'test-1'
        }
      ];

      const getPokemonMock = vimic(common, 'getPokemon', () => mockPokemon);
      const getNatureMock = vimic(common, 'getNature', () => common.nature.BASHFUL);
      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.FANCY_APPLE);

      const parseTeamMembers = controller._testAccess().parseTeamMembers;
      const result = parseTeamMembers(members, false);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        pokemonWithIngredients: {
          pokemon: mockPokemon,
          ingredientList: [
            {
              amount: 2,
              ingredient: common.ingredient.FANCY_APPLE
            }
          ]
        },
        settings: {
          level: 60,
          ribbon: 0,
          carrySize: expect.any(Number),
          nature: common.nature.BASHFUL,
          skillLevel: 6,
          subskills: expect.any(Set),
          externalId: 'test-1'
        }
      });

      getPokemonMock.mockRestore();
      getNatureMock.mockRestore();
      getIngredientMock.mockRestore();
    });
  });

  describe('getIngredientSet', () => {
    it('should get ingredient set for valid level', () => {
      const mockPokemon = commonMocks.mockPokemon();
      const ingredients: IngredientInstance[] = [
        { name: 'FANCY_APPLE', amount: 2, level: 1 },
        { name: 'BEAN_SAUSAGE', amount: 3, level: 30 },
        { name: 'PURE_OIL', amount: 1, level: 60 }
      ];

      const getIngredientMock = vimic(common, 'getIngredient', (name: string) => {
        if (name === 'FANCY_APPLE') return common.ingredient.FANCY_APPLE;
        if (name === 'BEAN_SAUSAGE') return common.ingredient.BEAN_SAUSAGE;
        return common.ingredient.PURE_OIL;
      });

      const getIngredientSet = controller._testAccess().getIngredientSet;
      const result = getIngredientSet({
        pokemon: mockPokemon,
        level: 30,
        ingredients
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { amount: 2, ingredient: common.ingredient.FANCY_APPLE },
        { amount: 3, ingredient: common.ingredient.BEAN_SAUSAGE }
      ]);

      getIngredientMock.mockRestore();
    });

    it('should return empty array for ingredients above level', () => {
      const mockPokemon = commonMocks.mockPokemon();
      const ingredients: IngredientInstance[] = [{ name: 'PURE_OIL', amount: 1, level: 60 }];

      const getIngredientMock = vimic(common, 'getIngredient', () => common.ingredient.PURE_OIL);

      const getIngredientSet = controller._testAccess().getIngredientSet;
      const result = getIngredientSet({
        pokemon: mockPokemon,
        level: 30,
        ingredients
      });

      expect(result).toHaveLength(0);

      getIngredientMock.mockRestore();
    });
  });

  describe('parseSingleProductionInput', () => {
    it('should parse single production input successfully', () => {
      const mockPokemon = commonMocks.mockPokemon({ skill: common.HelperBoost });
      const input: SingleProductionRequest = {
        level: 50,
        ribbon: 4,
        nature: 'RASH',
        subskills: ['BERRY_FINDING_S'],
        skillLevel: 3,
        helperBoostUnique: 0,
        helperBoostProcs: 2,
        helperBoostLevel: 3,
        helpingbonus: 15,
        camp: true,
        erb: 5,
        recoveryIncense: true,
        e4eProcs: 1,
        e4eLevel: 2,
        cheer: 3,
        extraHelpful: 1,
        nrOfEvolutions: 0,
        mainBedtime: '22:00',
        mainWakeup: '07:00',
        ingredientSet: []
      };

      const getNatureMock = vimic(common, 'getNature', () => common.nature.RASH);
      const limitSubSkillsMock = vimic(common, 'limitSubSkillsToLevel', () => new Set(['BERRY_FINDING_S']));

      const parseSingleProductionInput = controller._testAccess().parseSingleProductionInput;
      const result = parseSingleProductionInput(mockPokemon, input);

      expect(result).toEqual({
        level: 50,
        ribbon: 4,
        nature: common.nature.RASH,
        subskills: new Set(['BERRY_FINDING_S']),
        skillLevel: 3,
        inventoryLimit: expect.any(Number),
        e4eProcs: 1,
        e4eLevel: 2,
        cheer: 3,
        extraHelpful: 1,
        helperBoostProcs: 2,
        helperBoostUnique: 1, // Should be 1 for helper boost pokemon when input is 0
        helperBoostLevel: 3,
        helpingBonus: 15,
        camp: true,
        erb: 5,
        incense: true,
        mainBedtime: { hour: 22, minute: 0, second: 0 },
        mainWakeup: { hour: 7, minute: 0, second: 0 }
      });

      getNatureMock.mockRestore();
      limitSubSkillsMock.mockRestore();
    });
  });
});
