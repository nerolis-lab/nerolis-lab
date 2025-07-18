import { describe, expect, it } from 'vitest';
import { CookingPowerUpS } from './cooking-power-up-s';
import { CookingPowerUpSMinus } from './cooking-power-up-s-minus';

describe('CookingPowerUpSMinus', () => {
  it('should have modified name format', () => {
    expect(CookingPowerUpSMinus.name).toBe('Minus (Cooking Power-Up S)');
    expect(CookingPowerUpSMinus.modifierName).toBe('Minus');
    expect(CookingPowerUpSMinus.baseSkill).toBe(CookingPowerUpS);
  });

  it('should have correct basic properties', () => {
    expect(CookingPowerUpSMinus.name).toBe('Minus (Cooking Power-Up S)');
    expect(CookingPowerUpSMinus.description(1)).toBe(
      'Gives your cooking pot room for 5 more ingredients next time you cook. Meet certain conditions to also restore 8 Energy to one random Pokémon on your team.'
    );
    expect(CookingPowerUpSMinus.maxLevel).toBe(7);
  });

  it('should have specific RP values', () => {
    expect(CookingPowerUpSMinus.getRPValue(1)).toBe(880);
    expect(CookingPowerUpSMinus.getRPValue(4)).toBe(2383);
    expect(CookingPowerUpSMinus.getRPValue(7)).toBe(5843);
  });

  it('should have potSize activation', () => {
    expect(CookingPowerUpSMinus.activations).toHaveProperty('solo');
    expect(CookingPowerUpSMinus.activations.solo.unit).toBe('pot size');
    expect(typeof CookingPowerUpSMinus.activations.solo.amount).toBe('function');
  });

  it('should have energy activation', () => {
    expect(CookingPowerUpSMinus.activations).toHaveProperty('paired');
    expect(CookingPowerUpSMinus.activations.paired.unit).toBe('energy');
    expect(typeof CookingPowerUpSMinus.activations.paired.amount).toBe('function');
  });

  it('should calculate correct ingredient amounts', () => {
    expect(CookingPowerUpSMinus.activations.solo.amount(1)).toBe(5);
    expect(CookingPowerUpSMinus.activations.solo.amount(4)).toBe(12);
    expect(CookingPowerUpSMinus.activations.solo.amount(7)).toBe(24);
    expect(CookingPowerUpSMinus.activations.paired.amount(1)).toBe(8);
    expect(CookingPowerUpSMinus.activations.paired.amount(4)).toBe(17);
    expect(CookingPowerUpSMinus.activations.paired.amount(7)).toBe(35);
  });
});
