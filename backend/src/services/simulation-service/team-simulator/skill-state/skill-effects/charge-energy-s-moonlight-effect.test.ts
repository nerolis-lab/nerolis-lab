import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-moonlight-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mocks } from '@src/vitest/index.js';
import { ChargeEnergySMoonlight, RandomUtils } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ChargeEnergySMoonlightEffect', () => {
  let skillState: SkillState;
  let effect: ChargeEnergySMoonlightEffect;

  beforeEach(() => {
    skillState = mocks.skillState(mocks.memberState());
    effect = new ChargeEnergySMoonlightEffect();
  });

  it('should activate skill and recover energy', () => {
    vimic(RandomUtils, 'roll', () => false);

    const activation = effect.activate(skillState);

    const skill = ChargeEnergySMoonlight;
    const baseEnergyAmount = skillState.skillAmount(skill.activations.energy);
    const clampedEnergyRecovered = baseEnergyAmount > 150 ? 150 - skillState.memberState.energy : baseEnergyAmount;

    expect(skillState.memberState.currentEnergy).toBe(clampedEnergyRecovered);
    expect(skillState.memberState.totalRecovery).toBe(clampedEnergyRecovered);
    expect(activation.skill).toBe(skill);
    expect(activation.activations[0].unit).toBe('energy');
    expect(activation.activations[0].self?.regular).toBe(clampedEnergyRecovered);
    expect(activation.activations[0].self?.crit).toBe(0);
  });

  it('should waste excess energy', () => {
    vimic(RandomUtils, 'roll', () => false);
    vimic(skillState.memberState, 'wasteEnergy');

    const skill = ChargeEnergySMoonlight;
    const baseEnergyAmount = skillState.skillAmount(skill.activations.energy);
    const clampedEnergyRecovered = baseEnergyAmount > 150 ? 150 - skillState.memberState.energy : baseEnergyAmount;

    effect.activate(skillState);

    expect(skillState.memberState.wasteEnergy).toHaveBeenCalledWith(baseEnergyAmount - clampedEnergyRecovered);
  });

  it('should activate skill with critical hit', () => {
    vimic(RandomUtils, 'roll', () => true);

    const activation = effect.activate(skillState);
    const skill = ChargeEnergySMoonlight;
    const teamAmount = ChargeEnergySMoonlight.activations.energy.critAmount(skillState.skillLevel);

    expect(activation.skill).toBe(skill);
    expect(activation.activations[0].unit).toBe('energy');
    expect(activation.activations[0].self?.regular).toBeGreaterThan(0);
    expect(activation.activations[0].self?.crit).toBe(0);
    expect(activation.activations[0].team?.crit).toBe(teamAmount);
    expect(activation.activations[0].team?.chanceToTargetLowestMember).toBe(1 / skillState.memberState.teamSize);
  });
});
