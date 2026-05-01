import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type {
  SkillActivation,
  UnitActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { ChargeEnergySMoonlight } from 'sleepapi-common';

export class ChargeEnergySMoonlightEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const memberState = skillState.memberState;
    const skill = ChargeEnergySMoonlight;
    const selfAmount = skillState.skillAmount(skill.activations.energy);
    // TODO: implement skillState.critAmount and use that instead
    const teamAmount = ChargeEnergySMoonlight.activations.energy.critAmount!({ skillLevel: skillState.skillLevel });

    const { recovered } = memberState.recoverEnergy(selfAmount, memberState);

    const selfActivation: UnitActivation = {
      unit: 'energy',
      self: { regular: recovered, crit: 0 }
    };
    const teamActivation: UnitActivation = {
      unit: 'energy',
      team: {
        regular: 0,
        crit: teamAmount
      }
    };
    const activations =
      skillState.rng() < ChargeEnergySMoonlight.activations.energy.critChance!
        ? [selfActivation, teamActivation]
        : [selfActivation];

    return {
      skill,
      activations,
      targeting: skill.targeting
    };
  }
}
