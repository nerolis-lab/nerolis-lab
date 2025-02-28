import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { METRONOME_SKILLS } from 'sleepapi-common';

export class MetronomeEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const selectedSkill = skillState.rng.randomElement(METRONOME_SKILLS);

    const metronomedSkill = skillState.skillEffects.get(selectedSkill!)?.activate(skillState);
    if (!metronomedSkill) {
      logger.error(`[${skillState.skill.name}] Couldn't trigger metronome on ${selectedSkill?.name}`);
      return { skill: skillState.skill };
    }

    return metronomedSkill;
  }
}
