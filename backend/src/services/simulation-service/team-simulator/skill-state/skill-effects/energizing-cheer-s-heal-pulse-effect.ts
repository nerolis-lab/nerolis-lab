import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerSHealPulse } from 'sleepapi-common';

export class EnergizingCheerSHealPulseEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerSHealPulse;
    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const extraHelpsAmount = skillState.skillAmount(skill.activations.extraHelps);
    const numMonsTargeted = EnergizingCheerSHealPulse.numMonsTargeted;
    const chanceToTargetLowestMembers = EnergizingCheerSHealPulse.chanceToTargetLowestMembers;

    return {
      skill,
      numMonsTargeted,
      chanceToTargetLowestMembers,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: energyAmount,
            crit: 0
          }
        },
        {
          unit: 'helps',
          team: {
            regular: extraHelpsAmount,
            crit: 0
          }
        }
      ]
    };
  }
}
