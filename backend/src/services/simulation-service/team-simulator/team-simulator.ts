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
import { getDefaultMealTimes } from '@src/utils/meal-utils/meal-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import {
  commonMocks,
  EnergyForEveryone,
  type CalculateTeamResponse,
  type MemberProductionBase,
  type SimpleTeamResult,
  type TeamMemberExt,
  type TeamSettingsExt,
  type Time,
  type TimePeriod
} from 'sleepapi-common';

export class TeamSimulator {
  private run = 0;
  private rng: PreGeneratedRandom;

  private memberStates: MemberState[] = [];
  private memberStatesWithoutFillers: MemberState[] = [];
  private cookingState?: CookingState = undefined;

  private timeIntervals: Time[] = [];
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;
  private nightStartMinutes: number;
  private mealTimeMinutesSinceStart: number[];
  private cookedMealsCounter = 0;
  private fullDayDuration = 1440;
  private energyDegradeCounter = -1; // -1 so it takes 3 iterations and first degrade is after 10 minutes, then 10 minutes between each

  // External E4E simulation
  private e4eLevel: number = EnergyForEveryone.maxLevel;
  private e4eProcTimes: number[] = []; // Minutes since wakeup when E4E procs
  private nextE4eProcIndex = 0; // Index of next E4E proc to apply

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

    const dayPeriod = {
      start: settings.wakeup,
      end: settings.bedtime
    };
    this.dayPeriod = dayPeriod;
    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup
    };
    this.nightPeriod = nightPeriod;

    let next5Minutes = settings.wakeup;
    while (TimeUtils.timeWithinPeriod(next5Minutes, this.dayPeriod)) {
      this.timeIntervals.push(next5Minutes);
      next5Minutes = TimeUtils.addTime(next5Minutes, { hour: 0, minute: 5, second: 0 });
    }
    next5Minutes = settings.bedtime;
    while (TimeUtils.timeWithinPeriod(next5Minutes, this.nightPeriod)) {
      this.timeIntervals.push(next5Minutes);
      next5Minutes = TimeUtils.addTime(next5Minutes, { hour: 0, minute: 5, second: 0 });
    }

    this.nightStartMinutes = TimeUtils.timeToMinutesSinceStart(this.nightPeriod.start, this.dayPeriod.start);

    if (settings.externalE4eProcs !== undefined && settings.externalE4eProcs > 0) {
      const interval = Math.floor(this.nightStartMinutes / settings.externalE4eProcs);
      for (let i = 0; i < settings.externalE4eProcs; i++) {
        this.e4eProcTimes.push(i * interval);
      }
    }

    const mealTimes = getDefaultMealTimes(dayPeriod);
    this.cookingState?.setMealTimes(mealTimes.meals);
    this.mealTimeMinutesSinceStart = mealTimes.sorted.map((time) =>
      TimeUtils.timeToMinutesSinceStart(time, this.dayPeriod.start)
    );

    for (const member of members) {
      const memberState = new MemberState({
        member,
        team: members,
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

      this.maybeApplyExternalE4E(minutesSinceWakeup);

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
    this.nextE4eProcIndex = 0;
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

  private maybeApplyExternalE4E(minutesSinceWakeup: number) {
    // Check if it's time for the next scheduled E4E proc
    if (
      this.nextE4eProcIndex < this.e4eProcTimes.length &&
      minutesSinceWakeup >= this.e4eProcTimes[this.nextE4eProcIndex]
    ) {
      // Apply E4E energy to all team members
      const energyAmount = EnergyForEveryone.activations.energy.amount(this.e4eLevel);

      for (const member of this.memberStatesWithoutFillers) {
        member.recoverEnergy(energyAmount, member);
      }

      // Move to next E4E proc
      this.nextE4eProcIndex++;
    }
  }

  // TODO: won't change things now, but this should probably find all help/energy units rather than the first (which find does)
  private maybeActivateTeamSkill(result: SkillActivation, invoker: MemberState) {
    const helpsActivation = result.activations.find((activation) => activation.unit === 'helps' && activation.team);
    if (helpsActivation?.team) {
      for (const mem of this.memberStatesWithoutFillers) {
        mem.addHelps(helpsActivation.team, invoker);
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
