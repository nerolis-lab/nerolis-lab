import { describe, expect, it } from 'vitest';
import { ChargeEnergySMoonlight } from './charge-energy-s-moonlight';
import { ChargeEnergyS } from './charge-energy-s';

describe('ChargeEnergySMoonlight', () => {
  it('should have modified name format', () => {
    expect(ChargeEnergySMoonlight.name).toBe('Moonlight (Charge Energy S)');
    expect(ChargeEnergySMoonlight.modifierName).toBe('Moonlight');
    expect(ChargeEnergySMoonlight.baseSkill).toBe(ChargeEnergyS);
  });

  it('should have modified RP values', () => {
    expect(ChargeEnergySMoonlight.RP).toEqual([560, 797, 1099, 1516, 2094, 2892]);
    expect(ChargeEnergySMoonlight.maxLevel).toBe(6);
  });

  it('should have enhanced activations with crit properties', () => {
    const activation = ChargeEnergySMoonlight.activations.energy;
    expect(activation.unit).toBe('energy');
    expect(typeof activation.amount).toBe('function');
    expect(activation.critChance).toBe(0.5);
    expect(typeof activation.critAmount).toBe('function');
  });

  it('should calculate crit amounts correctly', () => {
    const activation = ChargeEnergySMoonlight.activations.energy;
    const level1CritAmount = activation.critAmount!({ skillLevel: 1 });
    const level6CritAmount = activation.critAmount!({ skillLevel: 6 });

    expect(level1CritAmount).toBe(6.3);
    expect(level6CritAmount).toBe(22.8);
  });

  it('should have same base activation amounts as base skill', () => {
    // The base activation amounts should match the base skill
    expect(ChargeEnergySMoonlight.activations.energy.amount({ skillLevel: 1 })).toBe(
      ChargeEnergyS.activations.energy.amount({ skillLevel: 1 })
    );
    expect(ChargeEnergySMoonlight.activations.energy.amount({ skillLevel: 6 })).toBe(
      ChargeEnergyS.activations.energy.amount({ skillLevel: 6 })
    );
  });
});
