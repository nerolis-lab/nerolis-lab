import { describe, expect, it } from 'vitest';
import { EnergyForEveryoneS } from './energy-for-everyone-s';

describe('EnergyForEveryoneS', () => {
  it('should have correct basic properties', () => {
    expect(EnergyForEveryoneS.name).toBe('Energy For Everyone S');
    expect(EnergyForEveryoneS.description({ skillLevel: 1 })).toBe(
      'Restores 5 Energy to each helper Pokémon on your team.'
    );
    expect(EnergyForEveryoneS.RP).toEqual([1120, 1593, 2197, 3033, 4187, 5785]);
    expect(EnergyForEveryoneS.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryoneS.activations).toHaveProperty('energy');
    expect(EnergyForEveryoneS.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryoneS.activations.energy.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = EnergyForEveryoneS.activations.energy.amount({ skillLevel: 1 });
    const level6Amount = EnergyForEveryoneS.activations.energy.amount({ skillLevel: 6 });

    expect(level1Amount).toBe(5);
    expect(level6Amount).toBe(18.1);
  });

  it('should have energy unit only', () => {
    expect(EnergyForEveryoneS.hasUnit('energy')).toBe(true);
    expect(EnergyForEveryoneS.hasUnit('berries')).toBe(false);
    expect(EnergyForEveryoneS.hasUnit('ingredients')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(EnergyForEveryoneS.getRPValue(1)).toBe(1120);
    expect(EnergyForEveryoneS.getRPValue(3)).toBe(2197);
    expect(EnergyForEveryoneS.getRPValue(6)).toBe(5785);
  });
});
