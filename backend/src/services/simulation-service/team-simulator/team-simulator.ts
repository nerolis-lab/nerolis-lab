/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import type {
  SkillActivation,
  TeamActivationValue
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import {
  commonMocks,
  event as expertModeGreengrassEvent,
  type CalculateTeamResponse,
  type MemberProductionBase,
  type SimpleTeamResult,
  type TeamMemberExt,
  type TeamSettingsExt
} from 'sleepapi-common';

export class TeamSimulator {
  private run = 0;
  private rng: PreGeneratedRandom;

  private memberStates: MemberState[] = [];
  private memberStatesWithoutFillers: MemberState[] = [];
  private cookingState?: CookingState = undefined;

  private nightStartMinutes: number;
  private mealTimeMinutesSinceStart: number[];
  private cookedMealsCounter = 0;
  private fullDayDuration = 1440;
  private energyDegradeCounter = -1; // -1 so it takes 3 iterations and first degrade is after 10 minutes, then 10 minutes between each

  constructor(params: {
    settings: TeamSettingsExt;
    members: TeamMemberExt[];
    cookingState?: CookingState;
    iterations: number;
    rng?: PreGeneratedRandom;
  }) {
    const { settings, members, cookingState, iterations, rng } = params;

    // Initialize with pre-generated random numbers if not provided
    this.rng = rng || createPreGeneratedRandom();

    this.cookingState = cookingState;

    const { nightStartMinutes, mealTimeMinutesSinceStart } = TeamSimulatorUtils.setupSimulationTimes({
      settings,
      cookingState: this.cookingState
    });
    this.nightStartMinutes = nightStartMinutes;
    this.mealTimeMinutesSinceStart = mealTimeMinutesSinceStart;

    const expertModeSettings = settings.island?.expertMode;
    const expertModeEvent = expertModeSettings ? expertModeGreengrassEvent(expertModeSettings) : undefined;
    const preparedMembers = TeamSimulatorUtils.prepareMembers({
      members,
      event: expertModeEvent
    });

    for (const member of preparedMembers) {
      const memberState = new MemberState({
        member,
        team: preparedMembers,
        settings,
        cookingState: this.cookingState,
        iterations,
        rng: this.rng
      });
      this.memberStates.push(memberState);
      if (!member.pokemonWithIngredients.pokemon.skill.is(commonMocks.mockMainskill)) {
        this.memberStatesWithoutFillers.push(memberState);
      }
    }
    this.memberStates.forEach((memberState, _, allMembers) => {
      memberState.otherMembers = allMembers.filter((other) => other.id !== memberState.id);
    });
  }

  public simulate() {
    this.init();

    let minutesSinceWakeup = 0;
    // Day loop
    while (minutesSinceWakeup <= this.nightStartMinutes) {
      this.attemptCooking(minutesSinceWakeup);

      for (const member of this.memberStatesWithoutFillers) {
        for (const skillActivation of member.attemptDayHelp(minutesSinceWakeup)) {
          this.maybeActivateTeamSkill(skillActivation, member);
        }
      }
      for (const member of this.memberStatesWithoutFillers) {
        member.scheduleHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      minutesSinceWakeup += 5;
    }

    this.collectInventory();

    // Night loop
    while (minutesSinceWakeup <= this.fullDayDuration) {
      for (const member of this.memberStatesWithoutFillers) {
        member.attemptNightHelp(minutesSinceWakeup);
      }

      this.maybeDegradeEnergy();
      minutesSinceWakeup += 5;
    }
  }

  public results(): CalculateTeamResponse {
    this.collectInventory();

    const members = this.memberStatesWithoutFillers.map((m) => m.results(this.run));
    let cooking = undefined;
    if (this.cookingState) {
      cooking = this.cookingState.results(this.run);
    }

    return { members, cooking };
  }

  public ivResults(variantId: string): MemberProductionBase {
    this.collectInventory();

    const variant = this.memberStatesWithoutFillers.filter((member) => variantId === member.id);
    if (variant.length !== 1) {
      throw new Error('Team must contain exactly 1 variant');
    }

    return variant[0].ivResults(this.run);
  }

  public simpleResults(): SimpleTeamResult[] {
    this.collectInventory();

    return this.memberStatesWithoutFillers.map((member) => member.simpleResults(this.run));
  }

  private init() {
    this.startDay();

    for (const member of this.memberStatesWithoutFillers) {
      for (const proc of member.collectInventory()) {
        this.maybeActivateTeamSkill(proc, member);
      }
    }

    this.energyDegradeCounter = -1;
    this.cookedMealsCounter = 0;
  }

  private startDay() {
    this.run++;
    if (this.cookingState && this.run % 7 === 1) {
      this.cookingState?.startNewWeek();
    }

    for (const member of this.memberStates) {
      member.wakeUp();
    }
  }

  private attemptCooking(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.mealTimeMinutesSinceStart[this.cookedMealsCounter]) {
      for (const member of this.memberStates) {
        member.updateIngredientBag();
        member.recoverMeal();
      }
      // mod 7 for if Sunday
      this.cookingState?.cook(this.run % 7 === 0);
      this.cookedMealsCounter++;
    }
  }

  private maybeDegradeEnergy() {
    // degrade energy every 10 minutes, so every 2nd chunk of 5 minutes
    if (++this.energyDegradeCounter >= 2) {
      this.energyDegradeCounter = 0;
      for (const member of this.memberStates) {
        member.degradeEnergy();
      }
    }
  }

  // TODO: won't change things now, but this should probably find all help/energy units rather than the first (which find does)
  private maybeActivateTeamSkill(result: SkillActivation, invoker: MemberState) {
    const helpsActivation = result.activations.find((activation) => activation.unit === 'helps' && activation.team);
    if (helpsActivation?.team) {
      for (const mem of this.memberStatesWithoutFillers) {
        mem.addHelpsFromSkill(helpsActivation.team, invoker);
        invoker.addSkillValue(helpsActivation.team);
      }
    }

    const energyActivation = result.activations.find((activation) => activation.unit === 'energy' && activation.team);
    if (energyActivation?.team) {
      const recovered = this.recoverMemberEnergy(energyActivation.team, invoker);
      invoker.wasteEnergy(recovered.regular.wastedEnergy + recovered.crit.wastedEnergy);
      invoker.addSkillValue({ regular: recovered.regular.skillValue, crit: recovered.crit.skillValue });
    }
  }

  private recoverMemberEnergy(activation: TeamActivationValue, invoker: MemberState) {
    const { chanceToTargetLowestMember, crit, regular } = activation;
    let valueRegular = 0;
    let valueCrit = 0;
    let wastedRegular = 0;
    let wastedCrit = 0;

    if (regular + crit > 0) {
      const targetGroup =
        chanceToTargetLowestMember !== undefined
          ? this.energyTargetMember(chanceToTargetLowestMember)
          : this.memberStates;

      for (const mem of targetGroup) {
        const { recovered: regularRecovered, wasted: regularWasted } = mem.recoverEnergy(regular, invoker);
        const { recovered: critRecovered, wasted: critWasted } = mem.recoverEnergy(crit, invoker);
        wastedRegular += regularWasted;
        wastedCrit += critWasted;
        valueRegular += regularRecovered;
        valueCrit += critRecovered;
      }
    }

    return {
      regular: { wastedEnergy: wastedRegular, skillValue: valueRegular },
      crit: { wastedEnergy: wastedCrit, skillValue: valueCrit }
    };
  }

  /**
   * @returns array of size 1 containing the randomized member to target
   */
  private energyTargetMember(chanceTargetLowest: number): MemberState[] {
    const sortedMembers = [...this.memberStates].sort((a, b) => a.energy - b.energy);
    const lowestEnergy = sortedMembers[0]?.energy ?? 0;

    const lowestEnergyMembers = sortedMembers.filter((mem) => mem.energy === lowestEnergy);
    const allMembers = this.memberStates;

    const targetGroup = this.rng() < chanceTargetLowest ? lowestEnergyMembers : allMembers;
    return [this.rng.randomElement(targetGroup)].filter((member): member is MemberState => member !== undefined);
  }

  private collectInventory() {
    for (const member of this.memberStatesWithoutFillers) {
      for (const activation of member.collectInventory()) {
        this.maybeActivateTeamSkill(activation, member);
      }
    }
  }
}
