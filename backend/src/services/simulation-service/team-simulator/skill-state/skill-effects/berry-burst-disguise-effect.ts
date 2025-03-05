import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CarrySizeUtils, mainskill } from 'sleepapi-common';

export class BerryBurstDisguiseEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const memberState = skillState.memberState;
    const skill = mainskill.BERRY_BURST_DISGUISE;
    const regularSelfAmount = skillState.skillAmount(skill);
    const regularOtherAmount = mainskill.DISGUISE_BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel(skill) - 1];
    let critSelfAmount = 0;
    let critOtherAmount = 0;

    if (!memberState.disguiseBusted && skillState.rng() < skill.critChance) {
      memberState.disguiseBusted = true;

      // -1 because the crit value is the difference between 1x and 3x, so only 2x
      critSelfAmount = regularSelfAmount * (mainskill.DISGUISE_CRIT_MULTIPLIER - 1);
      critOtherAmount = regularOtherAmount * (mainskill.DISGUISE_CRIT_MULTIPLIER - 1);
    }

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.pokemonWithIngredients.pokemon.berry,
      amount: regularOtherAmount + critOtherAmount,
      level: member.settings.level
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
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: critSelfAmount + critOtherAmount * memberState.otherMembers.length
      }
    };
  }
}
