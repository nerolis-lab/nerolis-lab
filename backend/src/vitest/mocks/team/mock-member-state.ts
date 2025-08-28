import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { teamMemberExt } from '@src/vitest/mocks/team/mock-team-member-ext.js';
import { commonMocks } from 'sleepapi-common';

export function memberState(attrs?: Partial<MemberState>): MemberState {
  return new MemberState({
    member: teamMemberExt(),
    settings: commonMocks.teamSettingsExt(),
    team: [teamMemberExt()],
    cookingState: undefined,
    iterations: 1,
    rng: createPreGeneratedRandom(),
    ...attrs
  });
}
