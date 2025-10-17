import { describe, expect, it } from 'vitest';
import { EnergizingCheerS } from './energizing-cheer-s';

describe('EnergizingCheerS', () => {
  it('should have correct basic properties', () => {
    expect(EnergizingCheerS.name).toBe('Energizing Cheer S');
    expect(EnergizingCheerS.description({ skillLevel: 1 })).toBe(
      'Restores 12 Energy to one random Pokémon on your team.'
    );
    expect(EnergizingCheerS.RP).toEqual([766, 1089, 1502, 2074, 2863, 3956]);
    expect(EnergizingCheerS.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergizingCheerS.activations).toHaveProperty('energy');
    expect(EnergizingCheerS.activations.energy.unit).toBe('energy');
    expect(typeof EnergizingCheerS.activations.energy.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 1 })).toBe(12);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 2 })).toBe(15);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 3 })).toBe(20);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 4 })).toBe(25);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 5 })).toBe(33);
    expect(EnergizingCheerS.activations.energy.amount({ skillLevel: 6 })).toBe(44);
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
    expect(EnergizingCheerS.getRPValue(1)).toBe(766);
    expect(EnergizingCheerS.getRPValue(3)).toBe(1502);
    expect(EnergizingCheerS.getRPValue(6)).toBe(3956);
  });
});
