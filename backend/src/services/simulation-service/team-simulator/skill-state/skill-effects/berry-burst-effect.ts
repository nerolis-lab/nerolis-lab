import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CarrySizeUtils, mainskill } from 'sleepapi-common';

// implemented because metronome can proc it
export class BerryBurstEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const memberState = skillState.memberState;
    const skill = mainskill.BERRY_BURST;
    const regularSelfAmount = skillState.skillAmount(skill);
    const regularOtherAmount = mainskill.BERRY_BURST_TEAM_AMOUNT[skillState.skillLevel(skill) - 1];

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.pokemonWithIngredients.pokemon.berry,
      amount: regularOtherAmount,
      level: member.settings.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: regularSelfAmount,
      level: memberState.level
    });

    memberState.totalProduce = CarrySizeUtils.addToInventory(memberState.totalProduce, {
      ingredients: [],
      berries
    });

    return {
      skill,
      selfValue: {
        regular: regularSelfAmount + regularOtherAmount * memberState.otherMembers.length,
        crit: 0
      }
    };
  }
}
