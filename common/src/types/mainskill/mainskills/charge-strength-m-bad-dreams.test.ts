import { describe, expect, it } from 'vitest';
import { ChargeStrengthM } from './charge-strength-m';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';

describe('ChargeStrengthMBadDreams', () => {
  it('should have modified name format', () => {
    expect(ChargeStrengthMBadDreams.name).toBe('Bad Dreams (Charge Strength M)');
    expect(ChargeStrengthMBadDreams.modifierName).toBe('Bad Dreams');
    expect(ChargeStrengthMBadDreams.baseSkill).toBe(ChargeStrengthM);
  });

  it('should have correct basic properties', () => {
    expect(ChargeStrengthMBadDreams.name).toBe('Bad Dreams (Charge Strength M)');
    expect(ChargeStrengthMBadDreams.description({ skillLevel: 1 })).toBe(
      "Increases Snorlax's Strength by 2640, but at the same time, reduces the Energy of helper Pokémon on your team that aren't Dark type by 12."
    );
    expect(ChargeStrengthMBadDreams.RP).toEqual([2400, 3313, 4643, 6441, 8864, 11878, 13140]);
    expect(ChargeStrengthMBadDreams.maxLevel).toBe(7);
  });

  it('should have strength activation with team energy reduction', () => {
    expect(ChargeStrengthMBadDreams.activations).toHaveProperty('strength');
    expect(ChargeStrengthMBadDreams.activations.strength.unit).toBe('strength');
    expect(typeof ChargeStrengthMBadDreams.activations.strength.amount).toBe('function');
    expect(ChargeStrengthMBadDreams.activations.strength.teamEnergyReduction).toBe(12);
  });

  it('should calculate correct strength amounts', () => {
    expect(ChargeStrengthMBadDreams.activations.strength.amount({ skillLevel: 1 })).toBe(2640);
    expect(ChargeStrengthMBadDreams.activations.strength.amount({ skillLevel: 3 })).toBe(5178);
    expect(ChargeStrengthMBadDreams.activations.strength.amount({ skillLevel: 7 })).toBe(17304);
  });

  it('should have specific RP values', () => {
    expect(ChargeStrengthMBadDreams.getRPValue(1)).toBe(2400);
    expect(ChargeStrengthMBadDreams.getRPValue(3)).toBe(4643);
    expect(ChargeStrengthMBadDreams.getRPValue(6)).toBe(11878);
  });
});
