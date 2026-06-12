import { describe, expect, it } from 'vitest';
import { BerryBurstDracoMeteor } from './berry-burst-draco-meteor';

describe('BerryBurstDracoMeteor', () => {
  it('should have correct basic properties', () => {
    expect(BerryBurstDracoMeteor.name).toBe('Draco Meteor (Berry Burst)');
    expect(BerryBurstDracoMeteor.description({ skillLevel: 1 })).toBe(
      'Gets the Berries the Pokémon on your team (including itself) collect. Meet certain conditions to boost effect.'
    );
    expect(BerryBurstDracoMeteor.RP).toEqual([1400, 1991, 2747, 3791, 5234, 7232]);
    expect(BerryBurstDracoMeteor.maxLevel).toBe(6);
  });

  it('should have solo and paired berry activations', () => {
    expect(BerryBurstDracoMeteor.activations).toHaveProperty('solo');
    expect(BerryBurstDracoMeteor.activations).toHaveProperty('paired');
    expect(BerryBurstDracoMeteor.activations.solo.unit).toBe('berries');
    expect(BerryBurstDracoMeteor.activations.paired.unit).toBe('berries');
  });

  it('should calculate solo self berries from unique berry table', () => {
    expect(BerryBurstDracoMeteor.activations.solo.amount({ skillLevel: 1, extra: 1 })).toBe(12);
    expect(BerryBurstDracoMeteor.activations.solo.amount({ skillLevel: 6, extra: 5 })).toBe(58);
  });

  it('should add latias bonus berries when paired', () => {
    expect(BerryBurstDracoMeteor.activations.paired.amount({ skillLevel: 1, extra: 1 })).toBe(14);
    expect(BerryBurstDracoMeteor.activations.paired.amount({ skillLevel: 6, extra: 5 })).toBe(68);
  });

  it('should calculate team berries from unique berry table', () => {
    expect(BerryBurstDracoMeteor.activations.solo.teamAmount!({ skillLevel: 1, extra: 1 })).toBe(1);
    expect(BerryBurstDracoMeteor.activations.solo.teamAmount!({ skillLevel: 6, extra: 3 })).toBe(4);
  });
});
