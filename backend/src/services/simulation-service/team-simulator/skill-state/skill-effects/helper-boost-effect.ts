import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class HelperBoostEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.HELPER_BOOST;
    const memberState = skillState.memberState;
    const unique =
      memberState.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: memberState.berry,
            members: memberState.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const uniqueHelps = mainskill.HELPER_BOOST_UNIQUE_BOOST_TABLE[unique - 1][skillState.skillLevel(skill) - 1];
    const regularAmount = skillState.skillAmount(skill) + uniqueHelps;

    return {
      skill,
      teamValue: {
        regular: regularAmount,
        crit: 0
      }
    };
  }
}
