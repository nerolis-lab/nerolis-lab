import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { SkillCopy } from 'sleepapi-common';

export class SkillCopyMimicEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    return skillState.skillEffects.get(SkillCopy)!.activate(skillState);
  }
}
