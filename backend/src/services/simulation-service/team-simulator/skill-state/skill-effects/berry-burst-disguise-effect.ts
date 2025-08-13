import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BerryBurstDisguise, CarrySizeUtils } from 'sleepapi-common';

export class BerryBurstDisguiseEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = BerryBurstDisguise;
    const regularSelfAmount = skillState.skillAmount(skill.activations.berries);
    const regularOtherAmount = BerryBurstDisguise.activations.berries.teamAmount({ skillLevel: skillState.skillLevel });
    let critSelfAmount = 0;
    let critOtherAmount = 0;

    if (!memberState.disguiseBusted && skillState.rng() < BerryBurstDisguise.activations.berries.critChance) {
      memberState.disguiseBusted = true;

      // -1 because the crit value is the difference between 1x and 3x, so only 2x
      critSelfAmount = regularSelfAmount * (BerryBurstDisguise.activations.berries.critMultiplier - 1);
      critOtherAmount = regularOtherAmount * (BerryBurstDisguise.activations.berries.critMultiplier - 1);
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

    memberState.skillProduce = CarrySizeUtils.addToInventory(memberState.skillProduce, {
      ingredients: [],
      berries
    });

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
