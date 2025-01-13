import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import { SkillCopyTransformEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-transform-effect.js';
import type { TeamSkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill } from 'sleepapi-common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SkillCopyTransformEffect', () => {
  let skillState: SkillState;
  let skillEffect: SkillEffect;
  let teamSkillActivation: TeamSkillActivation;

  beforeEach(() => {
    teamSkillActivation = {} as TeamSkillActivation;
    skillEffect = {
      activate: vi.fn().mockReturnValue(teamSkillActivation)
    } as unknown as SkillEffect;

    skillState = {
      skillEffects: new Map([[mainskill.SKILL_COPY, skillEffect]])
    } as SkillState;
  });

  it('should activate the SKILL_COPY effect', () => {
    const skillCopyTransformEffect = new SkillCopyTransformEffect();
    const result = skillCopyTransformEffect.activate(skillState);

    expect(skillEffect.activate).toHaveBeenCalledWith(skillState);
    expect(result).toBe(teamSkillActivation);
  });

  it('should throw an error if SKILL_COPY effect is not found', () => {
    skillState.skillEffects.delete(mainskill.SKILL_COPY);
    const skillCopyTransformEffect = new SkillCopyTransformEffect();

    expect(() => skillCopyTransformEffect.activate(skillState)).toThrow();
  });
});
