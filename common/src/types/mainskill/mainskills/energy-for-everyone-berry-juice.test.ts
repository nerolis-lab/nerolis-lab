import { describe, expect, it } from 'vitest';
import { EnergyForEveryone } from './energy-for-everyone';
import { EnergyForEveryoneBerryJuice } from './energy-for-everyone-berry-juice';

describe('EnergyForEveryoneBerryJuice', () => {
  it('should have modified name format', () => {
    expect(EnergyForEveryoneBerryJuice.name).toBe('Berry Juice (Energy For Everyone)');
    expect(EnergyForEveryoneBerryJuice.modifierName).toBe('Berry Juice');
    expect(EnergyForEveryoneBerryJuice.baseSkill).toBe(EnergyForEveryone);
  });

  it('should have correct basic properties', () => {
    expect(EnergyForEveryoneBerryJuice.description({ skillLevel: 1 })).toBe(
      'Restores 5 Energy to all helper Pokémon on your team. Sometimes additionally gets you a Berry Juice.'
    );
    expect(EnergyForEveryoneBerryJuice.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryoneBerryJuice.activations).toHaveProperty('energy');
    expect(EnergyForEveryoneBerryJuice.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryoneBerryJuice.activations.energy.amount).toBe('function');
  });

  it('should have juice activation', () => {
    expect(EnergyForEveryoneBerryJuice.activations).toHaveProperty('juice');
    expect(EnergyForEveryoneBerryJuice.activations.juice.unit).toBe('items');
    expect(typeof EnergyForEveryoneBerryJuice.activations.juice.amount).toBe('function');
  });
});
