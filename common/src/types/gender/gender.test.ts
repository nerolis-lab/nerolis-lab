import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';
import { RandomUtils } from '../../utils';
import { COMPLETE_POKEDEX, KANGASKHAN, PIKACHU, SNEASEL } from '../pokemon';
import { allowsGenderToggle, fixedGenderForSpecies, getRandomGender } from './gender';

describe('gender', () => {
  it('shall have 0 or 1 total gender ratios', () => {
    COMPLETE_POKEDEX.forEach((species) => {
      expect(species.genders.male + species.genders.female).toSatisfy((x) => x == 0 || x == 1);
    });
  });
});

describe('getRandomGender', () => {
  it('shall randomize a gender', () => {
    vimic(RandomUtils, 'roll', () => true);

    expect(getRandomGender(SNEASEL)).toEqual('male');
  });

  it('shall only use the species available genders', () => {
    expect(getRandomGender(KANGASKHAN)).toEqual('female');
  });
});

describe('fixedGenderForSpecies', () => {
  it('shall return female for female-only species', () => {
    expect(fixedGenderForSpecies(KANGASKHAN)).toBe('female');
  });

  it('shall return undefined for species with both genders', () => {
    expect(fixedGenderForSpecies(PIKACHU)).toBeUndefined();
  });
});

describe('allowsGenderToggle', () => {
  it('shall be false for female-only species', () => {
    expect(allowsGenderToggle(KANGASKHAN)).toBe(false);
  });

  it('shall be true for species with both genders', () => {
    expect(allowsGenderToggle(PIKACHU)).toBe(true);
  });
});
