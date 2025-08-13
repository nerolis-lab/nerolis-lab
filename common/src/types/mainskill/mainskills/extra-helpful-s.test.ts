import { describe, expect, it } from 'vitest';
import { ExtraHelpfulS } from './extra-helpful-s';

describe('ExtraHelpfulS', () => {
  it('should have correct basic properties', () => {
    expect(ExtraHelpfulS.name).toBe('Extra Helpful S');
    expect(ExtraHelpfulS.description({ skillLevel: 1 })).toBe(
      'Instantly gets you ×6 the usual help from a helper Pokémon.'
    );
    expect(ExtraHelpfulS.RP).toEqual([880, 1251, 1726, 2383, 3290, 4546, 5843]);
    expect(ExtraHelpfulS.maxLevel).toBe(7);
  });

  it('should have helps activation', () => {
    expect(ExtraHelpfulS.activations).toHaveProperty('helps');
    expect(ExtraHelpfulS.activations.helps.unit).toBe('helps');
    expect(typeof ExtraHelpfulS.activations.helps.amount).toBe('function');
  });

  it('should calculate correct activation amounts', () => {
    const level1Amount = ExtraHelpfulS.activations.helps.amount({ skillLevel: 1 });
    const level6Amount = ExtraHelpfulS.activations.helps.amount({ skillLevel: 6 });

    expect(level1Amount).toBe(6);
    expect(level6Amount).toBe(11);
  });

  it('should have helps unit only', () => {
    expect(ExtraHelpfulS.hasUnit('helps')).toBe(true);
    expect(ExtraHelpfulS.hasUnit('energy')).toBe(false);
    expect(ExtraHelpfulS.hasUnit('berries')).toBe(false);
  });

  it('should have specific RP values', () => {
    expect(ExtraHelpfulS.getRPValue(1)).toBe(880);
    expect(ExtraHelpfulS.getRPValue(3)).toBe(1726);
    expect(ExtraHelpfulS.getRPValue(6)).toBe(4546);
  });
});
