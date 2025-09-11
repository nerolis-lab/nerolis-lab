import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event.js';
import { MOCKED_PRODUCE } from '@src/utils/test-utils/defaults.js';
import { IngredientMagnetS, parseTime } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('SkillEvent', () => {
  it('skill event shall format correctly', () => {
    const event = new SkillEvent({
      time: parseTime('06:00'),
      description: 'test',
      skillActivation: {
        skill: IngredientMagnetS,
        adjustedAmount: 0.5,
        fractionOfProc: 0.5,
        nrOfHelpsToActivate: 10,
        adjustedProduce: MOCKED_PRODUCE
      }
    });
    expect(event.format()).toMatchInlineSnapshot(`"[06:00:00][Skill] (test): 0.5 (50% strength)"`);
  });
});
