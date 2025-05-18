import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';
import { RandomUtils } from '../../utils';
import { COMPLETE_POKEDEX, KANGASKHAN, SNEASEL } from '../pokemon';
import { getRandomGender } from './gender';

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
