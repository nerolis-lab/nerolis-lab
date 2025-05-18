import { describe, expect, it } from 'vitest';
import { BerryBurst } from './berry-burst';
import { BerryBurstDisguise } from './berry-burst-disguise';

describe('BerryBurstDisguise', () => {
  it('should have modified name format', () => {
    expect(BerryBurstDisguise.name).toBe('Disguise (Berry Burst)');
    expect(BerryBurstDisguise.modifierName).toBe('Disguise');
    expect(BerryBurstDisguise.baseSkill).toBe(BerryBurst);
  });

  it('should have modified RP values and description', () => {
    expect(BerryBurstDisguise.RP).toEqual([1400, 1991, 2747, 3791, 5234, 7232]);
    expect(BerryBurstDisguise.maxLevel).toBe(6);
    expect(BerryBurstDisguise.description(1)).toContain(
      'Gets 8 Berries plus 1 of each of the Berries other Pokémon on your team collect'
    );
  });

  it('should have enhanced activations with crit properties', () => {
    const activation = BerryBurstDisguise.activations.berries;
    expect(activation.unit).toBe('berries');
    expect(typeof activation.amount).toBe('function');
    expect(typeof activation.teamAmount).toBe('function');
    expect(activation.critChance).toBe(0.185);
    expect(activation.critMultiplier).toBe(3);
  });

  it('should calculate team amounts correctly', () => {
    const activation = BerryBurstDisguise.activations.berries;
    expect(activation.teamAmount(1)).toBe(1);
    expect(activation.teamAmount(6)).toBe(5);
  });

  it('should calculate activation amounts correctly', () => {
    const activation = BerryBurstDisguise.activations.berries;
    expect(activation.amount(1)).toBe(8);
    expect(activation.amount(6)).toBe(21);
  });
});
