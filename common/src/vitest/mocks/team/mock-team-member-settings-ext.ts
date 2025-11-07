import { BASHFUL } from '../../../types/nature';
import type { TeamMemberSettingsExt } from '../../../types/team/member';

export function teamMemberSettingsExt(attrs?: Partial<TeamMemberSettingsExt>): TeamMemberSettingsExt {
  return {
    carrySize: 1,
    externalId: 'mock id',
    level: 1,
    nature: BASHFUL,
    ribbon: 0,
    skillLevel: 1,
    subskills: new Set(),
    ...attrs
  };
}
