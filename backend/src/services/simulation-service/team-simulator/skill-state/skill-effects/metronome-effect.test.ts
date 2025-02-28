import { mocks } from '@src/bun/index.js';
import { MetronomeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/metronome-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { METRONOME_SKILLS } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

describe('MetronomeEffect', () => {
  let metronomeEffect: MetronomeEffect;
  let skillState: SkillState;

  beforeEach(() => {
    metronomeEffect = new MetronomeEffect();
    skillState = mocks.skillState();
  });

  it('should activate a random skill from METRONOME_SKILLS', () => {
    const randomSkill = METRONOME_SKILLS[0];
    vimic(skillState.rng, 'randomElement', () => randomSkill);
    const mockActivate = vi.fn().mockReturnValue({ skill: skillState.skill });
    skillState.skillEffects.set(randomSkill, { activate: mockActivate });

    const result = metronomeEffect.activate(skillState);

    expect(skillState.rng.randomElement).toHaveBeenCalledWith(METRONOME_SKILLS);
    expect(mockActivate).toHaveBeenCalledWith(skillState);
    expect(result).toEqual({ skill: skillState.skill });
  });

  it('should log an error and return the original skill if the selected skill cannot be activated', () => {
    vimic(skillState.rng, 'randomElement');
    vimic(logger, 'error').mockImplementation(() => {});

    const result = metronomeEffect.activate(skillState);

    expect(logger.error).toHaveBeenCalledWith("[mock skill] Couldn't trigger metronome on undefined");
    expect(result).toEqual({ skill: skillState.skill });
  });
});
