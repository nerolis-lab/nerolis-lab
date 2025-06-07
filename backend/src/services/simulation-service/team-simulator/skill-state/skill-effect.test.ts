import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import type { SkillActivation } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { describe, expect, it } from 'vitest';

class MockSkillEffect implements SkillEffect {
  skillState: SkillState;

  constructor(skillState: SkillState) {
    this.skillState = skillState;
  }
  activate(skillState: SkillState): SkillActivation {
    return { skill: skillState.skill, activations: [] };
  }
}

describe('SkillEffect', () => {
  it('should activate skill state correctly', () => {
    const mockSkillState = mocks.skillState();
    const skillEffect = new MockSkillEffect(mockSkillState);
    const result = skillEffect.activate(mockSkillState);

    expect(result).toEqual({ skill: mockSkillState.skill, activations: [] });
  });
});
