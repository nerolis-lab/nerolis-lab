import { describe, expect, it } from 'vitest';
import { EnergyForEveryoneS } from './energy-for-everyone-s';
import { EnergyForEveryoneSBerryJuice } from './energy-for-everyone-s-berry-juice';

describe('EnergyForEveryoneSBerryJuice', () => {
  it('should have modified name format', () => {
    expect(EnergyForEveryoneSBerryJuice.name).toBe('Berry Juice (Energy For Everyone S)');
    expect(EnergyForEveryoneSBerryJuice.modifierName).toBe('Berry Juice');
    expect(EnergyForEveryoneSBerryJuice.baseSkill).toBe(EnergyForEveryoneS);
  });

  it('should have correct basic properties', () => {
    expect(EnergyForEveryoneSBerryJuice.description({ skillLevel: 1 })).toBe(
      'Restores 5 Energy to all helper Pokémon on your team. Sometimes additionally gets you a Berry Juice.'
    );
    expect(EnergyForEveryoneSBerryJuice.maxLevel).toBe(6);
  });

  it('should have energy activation', () => {
    expect(EnergyForEveryoneSBerryJuice.activations).toHaveProperty('energy');
    expect(EnergyForEveryoneSBerryJuice.activations.energy.unit).toBe('energy');
    expect(typeof EnergyForEveryoneSBerryJuice.activations.energy.amount).toBe('function');
  });

  it('should have juice activation', () => {
    expect(EnergyForEveryoneSBerryJuice.activations).toHaveProperty('juice');
    expect(EnergyForEveryoneSBerryJuice.activations.juice.unit).toBe('items');
    expect(typeof EnergyForEveryoneSBerryJuice.activations.juice.amount).toBe('function');
  });
});
