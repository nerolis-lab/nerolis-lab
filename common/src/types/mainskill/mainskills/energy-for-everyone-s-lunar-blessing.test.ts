import { describe, expect, it } from 'vitest';
import { EnergyForEveryoneS } from './energy-for-everyone-s';
import { EnergyForEveryoneSLunarBlessing } from './energy-for-everyone-s-lunar-blessing';

describe('EnergyForEveryoneSLunarBlessing', () => {
  it('should have modified name format', () => {
    expect(EnergyForEveryoneSLunarBlessing.name).toBe('Lunar Blessing (Energy For Everyone S)');
    expect(EnergyForEveryoneSLunarBlessing.modifierName).toBe('Lunar Blessing');
    expect(EnergyForEveryoneSLunarBlessing.baseSkill).toBe(EnergyForEveryoneS);
  });

  it('should have correct basic properties', () => {
    expect(EnergyForEveryoneSLunarBlessing.name).toBe('Lunar Blessing (Energy For Everyone S)');
    expect(EnergyForEveryoneSLunarBlessing.description({ skillLevel: 1 })).toBe(
      'Restores 3 Energy to all helper Pokémon on your team plus gives 1 - 14 of each of the Berries other Pokémon on your team collect.'
    );
    expect(EnergyForEveryoneSLunarBlessing.RP).toEqual([1400, 1991, 2747, 3791, 5234, 7232]);
    expect(EnergyForEveryoneSLunarBlessing.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations).toHaveProperty('energy');
    expect(EnergyForEveryoneSLunarBlessing.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryoneSLunarBlessing.activations.energy.amount).toBe('function');
  });

  it('should have selfBerries activation', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations).toHaveProperty('selfBerries');
    expect(EnergyForEveryoneSLunarBlessing.activations.selfBerries.unit).toBe('berries');
    expect(typeof EnergyForEveryoneSLunarBlessing.activations.selfBerries.amount).toBe('function');
  });

  it('should have teamBerries activation', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations).toHaveProperty('teamBerries');
    expect(EnergyForEveryoneSLunarBlessing.activations.teamBerries.unit).toBe('berries');
    expect(typeof EnergyForEveryoneSLunarBlessing.activations.teamBerries.amount).toBe('function');
  });

  it('should calculate correct energy amounts', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations.energy.amount({ skillLevel: 1 })).toBe(3);
    expect(EnergyForEveryoneSLunarBlessing.activations.energy.amount({ skillLevel: 3 })).toBe(5);
    expect(EnergyForEveryoneSLunarBlessing.activations.energy.amount({ skillLevel: 6 })).toBe(11);
  });

  it('should calculate correct self berry amounts with unique count', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations.selfBerries.amount({ skillLevel: 1, extra: 1 })).toBe(5);
    expect(EnergyForEveryoneSLunarBlessing.activations.selfBerries.amount({ skillLevel: 6, extra: 3 })).toBe(30);
    expect(EnergyForEveryoneSLunarBlessing.activations.selfBerries.amount({ skillLevel: 6, extra: 5 })).toBe(32);
  });

  it('should calculate correct team berry amounts with unique count', () => {
    expect(EnergyForEveryoneSLunarBlessing.activations.teamBerries.amount({ skillLevel: 1, extra: 1 })).toBe(1);
    expect(EnergyForEveryoneSLunarBlessing.activations.teamBerries.amount({ skillLevel: 6, extra: 3 })).toBe(4);
    expect(EnergyForEveryoneSLunarBlessing.activations.teamBerries.amount({ skillLevel: 6, extra: 5 })).toBe(9);
  });

  it('should have specific RP values', () => {
    expect(EnergyForEveryoneSLunarBlessing.getRPValue(1)).toBe(1400);
    expect(EnergyForEveryoneSLunarBlessing.getRPValue(3)).toBe(2747);
    expect(EnergyForEveryoneSLunarBlessing.getRPValue(6)).toBe(7232);
  });
});
