import { describe, expect, it } from 'vitest';
import { ChargeStrengthM } from './charge-strength-m';

describe('ChargeStrengthM', () => {
  it('should have correct basic properties', () => {
    expect(ChargeStrengthM.name).toBe('Charge Strength M');
    expect(ChargeStrengthM.description(1)).toBe("Increases Snorlax's Strength by 880.");
    expect(ChargeStrengthM.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(ChargeStrengthM.maxLevel).toBe(7);
  });

  it('should have strength activation', () => {
    expect(ChargeStrengthM.activations).toHaveProperty('strength');
    expect(ChargeStrengthM.activations.strength.unit).toBe('strength');
    expect(typeof ChargeStrengthM.activations.strength.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    expect(ChargeStrengthM.activations.strength.amount(1)).toBe(880);
    expect(ChargeStrengthM.activations.strength.amount(2)).toBe(1251);
    expect(ChargeStrengthM.activations.strength.amount(3)).toBe(1726);
    expect(ChargeStrengthM.activations.strength.amount(4)).toBe(2383);
    expect(ChargeStrengthM.activations.strength.amount(5)).toBe(3290);
    expect(ChargeStrengthM.activations.strength.amount(6)).toBe(4546);
    expect(ChargeStrengthM.activations.strength.amount(7)).toBe(6409);
  });

  it('should have strength unit only', () => {
    expect(ChargeStrengthM.hasUnit('strength')).toBe(true);
    expect(ChargeStrengthM.hasUnit('energy')).toBe(false);
    expect(ChargeStrengthM.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(ChargeStrengthM.getRPValue(1)).toBe(880);
    expect(ChargeStrengthM.getRPValue(4)).toBe(2383);
    expect(ChargeStrengthM.getRPValue(7)).toBe(5843);
  });
});
