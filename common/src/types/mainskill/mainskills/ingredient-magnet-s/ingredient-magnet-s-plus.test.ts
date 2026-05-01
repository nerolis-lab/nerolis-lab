import { describe, expect, it } from 'vitest';
import { IngredientMagnetS } from './ingredient-magnet-s';
import { IngredientMagnetSPlusPlusle, IngredientMagnetSPlusToxtricity } from './ingredient-magnet-s-plus';

for (const skill of [IngredientMagnetSPlusPlusle, IngredientMagnetSPlusToxtricity]) {
  describe('IngredientMagnetSPlusPlusle', () => {
    it('should have modified name format', () => {
      expect(skill.name).toBe('Plus (Ingredient Magnet S)');
      expect(skill.modifierName).toBe('Plus');
      expect(skill.baseSkill).toBe(IngredientMagnetS);
    });

    it('should have correct basic properties', () => {
      expect(skill.name).toBe('Plus (Ingredient Magnet S)');
      expect(skill.description({ skillLevel: 1 })).toBe(
        `Gets you 5 ingredients chosen at random. Meet certain conditions to get an additional 6 ${skill.ingredient.name}`
      );
      expect(skill.maxLevel).toBe(7);
    });

    it('should have specific RP values', () => {
      expect(skill.getRPValue(1)).toBe(880);
      expect(skill.getRPValue(4)).toBe(2383);
      expect(skill.getRPValue(7)).toBe(5843);
    });

    it('should have solo activation', () => {
      expect(skill.activations).toHaveProperty('solo');
      expect(skill.activations.solo.unit).toBe('ingredients');
      expect(typeof skill.activations.solo.amount).toBe('function');
    });

    it('should have paired activation', () => {
      expect(skill.activations).toHaveProperty('paired');
      expect(skill.activations.paired.unit).toBe('ingredients');
      expect(typeof skill.activations.paired.amount).toBe('function');
    });

    it('should calculate correct ingredient amounts', () => {
      expect(skill.activations.solo.amount({ skillLevel: 1 })).toBe(5);
      expect(skill.activations.solo.amount({ skillLevel: 4 })).toBe(11);
      expect(skill.activations.solo.amount({ skillLevel: 7 })).toBe(18);
      expect(skill.activations.paired.amount({ skillLevel: 1 })).toBe(6);
      expect(skill.activations.paired.amount({ skillLevel: 2 })).toBe(7);
    });
  });
}
