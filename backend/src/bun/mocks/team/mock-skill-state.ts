import { memberState } from '@src/bun/mocks/team/mock-member-state.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import seedrandom from 'seedrandom';

export function skillState(customState?: MemberState): SkillState {
  return new SkillState(customState ?? memberState(), seedrandom.alea('seed'));
}
