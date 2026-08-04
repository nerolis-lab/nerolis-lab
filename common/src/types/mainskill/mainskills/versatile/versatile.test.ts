import { describe, expect, it } from 'vitest';
import { Versatile } from './versatile';

describe('Versatile', () => {
  it('should have correct basic properties', () => {
    expect(Versatile.name).toBe('Versatile');
    expect(Versatile.maxLevel).toBe(8);
  });

  it('should have candy unit', () => {
    expect(Versatile.hasUnit('candy')).toBe(true);
  });

  it('should give accurate candy description at specific levels', () => {
    expect(Versatile.description({ skillLevel: 1 })).toBe(
      "Gets 1 candy for one Pokémon on your team. Other effects are not yet implemented in Neroli's Lab."
    );
    expect(Versatile.description({ skillLevel: 5 })).toBe(
      "Gets 1 candy for one Pokémon on your team. Other effects are not yet implemented in Neroli's Lab."
    );
    expect(Versatile.description({ skillLevel: 6 })).toBe(
      "Gets either 1 or 2 candies for one Pokémon on your team. Other effects are not yet implemented in Neroli's Lab."
    );
  });
});
