import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class EnergyForEveryoneEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.ENERGY_FOR_EVERYONE;
    return {
      skill,
      teamValue: {
        regular: skillState.skillAmount(skillState.skill),
        crit: 0
      }
    };
  }
}
