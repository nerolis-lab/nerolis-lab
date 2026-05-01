import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeEnergyS } from 'sleepapi-common';

export class ChargeEnergySEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = ChargeEnergyS;
    const energyAmount = skillState.skillAmount(skill.activations.energy);

    const { recovered } = memberState.recoverEnergy(energyAmount, memberState);

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          self: { regular: recovered, crit: 0 }
        }
      ]
    };
  }
}
