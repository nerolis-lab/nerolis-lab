import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class EnergizingCheerSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.ENERGIZING_CHEER_S;
    const regularEnergyAmount = skillState.skillAmount(skill);
    const chanceToTargetLowest = mainskill.ENERGIZING_CHEER_TARGET_LOWEST_CHANCE;

    return {
      skill,
      teamValue: {
        regular: regularEnergyAmount,
        crit: 0,
        chanceToTargetLowestMember: chanceToTargetLowest
      }
    };
  }
}
