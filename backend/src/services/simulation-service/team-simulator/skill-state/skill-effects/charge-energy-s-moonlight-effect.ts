import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';

export class ChargeEnergySMoonlightEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const memberState = skillState.memberState;
    const skill = mainskill.CHARGE_ENERGY_S_MOONLIGHT;

    const baseEnergyAmount = skillState.skillAmount(skill);
    const clampedEnergyRecovered = baseEnergyAmount > 150 ? 150 - memberState.energy : skillState.skillAmount(skill);

    memberState.wasteEnergy(baseEnergyAmount - clampedEnergyRecovered);
    memberState.currentEnergy += clampedEnergyRecovered;
    memberState.totalRecovery += clampedEnergyRecovered;

    if (skillState.rng() < skill.critChance) {
      const teamAmount = mainskill.moonlightCritAmount(skillState.skillLevel(skill));

      // currently uses equal chance to hit every member
      return {
        skill,
        selfValue: { regular: clampedEnergyRecovered, crit: 0 },
        teamValue: {
          regular: 0,
          crit: teamAmount,
          chanceToTargetLowestMember: 1 / skillState.memberState.teamSize
        }
      };
    }

    return {
      skill,
      selfValue: { regular: clampedEnergyRecovered, crit: 0 }
    };
  }
}
