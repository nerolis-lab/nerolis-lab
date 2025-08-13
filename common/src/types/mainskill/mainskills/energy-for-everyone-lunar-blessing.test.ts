import { describe, expect, it } from 'vitest';
import { EnergyForEveryone } from './energy-for-everyone';
import { EnergyForEveryoneLunarBlessing } from './energy-for-everyone-lunar-blessing';

describe('EnergyForEveryoneLunarBlessing', () => {
  it('should have modified name format', () => {
    expect(EnergyForEveryoneLunarBlessing.name).toBe('Lunar Blessing (Energy For Everyone)');
    expect(EnergyForEveryoneLunarBlessing.modifierName).toBe('Lunar Blessing');
    expect(EnergyForEveryoneLunarBlessing.baseSkill).toBe(EnergyForEveryone);
  });

  it('should have correct basic properties', () => {
    expect(EnergyForEveryoneLunarBlessing.name).toBe('Lunar Blessing (Energy For Everyone)');
    expect(EnergyForEveryoneLunarBlessing.description({ skillLevel: 1 })).toBe(
      'Restores 3 Energy to all helper Pokémon on your team plus gives 1 - 14 of each of the Berries other Pokémon on your team collect.'
    );
    expect(EnergyForEveryoneLunarBlessing.RP).toEqual([1400, 1991, 2747, 3791, 5234, 7232]);
    expect(EnergyForEveryoneLunarBlessing.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryoneLunarBlessing.activations).toHaveProperty('energy');
    expect(EnergyForEveryoneLunarBlessing.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryoneLunarBlessing.activations.energy.amount).toBe('function');
  });

  it('should have selfBerries activation', () => {
    expect(EnergyForEveryoneLunarBlessing.activations).toHaveProperty('selfBerries');
    expect(EnergyForEveryoneLunarBlessing.activations.selfBerries.unit).toBe('berries');
    expect(typeof EnergyForEveryoneLunarBlessing.activations.selfBerries.amount).toBe('function');
  });

  it('should have teamBerries activation', () => {
    expect(EnergyForEveryoneLunarBlessing.activations).toHaveProperty('teamBerries');
    expect(EnergyForEveryoneLunarBlessing.activations.teamBerries.unit).toBe('berries');
    expect(typeof EnergyForEveryoneLunarBlessing.activations.teamBerries.amount).toBe('function');
  });

  it('should calculate correct energy amounts', () => {
    expect(EnergyForEveryoneLunarBlessing.activations.energy.amount({ skillLevel: 1 })).toBe(3);
    expect(EnergyForEveryoneLunarBlessing.activations.energy.amount({ skillLevel: 3 })).toBe(5);
    expect(EnergyForEveryoneLunarBlessing.activations.energy.amount({ skillLevel: 6 })).toBe(11);
  });

  it('should calculate correct self berry amounts with unique count', () => {
    expect(EnergyForEveryoneLunarBlessing.activations.selfBerries.amount({ skillLevel: 1, extra: 1 })).toBe(5);
    expect(EnergyForEveryoneLunarBlessing.activations.selfBerries.amount({ skillLevel: 6, extra: 3 })).toBe(30);
    expect(EnergyForEveryoneLunarBlessing.activations.selfBerries.amount({ skillLevel: 6, extra: 5 })).toBe(32);
  });

  it('should calculate correct team berry amounts with unique count', () => {
    expect(EnergyForEveryoneLunarBlessing.activations.teamBerries.amount({ skillLevel: 1, extra: 1 })).toBe(1);
    expect(EnergyForEveryoneLunarBlessing.activations.teamBerries.amount({ skillLevel: 6, extra: 3 })).toBe(4);
    expect(EnergyForEveryoneLunarBlessing.activations.teamBerries.amount({ skillLevel: 6, extra: 5 })).toBe(9);
  });

  it('should have specific RP values', () => {
    expect(EnergyForEveryoneLunarBlessing.getRPValue(1)).toBe(1400);
    expect(EnergyForEveryoneLunarBlessing.getRPValue(3)).toBe(2747);
    expect(EnergyForEveryoneLunarBlessing.getRPValue(6)).toBe(7232);
  });
});
