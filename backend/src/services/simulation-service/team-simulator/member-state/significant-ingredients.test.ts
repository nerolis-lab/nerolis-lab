import { describe, expect, it } from 'vitest';
import { ingredientSkillAccess } from './significant-ingredients.js';
import {
  Metronome,
  SkillCopy,
  SkillCopyMimic,
  SkillCopyTransform,
  IngredientMagnetS,
  IngredientMagnetSPlusPlusle,
  IngredientMagnetSPresent,
  IngredientDrawSDwebble,
  IngredientDrawSHyperCutter,
  IngredientDrawSSuperLuck,
  ExtraHelpfulS,
  HelperBoost,
  EnergizingCheerSNuzzle,
  ChargeStrengthS,
  ingredient
} from 'sleepapi-common';

describe('ingredientSkillAccess', () => {
  it('obeys the existing Metronome pool, excluding blocked Draw variants and Magnet-only milk', () => {
    const access = ingredientSkillAccess(Metronome, []);
    const names = access.ingredients.map(({ name }) => name);
    expect(names).not.toContain('Avocado');
    expect(names).toContain('Corn');
    expect(names).not.toContain('Milk');
    expect(access.hasMagnet).toBe(true);
  });

  it.each([SkillCopy, SkillCopyMimic, SkillCopyTransform])(
    'resolves teammates and copied Metronome for $name',
    (skill) => {
      const access = ingredientSkillAccess(skill, [Metronome]);
      expect(access).toEqual(ingredientSkillAccess(Metronome, []));
      expect(ingredientSkillAccess(skill, [SkillCopy, ChargeStrengthS])).toEqual({ ingredients: [], hasMagnet: false });
      expect(ingredientSkillAccess(skill, [IngredientDrawSDwebble]).ingredients).toContainEqual(
        ingredient.GLOSSY_AVOCADO
      );
    }
  );

  it.each([IngredientMagnetS, IngredientMagnetSPlusPlusle, IngredientMagnetSPresent])(
    'detects $name without adding its random pool',
    (skill) => {
      expect(ingredientSkillAccess(skill, [])).toEqual({ ingredients: [], hasMagnet: true });
    }
  );

  it.each([ExtraHelpfulS, HelperBoost, EnergizingCheerSNuzzle])(
    'does not attribute target ingredients to $name',
    (skill) => {
      expect(ingredientSkillAccess(skill, [IngredientDrawSDwebble])).toEqual({ ingredients: [], hasMagnet: false });
    }
  );

  it('includes modified draw pools without non-ingredient rewards', () => {
    expect(ingredientSkillAccess(IngredientDrawSHyperCutter, []).ingredients).toContainEqual(
      ingredient.GREENGRASS_CORN
    );
    const luck = ingredientSkillAccess(IngredientDrawSSuperLuck, []);
    expect(luck.ingredients).toHaveLength(4);
    expect(luck.ingredients).not.toContain(undefined);
  });
});
