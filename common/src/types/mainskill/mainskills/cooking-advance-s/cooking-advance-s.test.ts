import { describe, expect, it } from 'vitest';
import { CookingAdvanceS } from './cooking-advance-s';

describe('CookingAdvanceS', () => {
  it('should have correct basic properties', () => {
    expect(CookingAdvanceS.name).toBe('Cooking Advance S');
    expect(CookingAdvanceS.description({ skillLevel: 1 })).toBe(
      'Gives your pot room for 7 more ingredients next time you cook.'
    );
    expect(CookingAdvanceS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(CookingAdvanceS.maxLevel).toBe(7);
  });

  it('should have pot size activation', () => {
    expect(CookingAdvanceS.activations).toHaveProperty('potSize');
    expect(CookingAdvanceS.activations.potSize.unit).toBe('pot size');
    expect(typeof CookingAdvanceS.activations.potSize.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = CookingAdvanceS.activations.potSize.amount({ skillLevel: 1 });
    const level7Amount = CookingAdvanceS.activations.potSize.amount({ skillLevel: 7 });

    expect(level1Amount).toBe(7);
    expect(level7Amount).toBe(31);
  });

  it('should have cooking unit only', () => {
    expect(CookingAdvanceS.hasUnit('pot size')).toBe(true);
    expect(CookingAdvanceS.hasUnit('energy')).toBe(false);
    expect(CookingAdvanceS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(CookingAdvanceS.getRPValue(1)).toBe(880);
    expect(CookingAdvanceS.getRPValue(4)).toBe(2383);
    expect(CookingAdvanceS.getRPValue(7)).toBe(5843);
  });
});
