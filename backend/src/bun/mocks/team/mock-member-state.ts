import { teamMemberExt } from '@src/bun/mocks/team/mock-team-member-ext.js';
import { teamSettingsExt } from '@src/bun/mocks/team/mock-team-settings.js';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';

export function memberState(attrs?: Partial<MemberState>): MemberState {
  return new MemberState({
    member: teamMemberExt(),
    settings: teamSettingsExt(),
    team: [teamMemberExt()],
    cookingState: undefined,
    sneakySnacking: false,
    iterations: 1,
    rng: createPreGeneratedRandom(),
    ...attrs
  });
}
