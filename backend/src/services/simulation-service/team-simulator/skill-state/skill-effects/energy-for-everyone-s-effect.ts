import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergyForEveryoneS } from 'sleepapi-common';

export class EnergyForEveryoneSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryoneS;
    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: skillState.skillAmount(skill.activations.energy),
            crit: 0
          }
        }
      ]
    };
  }
}
