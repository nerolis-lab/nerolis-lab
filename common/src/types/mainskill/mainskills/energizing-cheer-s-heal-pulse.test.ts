import { describe, expect, it } from 'vitest';
import { EnergizingCheerSHealPulse } from './energizing-cheer-s-heal-pulse';

describe('EnergizingCheerSHealPulse', () => {
  it('should have correct basic properties', () => {
    expect(EnergizingCheerSHealPulse.name).toBe('Heal Pulse (Energizing Cheer S)');
    expect(EnergizingCheerSHealPulse.description({ skillLevel: 1 })).toBe(
      'Restores 6 Energy to two random Pokémon on your team and instantly gets you ×1 the usual help from those Pokémon. Meet certain conditions to boost effect.'
    );
    expect(EnergizingCheerSHealPulse.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergizingCheerSHealPulse.activations).toHaveProperty('energy');
    expect(EnergizingCheerSHealPulse.activations.energy.unit).toBe('energy');
    expect(typeof EnergizingCheerSHealPulse.activations.energy.amount).toBe('function');
  });

  it('should have extra helps activation', () => {
    expect(EnergizingCheerSHealPulse.activations).toHaveProperty('extraHelps');
    expect(EnergizingCheerSHealPulse.activations.extraHelps.unit).toBe('helps');
    expect(typeof EnergizingCheerSHealPulse.activations.extraHelps.amount).toBe('function');
  });

  it('should have target lowest chance property', () => {
    // without this, the energy would target all mons
    expect(EnergizingCheerSHealPulse.chanceToTargetLowestMembers).toBe(0);
  });
});
