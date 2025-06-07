import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerS } from 'sleepapi-common';

export class EnergizingCheerSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerS;
    const regularEnergyAmount = skillState.skillAmount(skill.activations.energy);
    const chanceToTargetLowestMember = EnergizingCheerS.activations.energy.targetLowestChance;

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: regularEnergyAmount,
            crit: 0,
            chanceToTargetLowestMember
          }
        }
      ]
    };
  }
}
