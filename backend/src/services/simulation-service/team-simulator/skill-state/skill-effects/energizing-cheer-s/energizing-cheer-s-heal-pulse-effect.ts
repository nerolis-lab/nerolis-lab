import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { EnergizingCheerSHealPulse } from 'sleepapi-common';

export class EnergizingCheerSHealPulseEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = EnergizingCheerSHealPulse;
    const energyAmount = skillState.skillAmount(skill.activations.energy);
    const baseHelpsAmount = skillState.skillAmount(skill.activations.soloHelps);
    const bonusHelpsAmount = skillState.skillAmount(skill.activations.pairedHelps);

    const pairedWithLatios =
      skillState.memberState.otherMembers.find(
        (member) => member.member.pokemonWithIngredients.pokemon.name === 'LATIOS'
      ) !== undefined;
    const totalHelpsAmount = baseHelpsAmount + (pairedWithLatios ? bonusHelpsAmount : 0);

    return {
      skill,
      activations: [
        {
          unit: 'energy',
          team: {
            regular: energyAmount,
            crit: 0
          }
        },
        {
          unit: 'helps',
          team: {
            regular: totalHelpsAmount,
            crit: 0
          }
        }
      ],
      targeting: EnergizingCheerSHealPulse.targeting
    };
  }
}
