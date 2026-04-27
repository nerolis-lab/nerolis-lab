import { describe, expect, it } from 'vitest';
import { HelperBoost } from './helper-boost';

describe('HelperBoost', () => {
  it('should have correct basic properties', () => {
    expect(HelperBoost.name).toBe('Helper Boost');
    expect(HelperBoost.description({ skillLevel: 1 })).toBe(
      'Instantly gets you ×2 the usual help from all Pokémon on your team. Meet certain conditions to boost effect.'
    );
    expect(HelperBoost.RP).toEqual([2800, 3902, 5273, 6975, 9317, 12438]);
    expect(HelperBoost.maxLevel).toBe(6);
  });

  it('should have helps activation', () => {
    expect(HelperBoost.activations).toHaveProperty('helps');
    expect(HelperBoost.activations.helps.unit).toBe('helps');
    expect(typeof HelperBoost.activations.helps.amount).toBe('function');
  });

  it('should calculate base help amounts correctly', () => {
    expect(HelperBoost.baseAmounts).toEqual([2, 3, 3, 4, 4, 5]);
  });

  it('should calculate help amounts with unique count 1 (base amounts)', () => {
    expect(HelperBoost.activations.helps.amount({ skillLevel: 1, extra: 1 })).toBe(2);
    expect(HelperBoost.activations.helps.amount({ skillLevel: 2, extra: 1 })).toBe(3);
    expect(HelperBoost.activations.helps.amount({ skillLevel: 3, extra: 1 })).toBe(3);
    expect(HelperBoost.activations.helps.amount({ skillLevel: 4, extra: 1 })).toBe(4);
    expect(HelperBoost.activations.helps.amount({ skillLevel: 5, extra: 1 })).toBe(4);
    expect(HelperBoost.activations.helps.amount({ skillLevel: 6, extra: 1 })).toBe(5);
  });

  it('should calculate help amounts with unique count 3 (boosted)', () => {
    expect(HelperBoost.activations.helps.amount({ skillLevel: 1, extra: 3 })).toBe(3); // 2 + 1
    expect(HelperBoost.activations.helps.amount({ skillLevel: 2, extra: 3 })).toBe(4); // 3 + 1
    expect(HelperBoost.activations.helps.amount({ skillLevel: 3, extra: 3 })).toBe(5); // 3 + 2
    expect(HelperBoost.activations.helps.amount({ skillLevel: 4, extra: 3 })).toBe(6); // 4 + 2
    expect(HelperBoost.activations.helps.amount({ skillLevel: 5, extra: 3 })).toBe(7); // 4 + 3
    expect(HelperBoost.activations.helps.amount({ skillLevel: 6, extra: 3 })).toBe(8); // 5 + 3
  });

  it('should calculate help amounts with unique count 5 (maximum boost)', () => {
    expect(HelperBoost.activations.helps.amount({ skillLevel: 1, extra: 5 })).toBe(6); // 2 + 4
    expect(HelperBoost.activations.helps.amount({ skillLevel: 2, extra: 5 })).toBe(7); // 3 + 4
    expect(HelperBoost.activations.helps.amount({ skillLevel: 3, extra: 5 })).toBe(8); // 3 + 5
    expect(HelperBoost.activations.helps.amount({ skillLevel: 4, extra: 5 })).toBe(9); // 4 + 5
    expect(HelperBoost.activations.helps.amount({ skillLevel: 5, extra: 5 })).toBe(10); // 4 + 6
    expect(HelperBoost.activations.helps.amount({ skillLevel: 6, extra: 5 })).toBe(11); // 5 + 6
  });

  it('should have helps unit only', () => {
    expect(HelperBoost.hasUnit('helps')).toBe(true);
    expect(HelperBoost.hasUnit('energy')).toBe(false);
    expect(HelperBoost.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(HelperBoost.getRPValue(1)).toBe(2800);
    expect(HelperBoost.getRPValue(3)).toBe(5273);
    expect(HelperBoost.getRPValue(6)).toBe(12438);
  });

  it('should have getHelps method working correctly', () => {
    expect(HelperBoost.getHelps(1, 1)).toBe(2);
    expect(HelperBoost.getHelps(6, 3)).toBe(8);
    expect(HelperBoost.getHelps(6, 5)).toBe(11);
  });
});
