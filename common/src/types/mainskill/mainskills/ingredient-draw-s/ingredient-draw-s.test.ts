import { describe, expect, it } from 'vitest';
import { IngredientDrawSCutiefly, IngredientDrawSDwebble, IngredientDrawSSandshrew } from './ingredient-draw-s';

for (const { skill, version } of [
  { skill: IngredientDrawSSandshrew, version: 'Sandshrew' },
  { skill: IngredientDrawSDwebble, version: 'Dwebble' },
  { skill: IngredientDrawSCutiefly, version: 'Cutiefly' }
]) {
  describe(`IngredientDrawS: ${version}`, () => {
    it('should have correct basic properties', () => {
      expect(skill.name).toBe('Ingredient Draw S');
      expect(skill.description({ skillLevel: 1 })).toBe(
        'Gets 5 of one type of ingredient chosen randomly from a specific selection of ingredients.'
      );
      expect(skill.RP).toEqual([880, 1251, 1726, 2383, 3290, 4846, 5843]);
      expect(skill.maxLevel).toBe(7);
    });

    it('should have ingredients activation', () => {
      expect(skill.activations).toHaveProperty('ingredients');
      expect(skill.activations.ingredients.unit).toBe('ingredients');
      expect(typeof skill.activations.ingredients.amount).toBe('function');
    });

    it('should calculate correct activation amounts', () => {
      const level1Amount = skill.activations.ingredients.amount({ skillLevel: 1 });
      const level6Amount = skill.activations.ingredients.amount({ skillLevel: 6 });

      expect(level1Amount).toBe(5);
      expect(level6Amount).toBe(16);
    });

    it('should have ingredients unit only', () => {
      expect(skill.hasUnit('ingredients')).toBe(true);
      expect(skill.hasUnit('energy')).toBe(false);
      expect(skill.hasUnit('berries')).toBe(false);
    });

    it('should have specific RP values', () => {
      expect(skill.getRPValue(1)).toBe(880);
      expect(skill.getRPValue(3)).toBe(1726);
      expect(skill.getRPValue(6)).toBe(4846);
    });
  });
}
