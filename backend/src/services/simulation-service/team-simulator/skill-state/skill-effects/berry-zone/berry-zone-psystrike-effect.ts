import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { berry, BerryZonePsystrike } from 'sleepapi-common';

export class BerryZonePsystrikeEffect implements SkillEffect {
  activate(skillState: SkillState): SkillActivation {
    const berryZoneAmount = skillState.skillAmount(BerryZonePsystrike.activations.berryZone);
    skillState.memberState.berryZoneState.addBonus(berry.MAGO, berryZoneAmount, BerryZonePsystrike.maximumBonus);
    return {
      skill: BerryZonePsystrike,
      activations: [
        {
          unit: 'strength',
          self: { regular: skillState.skillAmount(BerryZonePsystrike.activations.strength), crit: 0 }
        },
        {
          unit: 'berry zone',
          self: { regular: berryZoneAmount, crit: 0 }
        }
      ]
    };
  }
}
