import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class ExtraHelpfulSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.EXTRA_HELPFUL_S;
    const regularAmount = skillState.skillAmount(skill) / skillState.memberState.teamSize;

    return {
      skill,
      teamValue: {
        regular: regularAmount,
        crit: 0
      }
    };
  }
}
