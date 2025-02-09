import type { TeamProductionExt } from '@/types/member/instanced'
import { createMockMemberProductionExt } from '@/vitest/mocks/calculator/member-production'
import { mockCookingResult } from '@/vitest/mocks/calculator/mock-cooking-result'
import { berry, ingredient } from 'sleepapi-common'

export function createMockTeamProduction(attrs?: Partial<TeamProductionExt>): TeamProductionExt {
  return {
    team: {
      cooking: mockCookingResult(),
      berries: [{ amount: 10, berry: berry.BELUE, level: 60 }],
      ingredients: [{ amount: 10, ingredient: ingredient.FANCY_APPLE }]
    },
    members: [createMockMemberProductionExt().production],
    ...attrs
  }
}
