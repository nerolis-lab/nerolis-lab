import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BerryBurstDisguise } from 'sleepapi-common';

export class BerryBurstDisguiseEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = BerryBurstDisguise;

    const regularSelfAmount = skillState.skillAmount(skill.activations.berries);
    const regularOtherAmount = skillState.skillTeamAmount(BerryBurstDisguise.activations.berries);
    let totalSelfAmount = regularSelfAmount;
    let totalOtherAmount = regularOtherAmount;

    const isCrit = !memberState.disguiseBusted && skillState.rng() < BerryBurstDisguise.critChance;
    if (isCrit) {
      memberState.disguiseBusted = true;

      totalSelfAmount = regularSelfAmount * BerryBurstDisguise.critMultiplier;
      totalOtherAmount = regularOtherAmount * BerryBurstDisguise.critMultiplier;
    }

    const critSelfAmount = totalSelfAmount - regularSelfAmount;
    const critOtherAmount = totalOtherAmount - regularOtherAmount;

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.berry,
      amount: totalOtherAmount,
      level: member.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: totalSelfAmount,
      level: memberState.level
    });

    memberState.addSkillProduce({ ingredients: [], berries });

    return {
      skill,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
            crit: critSelfAmount + critOtherAmount * memberState.otherMembers.length
          }
        }
      ]
    };
  }
}
