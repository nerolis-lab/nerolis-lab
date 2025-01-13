import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class TastyChanceSEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.TASTY_CHANCE_S;
    const critAmount = skillState.skillAmount(skill);
    skillState.memberState.cookingState?.addCritBonus(critAmount / 100);

    return {
      skill,
      selfValue: { regular: critAmount, crit: 0 }
    };
  }
}
