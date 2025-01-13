import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class ChargeEnergySEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const memberState = skillState.memberState;
    const skill = mainskill.CHARGE_ENERGY_S;
    const defaultEnergyAmount = skillState.skillAmount(skill);

    const clampedEnergyRecovered =
      memberState.energy + defaultEnergyAmount > 150 ? 150 - memberState.energy : skillState.skillAmount(skill);

    // Apply changes to member state
    memberState.currentEnergy += clampedEnergyRecovered;
    memberState.totalRecovery += clampedEnergyRecovered;
    memberState.wasteEnergy(defaultEnergyAmount - clampedEnergyRecovered);

    return {
      skill,
      selfValue: { regular: clampedEnergyRecovered, crit: 0 }
    };
  }
}
