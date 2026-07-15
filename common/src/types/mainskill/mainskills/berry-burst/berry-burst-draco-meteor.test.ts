import { describe, expect, it } from 'vitest';
import { BerryBurstDracoMeteor } from './berry-burst-draco-meteor';

const soloSelfBerryTable: Record<number, number[]> = {
  1: [12, 21, 29, 38, 43, 48],
  2: [14, 24, 29, 39, 44, 50],
  3: [18, 29, 35, 42, 48, 55],
  4: [18, 30, 37, 45, 49, 55],
  5: [20, 33, 41, 49, 53, 58]
};

const pairedSelfBerryTable: Record<number, number[]> = {
  1: [14, 25, 35, 46, 52, 58],
  2: [16, 28, 35, 47, 53, 60],
  3: [20, 33, 41, 50, 57, 65],
  4: [20, 34, 43, 53, 58, 65],
  5: [22, 37, 47, 57, 62, 68]
};

const teamBerryTable: Record<number, number[]> = {
  1: [1, 1, 1, 1, 2, 3],
  2: [1, 1, 2, 2, 3, 4],
  3: [1, 1, 2, 3, 4, 4],
  4: [2, 2, 3, 4, 5, 5],
  5: [2, 2, 3, 4, 5, 5]
};

describe('BerryBurstDracoMeteor', () => {
  it('should have correct basic properties', () => {
    expect(BerryBurstDracoMeteor.name).toBe('Draco Meteor (Berry Burst)');
    expect(BerryBurstDracoMeteor.description({ skillLevel: 1 })).toBe(
      'Gets the Berries the Pokémon on your team (including itself) collect. Meet certain conditions to boost effect.'
    );
    expect(BerryBurstDracoMeteor.RP).toEqual([2380, 3385, 4670, 6445, 8898, 12294]);
    expect(BerryBurstDracoMeteor.maxLevel).toBe(6);
  });

  it('should have solo and paired berry activations', () => {
    expect(BerryBurstDracoMeteor.activations).toHaveProperty('solo');
    expect(BerryBurstDracoMeteor.activations).toHaveProperty('paired');
    expect(BerryBurstDracoMeteor.activations.solo.unit).toBe('berries');
    expect(BerryBurstDracoMeteor.activations.paired.unit).toBe('berries');
  });

  it('should match the Draco Meteor berry matrix for every level and same-type count', () => {
    for (const unique of [1, 2, 3, 4, 5]) {
      for (const skillLevel of [1, 2, 3, 4, 5, 6]) {
        expect(BerryBurstDracoMeteor.activations.solo.amount({ skillLevel, extra: unique })).toBe(
          soloSelfBerryTable[unique][skillLevel - 1]
        );
        expect(BerryBurstDracoMeteor.activations.paired.amount({ skillLevel, extra: unique })).toBe(
          pairedSelfBerryTable[unique][skillLevel - 1]
        );
        expect(BerryBurstDracoMeteor.activations.solo.teamAmount!({ skillLevel, extra: unique })).toBe(
          teamBerryTable[unique][skillLevel - 1]
        );
        expect(BerryBurstDracoMeteor.activations.paired.teamAmount!({ skillLevel, extra: unique })).toBe(
          teamBerryTable[unique][skillLevel - 1]
        );
      }
    }
  });
});
