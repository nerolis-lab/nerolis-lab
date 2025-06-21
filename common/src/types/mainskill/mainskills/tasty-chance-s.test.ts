import { describe, expect, it } from 'vitest';
import { TastyChanceS } from './tasty-chance-s';

describe('TastyChanceS', () => {
  it('should have correct basic properties', () => {
    expect(TastyChanceS.name).toBe('Tasty Chance S');
    expect(TastyChanceS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546]);
    expect(TastyChanceS.maxLevel).toBe(6);
  });

  it('should have chance activation', () => {
    expect(TastyChanceS.activations).toHaveProperty('chance');
    expect(TastyChanceS.activations.chance.unit).toBe('chance');
    expect(typeof TastyChanceS.activations.chance.amount).toBe('function');
  });

  it('should have chance unit only', () => {
    expect(TastyChanceS.hasUnit('chance')).toBe(true);
    expect(TastyChanceS.hasUnit('energy')).toBe(false);
    expect(TastyChanceS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(TastyChanceS.getRPValue(1)).toBe(880);
    expect(TastyChanceS.getRPValue(3)).toBe(1726);
    expect(TastyChanceS.getRPValue(6)).toBe(4546);
  });
});
