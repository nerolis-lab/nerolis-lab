import { berry } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { BerryZoneState } from './berry-zone-state.js';

describe('BerryZoneState', () => {
  it('stacks independent zones to their caps without changing berry counts or levels', () => {
    const zone = new BerryZoneState();
    zone.addBonus(berry.GREPA, 12, 24);
    zone.addBonus(berry.MAGO, 6, 10);
    zone.addBonus(berry.MAGO, 6, 10);
    zone.addBonus(berry.GREPA, 6, 24);
    const berries = [
      { berry: berry.GREPA, amount: 100, level: 30 },
      { berry: berry.MAGO, amount: 100, level: 60 },
      { berry: berry.ORAN, amount: 100, level: 50 }
    ];
    const produced = berries.map((set) => zone.applyBonus(set));
    expect(produced).toEqual([
      { ...berries[0], berryZoneBonus: 18 },
      { ...berries[1], berryZoneBonus: 10 },
      berries[2]
    ]);
    expect(berries.every((set) => !('berryZoneBonus' in set))).toBe(true);
    zone.reset();
    expect(berries.map((set) => zone.applyBonus(set))).toEqual(berries);
    expect(produced[0].berryZoneBonus).toBe(18);
  });
});
