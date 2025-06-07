import { describe, expect, it } from 'vitest';
import { BerryBurst } from './berry-burst';

describe('BerryBurst', () => {
  it('should have correct basic properties', () => {
    expect(BerryBurst.name).toBe('Berry Burst');
    expect(BerryBurst.description(1)).toBe(
      'Gets 11 Berries plus 1 of each of the Berries other Pokémon on your team collect.'
    );
    expect(BerryBurst.RP).toEqual([1400, 1991, 2747, 3791, 5234, 7232]);
    expect(BerryBurst.maxLevel).toBe(6);
  });

  it('should have berries activation', () => {
    expect(BerryBurst.activations).toHaveProperty('berries');
    expect(BerryBurst.activations.berries.unit).toBe('berries');
    expect(typeof BerryBurst.activations.berries.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = BerryBurst.activations.berries.amount(1);
    const level6Amount = BerryBurst.activations.berries.amount(6);

    expect(level1Amount).toBe(11);
    expect(level6Amount).toBe(30);
  });

  it('should have berries unit only', () => {
    expect(BerryBurst.hasUnit('berries')).toBe(true);
    expect(BerryBurst.hasUnit('energy')).toBe(false);
    expect(BerryBurst.hasUnit('ingredients')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(BerryBurst.getRPValue(1)).toBe(1400);
    expect(BerryBurst.getRPValue(3)).toBe(2747);
    expect(BerryBurst.getRPValue(6)).toBe(7232);
  });
});
