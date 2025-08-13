import { describe, expect, it } from 'vitest';
import { ChargeStrengthS } from './charge-strength-s';

describe('ChargeStrengthS', () => {
  it('should have correct basic properties', () => {
    expect(ChargeStrengthS.name).toBe('Charge Strength S');
    expect(ChargeStrengthS.description({ skillLevel: 1 })).toBe("Increases Snorlax's Strength by 400.");
    expect(ChargeStrengthS.RP).toEqual([400, 569, 785, 1083, 1496, 2066, 2656]);
    expect(ChargeStrengthS.maxLevel).toBe(7);
  });

  it('should have strength activation', () => {
    expect(ChargeStrengthS.activations).toHaveProperty('strength');
    expect(ChargeStrengthS.activations.strength.unit).toBe('strength');
    expect(typeof ChargeStrengthS.activations.strength.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = ChargeStrengthS.activations.strength.amount({ skillLevel: 1 });
    const level6Amount = ChargeStrengthS.activations.strength.amount({ skillLevel: 6 });

    expect(level1Amount).toBe(400);
    expect(level6Amount).toBe(2066);
  });

  it('should have correct boost amounts at different levels', () => {
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 1 })).toBe(400);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 2 })).toBe(569);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 3 })).toBe(785);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 4 })).toBe(1083);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 5 })).toBe(1496);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 6 })).toBe(2066);
    expect(ChargeStrengthS.activations.strength.amount({ skillLevel: 7 })).toBe(3002);
  });

  it('should have strength unit only', () => {
    expect(ChargeStrengthS.hasUnit('strength')).toBe(true);
    expect(ChargeStrengthS.hasUnit('energy')).toBe(false);
    expect(ChargeStrengthS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(ChargeStrengthS.getRPValue(1)).toBe(400);
    expect(ChargeStrengthS.getRPValue(3)).toBe(785);
    expect(ChargeStrengthS.getRPValue(6)).toBe(2066);
  });
});
