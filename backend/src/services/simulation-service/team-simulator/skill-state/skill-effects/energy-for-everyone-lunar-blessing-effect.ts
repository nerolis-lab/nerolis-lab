import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CarrySizeUtils, mainskill, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class EnergyForEveryoneLunarBlessingEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.ENERGY_FOR_EVERYONE_LUNAR_BLESSING;
    const memberState = skillState.memberState;
    const unique =
      memberState.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: memberState.berry,
            members: memberState.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const energyForEveryoneAmount = skillState.skillAmount(skillState.skill);
    const selfBerryAmount = mainskill.LUNAR_BLESSING_SELF_BERRIES[unique - 1][skillState.skillLevel(skill) - 1];
    const teamBerryAmount = mainskill.LUNAR_BLESSING_TEAM_BERRIES[unique - 1][skillState.skillLevel(skill) - 1];

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.pokemonWithIngredients.pokemon.berry,
      amount: teamBerryAmount,
      level: member.settings.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: selfBerryAmount,
      level: memberState.level
    });

    memberState.skillProduce = CarrySizeUtils.addToInventory(memberState.skillProduce, {
      ingredients: [],
      berries
    });

    return {
      skill,
      teamValue: {
        regular: energyForEveryoneAmount,
        crit: 0
      }
    };
  }
}
