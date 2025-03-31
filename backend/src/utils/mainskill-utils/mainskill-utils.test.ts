import { getMainskill, getMainskillNames } from '@src/utils/mainskill-utils/mainskill-utils.js';
import type { Mainskill } from 'sleepapi-common';
import { MAINSKILLS } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('getMainskillNames', () => {
  it('shall get all mainskill names', () => {
    expect(getMainskillNames()).toMatchInlineSnapshot(`
      [
        "Berry Burst",
        "Disguise (Berry Burst)",
        "Charge Energy S",
        "Moonlight (Charge Energy S)",
        "Charge Strength M",
        "Charge Strength S",
        "Charge Strength S Range",
        "Stockpile (Charge Strength S)",
        "Cooking Power-up S",
        "Dream Shard Magnet S",
        "Dream Shard Magnet S Range",
        "Energizing Cheer S",
        "Energy For Everyone",
        "Lunar Blessing (Energy For Everyone)",
        "Extra Helpful S",
        "Helper Boost",
        "Ingredient Magnet S",
        "Metronome",
        "Skill Copy",
        "Mimic (Skill Copy)",
        "Transform (Skill Copy)",
        "Tasty Chance S",
      ]
    `);
  });
});

describe('getMainskill', () => {
  it.each(MAINSKILLS.map((ms) => [ms.name, ms]))('finds mainskill %s', (name: string, ms: Mainskill) => {
    const result = getMainskill(name);
    expect(result).toEqual(ms);
  });

  it('shall throw if looking up missing mainskill', () => {
    expect(() => getMainskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `[MainskillError: Can't find Main skill with name missing]`
    );
  });
});
