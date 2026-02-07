import { describe, expect, it } from 'vitest';
import { EnergizingCheerSNuzzle } from './energizing-cheer-s-nuzzle';

describe('EnergizingCheerSNuzzle', () => {
  it('should have correct basic properties', () => {
    expect(EnergizingCheerSNuzzle.name).toBe('Nuzzle (Energizing Cheer S)');
    expect(EnergizingCheerSNuzzle.description({ skillLevel: 1 })).toBe(
      "Restores 9 Energy to one random Pokémon on your team. If you're lucky, that Pokémon will also gain a main skill activation bonus."
    );
    expect(EnergizingCheerSNuzzle.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergizingCheerSNuzzle.activations).toHaveProperty('energy');
    expect(EnergizingCheerSNuzzle.activations.energy.unit).toBe('energy');
    expect(typeof EnergizingCheerSNuzzle.activations.energy.amount).toBe('function');
  });

  it('should have skill helps activation', () => {
    expect(EnergizingCheerSNuzzle.activations).toHaveProperty('skillHelps');
    expect(EnergizingCheerSNuzzle.activations.skillHelps.unit).toBe('skill helps');
    expect(typeof EnergizingCheerSNuzzle.activations.skillHelps.amount).toBe('function');
  });

  it('should have target lowest chance property', () => {
    expect(EnergizingCheerSNuzzle.activations.energy.targetLowestChance).toBe(0.5);
  });
});
