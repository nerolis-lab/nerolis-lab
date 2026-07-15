import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { BerryBurstDracoMeteor, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class BerryBurstDracoMeteorEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = BerryBurstDracoMeteor;

    const pairedWithLatias =
      skillState.memberState.otherMembers.find(
        (member) => member.member.pokemonWithIngredients.pokemon.name === 'LATIAS'
      ) !== undefined;
    const skillActivation = pairedWithLatias ? skill.activations.paired : skill.activations.solo;
    const sameTypeSpeciesCount =
      memberState.team.length > MAX_TEAM_SIZE
        ? 1
        : uniqueMembersWithBerry({
            berry: memberState.berry,
            members: memberState.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const selfAmount = skillState.skillAmount(skillActivation, { extra: sameTypeSpeciesCount });
    const teamAmount = skillState.skillTeamAmount(skillActivation, { extra: sameTypeSpeciesCount });

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.berry,
      amount: teamAmount,
      level: member.level
    }));

    berries.push({
      berry: memberState.berry,
      amount: selfAmount,
      level: memberState.level
    });

    memberState.addSkillProduce({ ingredients: [], berries });

    return {
      skill,
      activations: [
        {
          unit: 'berries',
          self: {
            regular: selfAmount + teamAmount * memberState.otherMembers.length,
            crit: 0
          }
        }
      ]
    };
  }
}
