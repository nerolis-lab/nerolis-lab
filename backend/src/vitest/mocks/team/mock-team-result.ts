import { cookingResult } from '@src/vitest/mocks/team/mock-cooking-result.js';
import type { TeamResults } from 'sleepapi-common';

export function teamResults(attrs?: Partial<TeamResults>): TeamResults {
  return {
    members: [],
    cooking: cookingResult(),
    ...attrs
  };
}
