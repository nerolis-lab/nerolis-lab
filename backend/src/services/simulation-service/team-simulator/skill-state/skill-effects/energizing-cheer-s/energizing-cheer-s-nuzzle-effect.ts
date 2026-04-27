import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerSNuzzle } from 'sleepapi-common';

export class EnergizingCheerSNuzzleEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerSNuzzle;
    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const skillHelpsAmount = skillState.skillAmount(skill.activations.skillHelps);

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: energyAmount,
            crit: 0
          }
        },
        {
          unit: 'skill helps',
          team: {
            regular: skillHelpsAmount,
            crit: 0
          }
        }
      ],
      targeting: skill.targeting
    };
  }
}
