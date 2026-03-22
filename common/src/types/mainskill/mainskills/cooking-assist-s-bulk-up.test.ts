import { describe, expect, it } from 'vitest';
import { CookingAssistS } from './cooking-assist-s';
import { CookingAssistSBulkUp } from './cooking-assist-s-bulk-up';

describe('CookingAssistSBulkUp', () => {
  it('should have modified name format', () => {
    expect(CookingAssistSBulkUp.name).toBe('Bulk Up (Cooking Assist S)');
    expect(CookingAssistSBulkUp.modifierName).toBe('Bulk Up');
    expect(CookingAssistSBulkUp.baseSkill).toBe(CookingAssistS);
  });

  it('should have correct basic properties', () => {
    expect(CookingAssistSBulkUp.description({ skillLevel: 1 })).toBe(
      'Gets you 6 ingredients chosen at random. Also raises your Extra Tasty rate by 1%. The effect lasts until you cook an Extra Tasty dish or change sites.'
    );
    expect(CookingAssistSBulkUp.maxLevel).toBe(7);
  });

  it('should have specific RP values', () => {
    expect(CookingAssistSBulkUp.getRPValue(1)).toBe(1144);
    expect(CookingAssistSBulkUp.getRPValue(4)).toBe(3098);
    expect(CookingAssistSBulkUp.getRPValue(7)).toBe(7596);
  });

  it('should have ingredient and tasty chance activations', () => {
    expect(CookingAssistSBulkUp.activations).toHaveProperty('ingredients');
    expect(CookingAssistSBulkUp.activations.ingredients.unit).toBe('ingredients');
    expect(typeof CookingAssistSBulkUp.activations.ingredients.amount).toBe('function');

    expect(CookingAssistSBulkUp.activations).toHaveProperty('critChance');
    expect(CookingAssistSBulkUp.activations.critChance.unit).toBe('crit chance');
    expect(typeof CookingAssistSBulkUp.activations.critChance.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    expect(CookingAssistSBulkUp.activations.ingredients.amount({ skillLevel: 1 })).toBe(6);
    expect(CookingAssistSBulkUp.activations.ingredients.amount({ skillLevel: 4 })).toBe(14);
    expect(CookingAssistSBulkUp.activations.ingredients.amount({ skillLevel: 7 })).toBe(24);

    expect(CookingAssistSBulkUp.activations.critChance.amount({ skillLevel: 1 })).toBe(1);
    expect(CookingAssistSBulkUp.activations.critChance.amount({ skillLevel: 4 })).toBe(3);
    expect(CookingAssistSBulkUp.activations.critChance.amount({ skillLevel: 7 })).toBe(5);
  });

  it('should have both units', () => {
    expect(CookingAssistSBulkUp.hasUnit('ingredients')).toBe(true);
    expect(CookingAssistSBulkUp.hasUnit('crit chance')).toBe(true);
    expect(CookingAssistSBulkUp.hasUnit('energy')).toBe(false);
  });
});
