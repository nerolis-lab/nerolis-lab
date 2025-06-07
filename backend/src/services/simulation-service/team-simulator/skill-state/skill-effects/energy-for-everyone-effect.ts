import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergyForEveryone } from 'sleepapi-common';

export class EnergyForEveryoneEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryone;
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
