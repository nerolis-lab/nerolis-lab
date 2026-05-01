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
    let critSelfAmount = 0;
    let critOtherAmount = 0;

    if (!memberState.disguiseBusted && skillState.rng() < BerryBurstDisguise.critChance) {
      memberState.disguiseBusted = true;

      // -1 because the crit value is the difference between 1x and 3x, so only 2x
      critSelfAmount = regularSelfAmount * (BerryBurstDisguise.critMultiplier - 1);
      critOtherAmount = regularOtherAmount * (BerryBurstDisguise.critMultiplier - 1);
    }

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.berry,
      amount: regularOtherAmount + critOtherAmount,
      level: member.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: regularSelfAmount + critSelfAmount,
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
