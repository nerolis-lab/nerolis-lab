import type { MemberStrength } from '../../../types';

export function memberStrength(attrs?: Partial<MemberStrength>): MemberStrength {
  return {
    berries: {
      total: 0,
      breakdown: {
        base: 0,
        favored: 0,
        islandBonus: 0
      }
    },
    skill: {
      total: 0,
      breakdown: {
        base: 0,
        islandBonus: 0
      }
    },
    ...attrs
  };
}
