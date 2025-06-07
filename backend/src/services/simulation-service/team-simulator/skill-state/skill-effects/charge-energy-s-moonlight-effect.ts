import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeEnergySMoonlight } from 'sleepapi-common';

export class ChargeEnergySMoonlightEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = ChargeEnergySMoonlight;

    const baseEnergyAmount = skillState.skillAmount(skill.activations.energy);
    const clampedEnergyRecovered =
      baseEnergyAmount > 150 ? 150 - memberState.energy : skillState.skillAmount(skill.activations.energy);

    memberState.wasteEnergy(baseEnergyAmount - clampedEnergyRecovered);
    memberState.currentEnergy += clampedEnergyRecovered;
    memberState.totalRecovery += clampedEnergyRecovered;

    if (skillState.rng() < ChargeEnergySMoonlight.activations.energy.critChance) {
      const teamAmount = ChargeEnergySMoonlight.activations.energy.critAmount(skillState.skillLevel);

      // currently uses equal chance to hit every member
      return {
        skill,
        activations: [
          {
            unit: 'energy',
            self: { regular: clampedEnergyRecovered, crit: 0 },
            team: {
              regular: 0,
              crit: teamAmount,
              chanceToTargetLowestMember: 1 / skillState.memberState.teamSize
            }
          }
        ]
      };
    }

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
