import { describe, expect, it } from 'vitest';
import type { Berry, BerrySet } from '../../domain/berry';
import { BELUE, BERRIES, ORAN, TOTAL_NUMBER_OF_BERRIES } from '../../domain/berry/berries';
import { commonMocks } from '../../vitest';
import {
  berryPowerForLevel,
  berrySetToFlat,
  emptyBerryInventory,
  flatToBerrySet,
  getBerry,
  multiplyBerries,
  prettifyBerries,
  roundBerries,
  uniqueMembersWithBerry
} from './berry-utils';

const testBerry: Berry = { name: 'Oran', value: 10, type: 'water' };
const testBerries: BerrySet[] = [
  { berry: testBerry, amount: 15, level: 3 },
  { berry: testBerry, amount: 10, level: 2 },
  { berry: testBerry, amount: 5, level: 1 }
];

describe('berryPowerForLevel', () => {
  it('shall return expected oran berry power for multiple breakpoints', () => {
    expect(berryPowerForLevel(ORAN, 1)).toBe(31);
    expect(berryPowerForLevel(ORAN, 10)).toBe(40);
    expect(berryPowerForLevel(ORAN, 30)).toBe(63);
    expect(berryPowerForLevel(ORAN, 50)).toBe(104);
    expect(berryPowerForLevel(ORAN, 55)).toBe(118);
    expect(berryPowerForLevel(ORAN, 60)).toBe(133);
    expect(berryPowerForLevel(ORAN, 65)).toBe(151);
  });

  it('shall return expected belue berry power for multiple breakpoints', () => {
    expect(berryPowerForLevel(BELUE, 1)).toBe(33);
    expect(berryPowerForLevel(BELUE, 10)).toBe(42);
    expect(berryPowerForLevel(BELUE, 30)).toBe(68);
    expect(berryPowerForLevel(BELUE, 50)).toBe(111);
    expect(berryPowerForLevel(BELUE, 55)).toBe(125);
    expect(berryPowerForLevel(BELUE, 60)).toBe(142);
    expect(berryPowerForLevel(BELUE, 65)).toBe(160);
  });
});

describe('multiplyBerries', () => {
  it('multiplies the amount of each berry by the given factor', () => {
    const result = multiplyBerries(testBerries, 2);
    expect(result).toEqual([
      { berry: testBerry, amount: 30, level: 3 },
      { berry: testBerry, amount: 20, level: 2 },
      { berry: testBerry, amount: 10, level: 1 }
    ]);
  });
});

describe('roundBerries', () => {
  it('rounds the amount of each berry to the given precision', () => {
    const result = roundBerries(
      [
        { berry: testBerry, amount: 15.128361, level: 3 },
        { berry: testBerry, amount: 10.128361, level: 2 }
      ],
      1
    );
    expect(result).toEqual([
      { berry: testBerry, amount: 15.1, level: 3 },
      { berry: testBerry, amount: 10.1, level: 2 }
    ]);
  });
});

describe('emptyBerryInventory', () => {
  it('returns an empty array', () => {
    expect(emptyBerryInventory()).toEqual([]);
  });
});

describe('prettifyBerries', () => {
  it('returns a formatted string of berry amounts and names', () => {
    const result = prettifyBerries(testBerries);
    expect(result).toBe('15 Oran, 10 Oran, 5 Oran');
  });

  it('allows a custom separator', () => {
    const result = prettifyBerries(testBerries, ' | ');
    expect(result).toBe('15 Oran | 10 Oran | 5 Oran');
  });
});
describe('flatToBerrySet', () => {
  it('converts a Float32Array to a BerrySet array', () => {
    const berries = new Float32Array([10, 0, 5]);
    const level = 2;
    const result = flatToBerrySet(berries, level);
    expect(result).toEqual([
      { berry: BERRIES[0], amount: 10, level },
      { berry: BERRIES[2], amount: 5, level }
    ]);
  });

  it('returns an empty array if all amounts are zero', () => {
    const berries = new Float32Array([0, 0, 0]);
    const level = 2;
    const result = flatToBerrySet(berries, level);
    expect(result).toEqual([]);
  });
});

describe('berrySetToFlat', () => {
  it('converts a BerrySet array to a Float32Array', () => {
    const berrySet: BerrySet[] = [
      { berry: BERRIES[0], amount: 10, level: 2 },
      { berry: BERRIES[2], amount: 5, level: 2 }
    ];
    const result = berrySetToFlat(berrySet);
    const expected = new Float32Array(TOTAL_NUMBER_OF_BERRIES);
    expected[0] = 10;
    expected[2] = 5;
    expect(result).toEqual(expected);
  });

  it('handles an empty BerrySet array', () => {
    const berrySet: BerrySet[] = [];
    const result = berrySetToFlat(berrySet);
    const expected = new Float32Array(TOTAL_NUMBER_OF_BERRIES);
    expect(result).toEqual(expected);
  });
});

describe('getBerry', () => {
  it('returns the correct berry object for a valid berry name', () => {
    const berry = getBerry('Oran');
    expect(berry).toEqual(ORAN);
  });

  it('throws an error for an invalid berry name', () => {
    expect(() => getBerry('InvalidBerry')).toThrow('Berry InvalidBerry not found');
  });
});

describe('uniqueMembersWithBerry', () => {
  it('shall support all duplicates', () => {
    const member = commonMocks.mockPokemon({ berry: BELUE });
    expect(uniqueMembersWithBerry({ berry: BELUE, members: [member, member, member] })).toBe(1);
  });

  it('shall count unique members', () => {
    const member1 = commonMocks.mockPokemon({ berry: BELUE, name: 'Member 1' });
    const member2 = commonMocks.mockPokemon({ berry: BELUE, name: 'Member 2' });
    const member3 = commonMocks.mockPokemon({ berry: BELUE, name: 'Member 3' });
    expect(uniqueMembersWithBerry({ berry: BELUE, members: [member1, member2, member3] })).toBe(3);
  });

  it('shall ignore any duplicates', () => {
    const member1 = commonMocks.mockPokemon({ berry: BELUE, name: 'Member 1' });
    const member2 = commonMocks.mockPokemon({ berry: ORAN, name: 'Member 2' });
    const member3 = commonMocks.mockPokemon({ berry: BELUE, name: 'Member 3' });
    expect(uniqueMembersWithBerry({ berry: BELUE, members: [member1, member2, member3, member1, member2] })).toBe(2);
  });
});
