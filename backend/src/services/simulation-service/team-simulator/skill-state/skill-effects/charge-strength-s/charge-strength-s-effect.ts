import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeStrengthS } from 'sleepapi-common';

export class ChargeStrengthSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = ChargeStrengthS;
    return {
      skill,
      activations: [
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(skill.activations.strength), crit: 0 }
        }
      ]
    };
  }
}
