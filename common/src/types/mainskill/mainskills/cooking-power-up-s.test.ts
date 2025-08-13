import { describe, expect, it } from 'vitest';
import { CookingPowerUpS } from './cooking-power-up-s';

describe('CookingPowerUpS', () => {
  it('should have correct basic properties', () => {
    expect(CookingPowerUpS.name).toBe('Cooking Power-Up S');
    expect(CookingPowerUpS.description({ skillLevel: 1 })).toBe(
      'Increases the quantity of Cooking items you get by 7.'
    );
    expect(CookingPowerUpS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(CookingPowerUpS.maxLevel).toBe(7);
  });

  it('should have pot size activation', () => {
    expect(CookingPowerUpS.activations).toHaveProperty('potSize');
    expect(CookingPowerUpS.activations.potSize.unit).toBe('pot size');
    expect(typeof CookingPowerUpS.activations.potSize.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = CookingPowerUpS.activations.potSize.amount({ skillLevel: 1 });
    const level7Amount = CookingPowerUpS.activations.potSize.amount({ skillLevel: 7 });

    expect(level1Amount).toBe(7);
    expect(level7Amount).toBe(31);
  });

  it('should have cooking unit only', () => {
    expect(CookingPowerUpS.hasUnit('pot size')).toBe(true);
    expect(CookingPowerUpS.hasUnit('energy')).toBe(false);
    expect(CookingPowerUpS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(CookingPowerUpS.getRPValue(1)).toBe(880);
    expect(CookingPowerUpS.getRPValue(4)).toBe(2383);
    expect(CookingPowerUpS.getRPValue(7)).toBe(5843);
  });
});
