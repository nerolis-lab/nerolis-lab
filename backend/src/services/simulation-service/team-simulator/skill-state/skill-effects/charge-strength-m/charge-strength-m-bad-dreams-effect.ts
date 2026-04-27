import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { berry, ChargeStrengthMBadDreams } from 'sleepapi-common';

export class ChargeStrengthMBadDreamsEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = ChargeStrengthMBadDreams;

    let energyDegraded = 0;
    for (const otherMember of skillState.memberState.otherMembers) {
      if (otherMember.berry.name !== berry.WIKI.name) {
        energyDegraded += otherMember.degradeEnergy(ChargeStrengthMBadDreams.activations.strength.teamEnergyReduction);
      }
    }

    skillState.addSkillValue({ unit: 'energy', amountToSelf: 0, amountToTeam: -energyDegraded });

    return {
      skill,
      activations: [
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(skill.activations.strength), crit: 0 }
        }
      ]
    };
  }
}
