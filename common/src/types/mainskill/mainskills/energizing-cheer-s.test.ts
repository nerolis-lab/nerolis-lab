import { describe, expect, it } from 'vitest';
import { EnergizingCheerS } from './energizing-cheer-s';

describe('EnergizingCheerS', () => {
  it('should have correct basic properties', () => {
    expect(EnergizingCheerS.name).toBe('Energizing Cheer S');
    expect(EnergizingCheerS.description({ skillLevel: 1 })).toBe(
      'Restores 14 Energy to one random Pokémon on your team.'
    );
    expect(EnergizingCheerS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546]);
    expect(EnergizingCheerS.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergizingCheerS.activations).toHaveProperty('energy');
    expect(EnergizingCheerS.activations.energy.unit).toBe('energy');
    expect(typeof EnergizingCheerS.activations.energy.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 1 })).toBe(14);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 2 })).toBe(17.1);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 3 })).toBe(22.5);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 4 })).toBe(28.8);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 5 })).toBe(38.2);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 6 })).toBe(50.6);
  });

  it('should have target lowest chance property', () => {
    expect(EnergizingCheerS.activations.energy.targetLowestChance).toBe(0.5);
  });

  it('should have energy unit only', () => {
    expect(EnergizingCheerS.hasUnit('energy')).toBe(true);
    expect(EnergizingCheerS.hasUnit('berries')).toBe(false);
    expect(EnergizingCheerS.hasUnit('ingredients')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(EnergizingCheerS.getRPValue(1)).toBe(880);
    expect(EnergizingCheerS.getRPValue(3)).toBe(1726);
    expect(EnergizingCheerS.getRPValue(6)).toBe(4546);
  });
});
