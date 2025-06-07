import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BerryBurst, CarrySizeUtils } from 'sleepapi-common';

// implemented because metronome can proc it
export class BerryBurstEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = BerryBurst;
    const regularSelfAmount = skillState.skillAmount(skill.activations.berries);
    const regularOtherAmount = BerryBurst.activations.berries.teamAmount(skillState.skillLevel);

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.berry,
      amount: regularOtherAmount,
      level: member.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: regularSelfAmount,
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
            crit: 0
          }
        }
      ]
    };
  }
}
