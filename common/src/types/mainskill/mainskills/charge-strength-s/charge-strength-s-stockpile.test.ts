import { describe, expect, it } from 'vitest';
import { ChargeStrengthS } from './charge-strength-s';
import { ChargeStrengthSStockpile } from './charge-strength-s-stockpile';

describe('ChargeStrengthSStockpile', () => {
  it('should have modified name format', () => {
    expect(ChargeStrengthSStockpile.name).toBe('Stockpile (Charge Strength S)');
    expect(ChargeStrengthSStockpile.modifierName).toBe('Stockpile');
    expect(ChargeStrengthSStockpile.baseSkill).toBe(ChargeStrengthS);
  });

  it('should have correct basic properties', () => {
    expect(ChargeStrengthSStockpile.name).toBe('Stockpile (Charge Strength S)');
    expect(ChargeStrengthSStockpile.description({ skillLevel: 1 })).toBe(
      "Stockpile or Spit Up is selected. When Spit Up triggers, Snorlax gains Strength from Stockpile's number."
    );
    expect(ChargeStrengthSStockpile.RP).toEqual([600, 853, 1177, 1625, 2243, 3099, 3984]);
    expect(ChargeStrengthSStockpile.maxLevel).toBe(7);
  });

  it('should have strength activation with crit chance', () => {
    expect(ChargeStrengthSStockpile.activations).toHaveProperty('strength');
    expect(ChargeStrengthSStockpile.activations.strength.unit).toBe('strength');
    expect(typeof ChargeStrengthSStockpile.activations.strength.amount).toBe('function');
    expect(ChargeStrengthSStockpile.activations.strength.critChance).toBe(0.2674);
  });

  it('should calculate correct strength amounts', () => {
    expect(ChargeStrengthSStockpile.activations.strength.amount({ skillLevel: 1 })).toBe(600);
    expect(ChargeStrengthSStockpile.activations.strength.amount({ skillLevel: 4 })).toBe(1625);
    expect(ChargeStrengthSStockpile.activations.strength.amount({ skillLevel: 7 })).toBe(4497);
  });

  it('should have spit up amounts for all skill levels', () => {
    expect(ChargeStrengthSStockpile.spitUpAmounts).toHaveProperty('1');
    expect(ChargeStrengthSStockpile.spitUpAmounts).toHaveProperty('7');
    expect(ChargeStrengthSStockpile.spitUpAmounts[1]).toHaveLength(11);
    expect(ChargeStrengthSStockpile.spitUpAmounts[7]).toHaveLength(11);
  });

  it('should get correct spit up strength values', () => {
    const level1SpitUp = ChargeStrengthSStockpile.getSpitUpStrength(1);
    expect(level1SpitUp).toEqual([600, 1020, 1500, 2040, 2640, 3300, 4020, 4920, 6480, 8880, 12120]);

    const level7SpitUp = ChargeStrengthSStockpile.getSpitUpStrength(7);
    expect(level7SpitUp).toEqual([4502, 7653, 11255, 15307, 19809, 24761, 30163, 36916, 48621, 66629, 90940]);
  });

  it('should have specific RP values', () => {
    expect(ChargeStrengthSStockpile.getRPValue(1)).toBe(600);
    expect(ChargeStrengthSStockpile.getRPValue(4)).toBe(1625);
    expect(ChargeStrengthSStockpile.getRPValue(7)).toBe(3984);
  });
});
