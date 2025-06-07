import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { HelperBoost, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class HelperBoostEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = HelperBoost;
    const memberState = skillState.memberState;
    const unique =
      memberState.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: memberState.berry,
            members: memberState.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const helps = HelperBoost.activations.helps.amount(skillState.skillLevel, unique);

    return {
      skill,
      activations: [
        {
          unit: 'helps',
          team: {
            regular: helps,
            crit: 0
          }
        }
      ]
    };
  }
}
