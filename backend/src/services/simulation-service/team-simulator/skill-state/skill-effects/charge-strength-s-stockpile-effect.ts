import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeStrengthSStockpile, Metronome, SkillCopy } from 'sleepapi-common';

export class ChargeStrengthSStockpileEffect implements SkillEffect {
  private currentStockpile = 0;
  activate(skillState: SkillState): SkillActivation {
    const skill = ChargeStrengthSStockpile;
    if (skillState.skill.isOrModifies(SkillCopy, Metronome)) {
      return {
        skill,
        activations: [
          {
            unit: 'strength',
            self: { regular: skillState.skillAmount(skill.activations.strength), crit: 0 }
          }
        ]
      };
    }

    const currentLevelStocks: number[] =
      ChargeStrengthSStockpile.spitUpAmounts[Math.min(skillState.skillLevel, skill.maxLevel)];
    const triggerSpitUp = skillState.rng() < ChargeStrengthSStockpile.activations.strength.critChance;

    if (triggerSpitUp || this.currentStockpile === currentLevelStocks.length - 1) {
      const stockpiledValue = currentLevelStocks[this.currentStockpile];
      this.currentStockpile = 0;

      return {
        skill,
        activations: [
          {
            unit: 'strength',
            self: { regular: stockpiledValue, crit: 0 }
          }
        ]
      };
    } else {
      this.currentStockpile += 1;
      return { skill, activations: [] };
    }
  }
}
