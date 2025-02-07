import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill, RandomUtils } from 'sleepapi-common';

export class ChargeStrengthSStockpileEffect implements SkillEffect {
  private currentStockpile = 0;
  activate(skillState: SkillState): TeamSkillActivation {
    const skill = mainskill.CHARGE_STRENGTH_S_STOCKPILE;
    if (skillState.skill.isUnit('copy', 'metronome')) {
      return { skill, selfValue: { regular: skillState.skillAmount(skill), crit: 0 } };
    }

    const currentLevelStocks =
      mainskill.STOCKPILE_STRENGTH_STOCKS[Math.min(skillState.skillLevel(skill), skill.maxLevel)];
    const triggerSpitUp = RandomUtils.roll(skill.critChance);

    if (triggerSpitUp || this.currentStockpile === currentLevelStocks.length - 1) {
      const stockpiledValue = currentLevelStocks[this.currentStockpile];
      this.currentStockpile = 0;

      return {
        skill,
        selfValue: { regular: stockpiledValue, crit: 0 }
      };
    } else {
      this.currentStockpile += 1;
      return { skill };
    }
  }
}
