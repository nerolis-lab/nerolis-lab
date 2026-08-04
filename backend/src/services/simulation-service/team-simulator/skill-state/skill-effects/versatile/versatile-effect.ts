import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { Versatile } from 'sleepapi-common';

export class VersatileSEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const skill = Versatile;
    const regularCandyAmount = skillState.skillAmount(skill.activations.candy);
    const bonusCandyAmount = skillState.skillCritAmount(skill.activations.candy);
    const isCrit = skillState.rng() < skill.bonusCandyChance;

    return {
      skill,
      activations: [
        {
          unit: 'candy',
          self: { regular: regularCandyAmount, crit: isCrit ? bonusCandyAmount : 0 }
        }
      ]
    };
  }
}
