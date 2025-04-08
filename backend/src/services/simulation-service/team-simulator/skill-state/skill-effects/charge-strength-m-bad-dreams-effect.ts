import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { berry, mainskill } from 'sleepapi-common';

export class ChargeStrengthMBadDreamsEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.CHARGE_STRENGTH_M_BAD_DREAMS;

    let energyDegraded = 0;
    for (const otherMember of skillState.memberState.otherMembers) {
      if (otherMember.berry.name !== berry.WIKI.name) {
        energyDegraded += otherMember.degradeEnergy(mainskill.BAD_DREAMS_ENERGY_REDUCTION);
      }
    }

    skillState.addSkillValue({ unit: 'energy', amountToSelf: 0, amountToTeam: -energyDegraded });

    return {
      skill,
      selfValue: { regular: skillState.skillAmount(skill), crit: 0 }
    };
  }
}
