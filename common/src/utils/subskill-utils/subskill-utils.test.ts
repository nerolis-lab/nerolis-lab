import { describe, expect, it } from 'vitest';

import type { PokemonInstanceExt } from '../../types/instance/pokemon-instance';
import type { Subskill } from '../../types/subskill/subskill';
import {
  HELPING_SPEED_M,
  HELPING_SPEED_S,
  INGREDIENT_FINDER_M,
  INGREDIENT_FINDER_S,
  INVENTORY_L,
  SUBSKILLS
} from '../../types/subskill/subskills';
import { filterMembersWithSubskill, getSubskill, getSubskillNames, limitSubSkillsToLevel } from './subskill-utils';

describe('getSubskillNames', () => {
  it('shall get all subskill names', () => {
    expect(getSubskillNames()).toMatchInlineSnapshot(`
      [
        "Berry Finding S",
        "Dream Shard Bonus",
        "Energy Recovery Bonus",
        "Helping Bonus",
        "Helping Speed S",
        "Helping Speed M",
        "Ingredient Finder S",
        "Ingredient Finder M",
        "Inventory Up S",
        "Inventory Up M",
        "Inventory Up L",
        "Research EXP Bonus",
        "Skill Level Up M",
        "Skill Level Up S",
        "Skill Trigger M",
        "Skill Trigger S",
        "Sleep EXP Bonus",
      ]
    `);
  });
});

describe('getSubskill', () => {
  it.each(SUBSKILLS)('finds subskill "%s"', (ss: Subskill) => {
    const result = getSubskill(ss.name);
    expect(result).toEqual(ss);
  });

  it('shall throw if looking up missing subskill', () => {
    expect(() => getSubskill('missing')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Can't find Subskill with name missing]`
    );
  });
});

describe('limitSubSkillsToLevel', () => {
  it('shall return all subskills for level 100', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        100
      )
    ).toEqual(
      new Set([
        INGREDIENT_FINDER_M.name,
        HELPING_SPEED_M.name,
        INGREDIENT_FINDER_S.name,
        INVENTORY_L.name,
        HELPING_SPEED_S.name
      ])
    );
  });

  it('shall return first 3 subskills for level 60', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        60
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INGREDIENT_FINDER_S.name]));
  });

  it('shall return first 3 subskills for level 50', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        50
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name, INGREDIENT_FINDER_S.name]));
  });

  it('shall return first 2 subskills for level 49', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        49
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name]));
  });

  it('shall return first 2 subskills for level 25', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        25
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name, HELPING_SPEED_M.name]));
  });

  it('shall return first subskill for level <25', () => {
    expect(
      limitSubSkillsToLevel(
        new Set([
          INGREDIENT_FINDER_M.name,
          HELPING_SPEED_M.name,
          INGREDIENT_FINDER_S.name,
          INVENTORY_L.name,
          HELPING_SPEED_S.name
        ]),
        24
      )
    ).toEqual(new Set([INGREDIENT_FINDER_M.name]));
  });
});

describe('filterMembersWithSubskill', () => {
  const subskill = { name: 'Helping Speed S' } as Subskill;
  const members = [
    {
      subskills: [{ subskill, level: 10 }],
      level: 10
    },
    {
      subskills: [{ subskill, level: 20 }],
      level: 15
    },
    {
      subskills: [{ subskill, level: 5 }],
      level: 5
    },
    {
      subskills: [{ subskill: { name: 'Other Subskill' } as Subskill, level: 10 }],
      level: 10
    }
  ] as PokemonInstanceExt[];

  it('shall return members with the specified subskill and level less than or equal to member level', () => {
    expect(filterMembersWithSubskill(members, subskill)).toEqual([
      {
        subskills: [{ subskill, level: 10 }],
        level: 10
      },
      {
        subskills: [{ subskill, level: 5 }],
        level: 5
      }
    ]);
  });

  it('shall return an empty array if no members have the specified subskill', () => {
    const nonExistentSubskill = { name: 'Non Existent Subskill' } as Subskill;
    expect(filterMembersWithSubskill(members, nonExistentSubskill)).toEqual([]);
  });

  it('shall return an empty array if no members have the specified subskill with level less than or equal to member level', () => {
    const highLevelSubskill = { name: 'Helping Speed S' } as Subskill;
    const highLevelMembers = [
      {
        subskills: [{ subskill: highLevelSubskill, level: 20 }],
        level: 10
      }
    ] as PokemonInstanceExt[];
    expect(filterMembersWithSubskill(highLevelMembers, highLevelSubskill)).toEqual([]);
  });
});
