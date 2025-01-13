import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class SkillCopyMimicEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    return skillState.skillEffects.get(mainskill.SKILL_COPY)!.activate(skillState);
  }
}
