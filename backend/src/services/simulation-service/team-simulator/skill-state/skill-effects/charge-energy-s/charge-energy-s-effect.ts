import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeEnergyS } from 'sleepapi-common';

export class ChargeEnergySEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = ChargeEnergyS;
    const defaultEnergyAmount = skillState.skillAmount(skill.activations.energy);

    const clampedEnergyRecovered =
      memberState.energy + defaultEnergyAmount > 150
        ? 150 - memberState.energy
        : skillState.skillAmount(skill.activations.energy);

    // Apply changes to member state
    memberState.currentEnergy += clampedEnergyRecovered;
    memberState.totalRecovery += clampedEnergyRecovered;
    memberState.wasteEnergy(defaultEnergyAmount - clampedEnergyRecovered);

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          self: { regular: clampedEnergyRecovered, crit: 0 }
        }
      ]
    };
  }
}
