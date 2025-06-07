import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { CarrySizeUtils, EnergyForEveryoneLunarBlessing, MAX_TEAM_SIZE, uniqueMembersWithBerry } from 'sleepapi-common';

export class EnergyForEveryoneLunarBlessingEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergyForEveryoneLunarBlessing;
    const memberState = skillState.memberState;
    const unique =
      memberState.team.length > MAX_TEAM_SIZE // accounts for bogus members
        ? 1
        : uniqueMembersWithBerry({
            berry: memberState.berry,
            members: memberState.team.map((member) => member.pokemonWithIngredients.pokemon)
          });

    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const selfBerryAmount = EnergyForEveryoneLunarBlessing.activations.selfBerries.amount(
      skillState.skillLevel,
      unique
    );
    const teamBerryAmount = EnergyForEveryoneLunarBlessing.activations.teamBerries.amount(
      skillState.skillLevel,
      unique
    );

    const berries = memberState.otherMembers.map((member) => ({
      berry: member.berry,
      amount: teamBerryAmount,
      level: member.level
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
      activations: [
        {
          unit: 'berries',
          self: { regular: selfBerryAmount + teamBerryAmount, crit: 0 }
        },
        {
          unit: 'energy',
          team: {
            regular: energyAmount,
            crit: 0
          }
        }
      ]
    };
  }
}
