import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import { EnergizingCheerSHealPulseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s-heal-pulse-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EnergizingCheerSEffect', () => {
  let memberState: MemberState;
  let skillState: SkillState;
  let effect: EnergizingCheerSHealPulseEffect;

  beforeEach(() => {
    memberState = mocks.memberState();
    skillState = mocks.skillState(memberState);
    effect = new EnergizingCheerSHealPulseEffect();
  });

  it('should activate skill and return correct team value', () => {
    const regularEnergyAmount = 22;
    const regularHelpsAmount = 4;

    let timesCalled = 0;
    vimic(skillState, 'skillAmount', () => {
      ++timesCalled;
      return timesCalled == 1 ? regularEnergyAmount : timesCalled == 2 ? regularHelpsAmount : Infinity;
    });

    const result = effect.activate(skillState);

    const energyActivation = result.activations.find((activation) => activation.unit === 'energy');
    expect(energyActivation?.team).toBeDefined();
    expect(energyActivation!.team).toEqual({
      regular: regularEnergyAmount,
      crit: 0
    });
    const helpsActivation = result.activations.find((activation) => activation.unit === 'helps');
    expect(helpsActivation?.team).toBeDefined();
    expect(helpsActivation!.team).toEqual({
      regular: regularHelpsAmount,
      crit: 0
    });
  });
});
