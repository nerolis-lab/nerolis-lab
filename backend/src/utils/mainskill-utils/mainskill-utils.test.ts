import {
  convertActivationsToApiFormat,
  getMainskill,
  getMainskillNames
} from '@src/utils/mainskill-utils/mainskill-utils.js';
import type { Mainskill, MainskillActivation } from 'sleepapi-common';
import { MAINSKILLS } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('getMainskillNames', () => {
  it('shall get all mainskill names', () => {
    expect(getMainskillNames()).toMatchInlineSnapshot(`
      [
        "Berry Burst",
        "Disguise (Berry Burst)",
        "Charge Energy S",
        "Moonlight (Charge Energy S)",
        "Charge Strength M",
        "Bad Dreams (Charge Strength M)",
        "Charge Strength S",
        "Charge Strength S Range",
        "Stockpile (Charge Strength S)",
        "Cooking Power-Up S",
        "Minus (Cooking Power-Up S)",
        "Dream Shard Magnet S",
        "Dream Shard Magnet S Range",
        "Energizing Cheer S",
        "Energy For Everyone",
        "Lunar Blessing (Energy For Everyone)",
        "Extra Helpful S",
        "Helper Boost",
        "Ingredient Draw S",
        "Hyper Cutter (Ingredient Draw S)",
        "Super Luck (Ingredient Draw S)",
        "Ingredient Magnet S",
        "Plus (Ingredient Magnet S)",
        "Metronome",
        "Present (Ingredient Magnet S)",
        "Skill Copy",
        "Mimic (Skill Copy)",
        "Transform (Skill Copy)",
        "Tasty Chance S",
      ]
    `);
  });
});

describe('getMainskill', () => {
  it.each(MAINSKILLS.map((ms) => [ms.name, ms]))('finds mainskill %s', (name: string, ms: Mainskill) => {
    const result = getMainskill(name);
    expect(result).toEqual(ms);
  });

  it('shall throw if looking up missing mainskill', () => {
    expect(() => getMainskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `[MainskillError: Can't find Main skill with name missing]`
    );
  });
});

describe('convertActivationsToApiFormat', () => {
  it('should convert single activation to API format', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      testActivation: {
        amount: (params: { skillLevel: number }) => params.skillLevel * 10,
        unit: 'energy'
      }
    };

    const result = convertActivationsToApiFormat(mockActivations, 3);

    expect(result).toEqual({
      testActivation: {
        unit: 'energy',
        amounts: [10, 20, 30]
      }
    });
  });

  it('should convert multiple activations to API format', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      energy: {
        amount: (params: { skillLevel: number }) => params.skillLevel * 5,
        unit: 'energy'
      },
      berries: {
        amount: (params: { skillLevel: number }) => params.skillLevel + 2,
        unit: 'berry'
      }
    };

    const result = convertActivationsToApiFormat(mockActivations, 4);

    expect(result).toEqual({
      energy: {
        unit: 'energy',
        amounts: [5, 10, 15, 20]
      },
      berries: {
        unit: 'berry',
        amounts: [3, 4, 5, 6]
      }
    });
  });

  it('should handle empty activations object', () => {
    const result = convertActivationsToApiFormat({}, 5);
    expect(result).toEqual({});
  });

  it('should handle maxLevel of 1', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      singleLevel: {
        amount: (params: { skillLevel: number }) => 100 + (params.skillLevel - params.skillLevel), // Always returns 100
        unit: 'points'
      }
    };

    const result = convertActivationsToApiFormat(mockActivations, 1);

    expect(result).toEqual({
      singleLevel: {
        unit: 'points',
        amounts: [100]
      }
    });
  });

  it('should handle complex activation formulas', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      complex: {
        amount: (params: { skillLevel: number }) => Math.floor(params.skillLevel * 1.5) + (params.skillLevel % 2),
        unit: 'items'
      }
    };

    const result = convertActivationsToApiFormat(mockActivations, 5);

    expect(result).toEqual({
      complex: {
        unit: 'items',
        amounts: [2, 3, 5, 6, 8] // Math.floor(n * 1.5) + (n % 2) for n=1,2,3,4,5
      }
    });
  });

  it('should preserve original activation units', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      berryActivation: {
        amount: (params: { skillLevel: number }) => params.skillLevel,
        unit: 'berry'
      },
      energyActivation: {
        amount: (params: { skillLevel: number }) => params.skillLevel,
        unit: 'energy'
      },
      ingredientActivation: {
        amount: (params: { skillLevel: number }) => params.skillLevel,
        unit: 'ingredient'
      }
    };

    const result = convertActivationsToApiFormat(mockActivations, 2);

    expect(result.berryActivation.unit).toBe('berry');
    expect(result.energyActivation.unit).toBe('energy');
    expect(result.ingredientActivation.unit).toBe('ingredient');
  });

  it('should generate correct amounts array length based on maxLevel', () => {
    const mockActivations: Record<string, MainskillActivation> = {
      test: {
        amount: (params: { skillLevel: number }) => params.skillLevel,
        unit: 'test'
      }
    };

    const result1 = convertActivationsToApiFormat(mockActivations, 1);
    const result5 = convertActivationsToApiFormat(mockActivations, 5);
    const result10 = convertActivationsToApiFormat(mockActivations, 10);

    expect(result1.test.amounts).toHaveLength(1);
    expect(result5.test.amounts).toHaveLength(5);
    expect(result10.test.amounts).toHaveLength(10);
  });
});
