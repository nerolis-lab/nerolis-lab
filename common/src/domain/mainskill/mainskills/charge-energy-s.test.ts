import { describe, expect, it } from 'vitest';
import { ChargeEnergyS } from './charge-energy-s';

describe('ChargeEnergyS', () => {
  it('should have the correct specific properties', () => {
    expect(ChargeEnergyS.name).toBe('Charge Energy S');
    expect(ChargeEnergyS.description(1)).toBe('Restores 12 Energy to the user.');
    expect(ChargeEnergyS.RP).toEqual([400, 569, 785, 1083, 1496, 2066]);
    expect(ChargeEnergyS.maxLevel).toBe(6);
  });

  it('should have correct activation structure', () => {
    expect(ChargeEnergyS.activations).toHaveProperty('energy');
    expect(ChargeEnergyS.activations.energy.unit).toBe('energy');
    expect(typeof ChargeEnergyS.activations.energy.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = ChargeEnergyS.activations.energy.amount(1);
    const level6Amount = ChargeEnergyS.activations.energy.amount(6);

    expect(level1Amount).toBe(12);
    expect(level6Amount).toBe(43.4);
  });

  it('should have specific RP values', () => {
    expect(ChargeEnergyS.getRPValue(1)).toBe(400);
    expect(ChargeEnergyS.getRPValue(3)).toBe(785);
    expect(ChargeEnergyS.getRPValue(6)).toBe(2066);
  });

  it('should have energy unit', () => {
    expect(ChargeEnergyS.hasUnit('energy')).toBe(true);
    expect(ChargeEnergyS.hasUnit('berries')).toBe(false);
    expect(ChargeEnergyS.hasUnit('strength')).toBe(false);
  });

  it('should have energy as only unit', () => {
    const units = ChargeEnergyS.getUnits();
    expect(units).toEqual(['energy']);
  });

  it('should have energy as only activation', () => {
    const activationNames = ChargeEnergyS.getActivationNames();
    expect(activationNames).toEqual(['energy']);
  });
});
