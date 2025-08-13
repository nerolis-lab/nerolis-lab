import { describe, expect, it } from 'vitest';
import { EnergyForEveryone } from './energy-for-everyone';

describe('EnergyForEveryone', () => {
  it('should have correct basic properties', () => {
    expect(EnergyForEveryone.name).toBe('Energy For Everyone');
    expect(EnergyForEveryone.description({ skillLevel: 1 })).toBe(
      'Restores 5 Energy to each helper Pokémon on your team.'
    );
    expect(EnergyForEveryone.RP).toEqual([1120, 1593, 2197, 3033, 4187, 5785]);
    expect(EnergyForEveryone.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryone.activations).toHaveProperty('energy');
    expect(EnergyForEveryone.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryone.activations.energy.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = EnergyForEveryone.activations.energy.amount({ skillLevel: 1 });
    const level6Amount = EnergyForEveryone.activations.energy.amount({ skillLevel: 6 });

    expect(level1Amount).toBe(5);
    expect(level6Amount).toBe(18.1);
  });

  it('should have energy unit only', () => {
    expect(EnergyForEveryone.hasUnit('energy')).toBe(true);
    expect(EnergyForEveryone.hasUnit('berries')).toBe(false);
    expect(EnergyForEveryone.hasUnit('ingredients')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(EnergyForEveryone.getRPValue(1)).toBe(1120);
    expect(EnergyForEveryone.getRPValue(3)).toBe(2197);
    expect(EnergyForEveryone.getRPValue(6)).toBe(5785);
  });
});
