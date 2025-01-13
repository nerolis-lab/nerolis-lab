import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill, RandomUtils } from 'sleepapi-common';

export class SkillCopyEffect implements SkillEffect {
  activate(skillState: SkillState): TeamSkillActivation {
    const selectedMember = RandomUtils.randomElement(skillState.memberState.otherMembers);

    let copiedSkill = selectedMember?.pokemonWithIngredients.pokemon.skill;

    // TODO: figure out what happens if skill copy triggers on empty team, do we get strength skill or error?
    if (copiedSkill?.isSameOrModifiedVersion(mainskill.SKILL_COPY) || !copiedSkill) {
      copiedSkill = mainskill.CHARGE_STRENGTH_S;
    }

    const copiedActivation = skillState.skillEffects.get(copiedSkill!)?.activate(skillState);
    if (!copiedActivation) {
      logger.error(`[${skillState.skill.name}] Couldn't activate ${copiedSkill?.name}`);
      return { skill: skillState.skill };
    }

    return copiedActivation;
  }
}
