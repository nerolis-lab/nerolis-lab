import { mocks } from '@src/bun/index.js';
import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-moonlight-effect.js';
import type { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { mainskill, RandomUtils } from 'sleepapi-common';
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

    const skill = mainskill.CHARGE_ENERGY_S_MOONLIGHT;
    const baseEnergyAmount = skillState.skillAmount(skill);
    const clampedEnergyRecovered = baseEnergyAmount > 150 ? 150 - skillState.memberState.energy : baseEnergyAmount;

    expect(skillState.memberState.currentEnergy).toBe(clampedEnergyRecovered);
    expect(skillState.memberState.totalRecovery).toBe(clampedEnergyRecovered);
    expect(activation.skill).toBe(skill);
    expect(activation.selfValue?.regular).toBe(clampedEnergyRecovered);
    expect(activation.selfValue?.crit).toBe(0);
  });

  it('should waste excess energy', () => {
    vimic(RandomUtils, 'roll', () => false);
    vimic(skillState.memberState, 'wasteEnergy');

    const skill = mainskill.CHARGE_ENERGY_S_MOONLIGHT;
    const baseEnergyAmount = skillState.skillAmount(skill);
    const clampedEnergyRecovered = baseEnergyAmount > 150 ? 150 - skillState.memberState.energy : baseEnergyAmount;

    effect.activate(skillState);

    expect(skillState.memberState.wasteEnergy).toHaveBeenCalledWith(baseEnergyAmount - clampedEnergyRecovered);
  });

  it('should activate skill with critical hit', () => {
    vimic(RandomUtils, 'roll', () => true);

    const activation = effect.activate(skillState);
    const skill = mainskill.CHARGE_ENERGY_S_MOONLIGHT;
    const teamAmount = mainskill.moonlightCritAmount(skillState.skillLevel);

    expect(activation.skill).toBe(skill);
    expect(activation.selfValue?.regular).toBeGreaterThan(0);
    expect(activation.selfValue?.crit).toBe(0);
    expect(activation.teamValue?.crit).toBe(teamAmount);
    expect(activation.teamValue?.chanceToTargetLowestMember).toBe(1 / skillState.memberState.teamSize);
  });
});
