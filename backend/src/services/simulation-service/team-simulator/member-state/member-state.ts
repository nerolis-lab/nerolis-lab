import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator.js';
import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import type {
  SkillActivationValue,
  TeamSkillActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type {
  BerryIndexToFloatAmount,
  BerrySet,
  IngredientIndexToFloatAmount,
  IngredientIndexToIntAmount,
  IngredientSet,
  MemberProduction,
  MemberProductionBase,
  PokemonWithIngredientsIndexed,
  Produce,
  SimpleTeamResult,
  TeamMemberExt,
  TeamSettingsExt,
  TimePeriod
} from 'sleepapi-common';
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  CarrySizeUtils,
  ING_ID_LOOKUP,
  MAX_POT_SIZE,
  MathUtils,
  berrySetToFlat,
  calculateNrOfBerriesPerDrop,
  emptyBerryInventoryFloat,
  emptyIngredientInventoryFloat,
  emptyIngredientInventoryInt,
  flatToIngredientSet,
  ingredientSetToFloatFlat,
  ingredientSetToIntFlat,
  multiplyProduce,
  subskill
} from 'sleepapi-common';

export class MemberState {
  member: TeamMemberExt;
  team: TeamMemberExt[];
  otherMembers: TeamMemberExt[];
  cookingState?: CookingState;
  private skillState: SkillState;
  private camp: boolean;
  private rng: PreGeneratedRandom;

  // quick lookups, static data
  private pokemonWithIngredients: PokemonWithIngredientsIndexed;

  // state
  currentEnergy = 0;
  disguiseBusted = false;
  private nextHelp: number;
  private currentNightHelps = 0;
  private dayPeriod: TimePeriod;
  private nightPeriod: TimePeriod;
  private fullDayDuration = 1440;
  private carriedAmount = 0;
  private totalAverageHelps = 0;
  private totalSneakySnackHelps = 0;
  private totalBerryProduction = 0;
  private totalIngredientProduction: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private voidIngredients: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();

  private berryProductionPerDay: Int16Array;
  private ingredientProductionPerDay: IngredientIndexToIntAmount[];
  private currentDay = 0;
  private totalDays: number;

  // ingredient sets
  private level0IngredientSet: IngredientSet;
  private level30IngredientSet?: IngredientSet;
  private level60IngredientSet?: IngredientSet;

  // stats
  private frequency0;
  private frequency1;
  private frequency40;
  private frequency60;
  private frequency80;
  public skillPercentage: number;
  private ingredientPercentage: number;

  // precomputed berry drop amounts
  private berryDropAmounts: BerryIndexToFloatAmount = emptyBerryInventoryFloat();
  private berryDropAmount = 0;

  // summary

  // TODO: move to skill-state
  skillProduce: Produce = CarrySizeUtils.getEmptyInventory();
  totalRecovery = 0;
  wastedEnergy = 0;
  private energyIntervalsDay = 0;
  private energyIntervalsNight = 0;
  private frequencyIntervalsDay = 0;
  private frequencyIntervalsNight = 0;
  private morningProcs = 0;
  private totalDayHelps = 0;
  private totalNightHelps = 0;
  private nightHelpsBeforeSS = 0;
  private nightHelpsAfterSS = 0;
  private helpsAtFrequency0 = 0;
  private helpsAtFrequency1 = 0;
  private helpsAtFrequency40 = 0;
  private helpsAtFrequency60 = 0;
  private helpsAtFrequency80 = 0;

  // team members support
  private totalHealedByMembers = 0;
  private totalHelpsByMembers = 0;

  // This tracks the actual amount of ingredients accumulated since last cook
  private ingredientsSinceLastCook = emptyIngredientInventoryFloat();

  // Integer thresholds for uint8 comparisons (0-255)
  private ingredient0ThresholdInt: number;
  private ingredient30ThresholdInt: number;
  private ingredient60ThresholdInt: number;

  // precomputed ingredient ids and amounts
  private level0IngredientId: number;
  private level30IngredientId?: number;
  private level60IngredientId?: number;
  private level0IngredientAmount: number;
  private level30IngredientAmount?: number;
  private level60IngredientAmount?: number;

  constructor(params: {
    member: TeamMemberExt;
    team: TeamMemberExt[];
    settings: TeamSettingsExt;
    cookingState: CookingState | undefined;
    iterations?: number;
    rng?: PreGeneratedRandom;
  }) {
    const { member, team, settings, cookingState, iterations = 1, rng } = params;

    this.rng = rng || createPreGeneratedRandom();

    // Initialize the daily production arrays with the total number of days we'll simulate
    // Each iteration is one day
    this.totalDays = iterations;
    this.berryProductionPerDay = new Int16Array(iterations);
    this.ingredientProductionPerDay = Array(iterations)
      .fill(null)
      .map(() => emptyIngredientInventoryInt());

    this.camp = settings.camp;
    this.cookingState = cookingState;

    // list already filtered for level
    const teamHelpingBonus = team.filter(
      (otherMember) =>
        otherMember.settings.externalId !== member.settings.externalId &&
        otherMember.settings.subskills.has(subskill.HELPING_BONUS.name)
    ).length;

    const nightPeriod = {
      start: settings.bedtime,
      end: settings.wakeup
    };
    const dayPeriod = {
      start: settings.wakeup,
      end: settings.bedtime
    };
    this.nightPeriod = nightPeriod;
    this.dayPeriod = dayPeriod;

    this.nextHelp = this.fullDayDuration; // set to 1440, first start of day subtracts 1440

    this.skillPercentage = TeamSimulatorUtils.calculateSkillPercentage(member);
    this.ingredientPercentage = TeamSimulatorUtils.calculateIngredientPercentage(member);

    const ingredientsUnlocked = Math.min(Math.floor(member.settings.level / 30) + 1, 3);
    member.pokemonWithIngredients.ingredientList = member.pokemonWithIngredients.ingredientList.slice(
      0,
      ingredientsUnlocked
    );

    const pokemonIngredientListFlat = ingredientSetToIntFlat(member.pokemonWithIngredients.ingredientList);
    this.pokemonWithIngredients = {
      pokemon: member.pokemonWithIngredients.pokemon.name,
      ingredients: pokemonIngredientListFlat
    };

    // Initialize ingredient sets from the Pokemon's actual ingredient list
    const ingredientList = member.pokemonWithIngredients.ingredientList;

    // Level 0 ingredient is always the first one
    this.level0IngredientSet = ingredientList[0];

    // Level 30 ingredient is second if available
    if (member.settings.level >= 30 && ingredientList.length > 1) {
      this.level30IngredientSet = ingredientList[1];
    }

    // Level 60 ingredient is third if available
    if (member.settings.level >= 60 && ingredientList.length > 2) {
      this.level60IngredientSet = ingredientList[2];
    }

    // Calculate raw production amounts without probability adjustments
    const memberBerryInList = berrySetToFlat([
      {
        amount: 1,
        berry: member.pokemonWithIngredients.pokemon.berry,
        level: member.settings.level
      }
    ]);
    const berriesPerDrop = calculateNrOfBerriesPerDrop(
      member.pokemonWithIngredients.pokemon.specialty,
      member.settings.subskills
    );

    this.berryDropAmounts = memberBerryInList.map((amount: number) => amount * berriesPerDrop);
    this.berryDropAmount = Math.max(...this.berryDropAmounts);

    const frequency = TeamSimulatorUtils.calculateHelpSpeedBeforeEnergy({
      member,
      settings,
      teamHelpingBonus
    });
    // TODO: not nice to duplicate this between here and energy utils in case brackets change
    this.frequency0 = frequency * 1; // 0 energy
    this.frequency1 = frequency * 0.66; // 1-39 energy
    this.frequency40 = frequency * 0.58; // 40-59 energy
    this.frequency60 = frequency * 0.52; // 60-79 energy
    this.frequency80 = frequency * 0.45; // 80+ energy

    this.member = member;
    this.team = team; // this needs updating when we add team rotation
    this.otherMembers = team.filter((m) => m.settings.externalId !== member.settings.externalId); // this needs updating when we add team rotation
    this.skillState = new SkillState(this, this.rng);

    // Calculate thresholds locally
    const ingredient0Threshold = 1 - this.ingredientPercentage;
    let ingredient30Threshold: number;
    let ingredient60Threshold: number;

    if (this.level60IngredientSet) {
      const ingredientChunk = this.ingredientPercentage / 3;
      ingredient30Threshold = ingredient0Threshold + ingredientChunk;
      ingredient60Threshold = ingredient30Threshold + ingredientChunk;
    } else if (this.level30IngredientSet) {
      const ingredientChunk = this.ingredientPercentage / 2;
      ingredient30Threshold = ingredient0Threshold + ingredientChunk;
      // NB: Math.random() is [0, 1) so 1.0 is never rolled
      ingredient60Threshold = 1.0;
    } else {
      ingredient30Threshold = 1.0;
      ingredient60Threshold = 1.0;
    }

    // Pre-compute ingredient IDs and amounts
    this.level0IngredientId = ING_ID_LOOKUP[this.level0IngredientSet.ingredient.name];
    this.level0IngredientAmount = this.level0IngredientSet.amount;

    if (this.level30IngredientSet) {
      this.level30IngredientId = ING_ID_LOOKUP[this.level30IngredientSet.ingredient.name];
      this.level30IngredientAmount = this.level30IngredientSet.amount;
    }

    if (this.level60IngredientSet) {
      this.level60IngredientId = ING_ID_LOOKUP[this.level60IngredientSet.ingredient.name];
      this.level60IngredientAmount = this.level60IngredientSet.amount;
    }

    // Integer thresholds for uint8 comparisons (0-255)
    this.ingredient0ThresholdInt = Math.round(ingredient0Threshold * 255);
    this.ingredient30ThresholdInt = Math.round(ingredient30Threshold * 255);
    this.ingredient60ThresholdInt = Math.round(ingredient60Threshold * 255);
  }

  get level() {
    return this.member.settings.level;
  }

  get skill() {
    return this.member.pokemonWithIngredients.pokemon.skill;
  }

  get teamSize() {
    return this.team.length;
  }

  get berry() {
    return this.member.pokemonWithIngredients.pokemon.berry;
  }

  get inventoryLimit() {
    // camp, subskills, ribbon etc already calculated in controller
    return this.member.settings.carrySize;
  }

  get energy() {
    return this.currentEnergy;
  }

  get id() {
    return this.member.settings.externalId;
  }

  public wakeUp() {
    const nrOfErb = TeamSimulatorUtils.countMembersWithSubskill(this.team, subskill.ENERGY_RECOVERY_BONUS.name);
    const sleepInfo: SleepInfo = {
      period: this.nightPeriod,
      incense: false,
      erb: nrOfErb,
      nature: this.member.settings.nature
    };
    this.skillState.wakeup();

    // Increment day counter
    this.currentDay = (this.currentDay + 1) % this.totalDays;

    const missingEnergy = Math.max(0, 100 - this.currentEnergy);
    const recoveredEnergy = Math.min(missingEnergy, calculateSleepEnergyRecovery(sleepInfo));
    this.currentEnergy += recoveredEnergy;

    this.disguiseBusted = false;

    this.nextHelp -= this.fullDayDuration;
  }

  /**
   * @returns any leftover (wasted) energy
   */
  public recoverEnergy(recovered: number, invoker: MemberState) {
    const recoveredWithNature = recovered * this.member.settings.nature.energy;
    const clampedEnergyRecovered =
      this.currentEnergy + recoveredWithNature > 150 ? 150 - this.currentEnergy : recoveredWithNature;

    this.currentEnergy += clampedEnergyRecovered;
    this.totalRecovery += clampedEnergyRecovered;

    if (invoker.id !== this.id) {
      this.totalHealedByMembers += clampedEnergyRecovered;
    }

    return {
      recovered: clampedEnergyRecovered,
      wasted: recoveredWithNature - clampedEnergyRecovered
    };
  }

  public wasteEnergy(wasted: number) {
    this.wastedEnergy += wasted;
  }

  public addSkillValue(skillValue: SkillActivationValue) {
    this.skillState.addValue(skillValue);
  }

  public addHelps(helps: SkillActivationValue, invoker: MemberState) {
    const { regular, crit } = helps;
    const totalHelps = regular + crit;

    if (invoker.id !== this.id) {
      this.totalHelpsByMembers += totalHelps;
    }

    // Perform rolls for each help
    for (let i = 0; i < totalHelps; i++) {
      this.attemptDayHelpInner();
    }
  }

  public updateIngredientBag() {
    // Since we're tracking actual ingredient amounts in Float32Array, we can directly use it
    this.cookingState?.addIngredients(this.ingredientsSinceLastCook);

    // Zero out the array instead of allocating a new one
    this.ingredientsSinceLastCook.fill(0);
  }

  public recoverMeal() {
    this.totalRecovery += getMealRecoveryAmount(this.currentEnergy);
    this.currentEnergy += getMealRecoveryAmount(this.currentEnergy);
  }

  public attemptDayHelpInner() {
    this.totalDayHelps += 1;
    this.totalAverageHelps += 1;

    // Use uint8 for direct integer comparison
    const rollInt = this.rng.getUint8();

    // Simplified drop logic using pre-computed integer thresholds
    if (rollInt < this.ingredient0ThresholdInt) {
      // Berry drop
      this.totalBerryProduction += this.berryDropAmount;
      this.berryProductionPerDay[this.currentDay] += this.berryDropAmount;
    } else if (rollInt < this.ingredient30ThresholdInt) {
      // Level 0
      this.totalIngredientProduction[this.level0IngredientId] += this.level0IngredientAmount;
      this.ingredientProductionPerDay[this.currentDay][this.level0IngredientId] += this.level0IngredientAmount;
      this.ingredientsSinceLastCook[this.level0IngredientId] += this.level0IngredientAmount;
    } else if (rollInt < this.ingredient60ThresholdInt) {
      // Level 30
      this.totalIngredientProduction[this.level30IngredientId!] += this.level30IngredientAmount!;
      this.ingredientProductionPerDay[this.currentDay][this.level30IngredientId!] += this.level30IngredientAmount!;
      this.ingredientsSinceLastCook[this.level30IngredientId!] += this.level30IngredientAmount!;
    } else {
      // Level 60
      this.totalIngredientProduction[this.level60IngredientId!] += this.level60IngredientAmount!;
      this.ingredientProductionPerDay[this.currentDay][this.level60IngredientId!] += this.level60IngredientAmount!;
      this.ingredientsSinceLastCook[this.level60IngredientId!] += this.level60IngredientAmount!;
    }
  }

  public attemptDayHelp(currentMinutesSincePeriodStart: number): TeamSkillActivation[] {
    const frequency = this.calculateFrequencyWithEnergy();
    this.countFrequencyAndEnergyIntervals('day', frequency);

    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      this.attemptDayHelpInner();
      return this.skillState.attemptSkill();
    }

    return [];
  }

  public attemptNightHelp(currentMinutesSincePeriodStart: number) {
    const frequency = this.calculateFrequencyWithEnergy();
    this.countFrequencyAndEnergyIntervals('night', frequency);

    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      // update stats
      this.totalNightHelps += 1;

      // Ignoring inventory space for now, calculate what the help would be
      let totalDropAmount = 0;
      let isBerryDrop = false;
      let ingredientId: number | undefined;

      // Use uint8 for direct integer comparison
      const rollInt = this.rng.getUint8();

      if (rollInt < this.ingredient0ThresholdInt) {
        totalDropAmount = this.berryDropAmount;
        isBerryDrop = true;
      } else if (rollInt < this.ingredient30ThresholdInt) {
        // Level 0
        totalDropAmount = this.level0IngredientAmount;
        ingredientId = this.level0IngredientId;
      } else if (rollInt < this.ingredient60ThresholdInt) {
        // Level 30
        totalDropAmount = this.level30IngredientAmount!;
        ingredientId = this.level30IngredientId!;
      } else {
        // Level 60
        totalDropAmount = this.level60IngredientAmount!;
        ingredientId = this.level60IngredientId!;
      }

      const inventorySpace = Math.max(0, this.inventoryLimit - this.carriedAmount);

      // Easy case, inventory not full
      if (inventorySpace <= 0) {
        // Sneaky-snacking case
        this.nightHelpsAfterSS += 1;
        this.totalSneakySnackHelps += 1;
        // Sneaky snack always gives berries
        this.totalBerryProduction += this.berryDropAmount;
        this.berryProductionPerDay[this.currentDay] += this.berryDropAmount;
        this.totalAverageHelps += 1;

        if (!isBerryDrop) {
          // Track void ingredient drop
          this.voidIngredients[ingredientId!] += totalDropAmount;
        }
      } else {
        this.currentNightHelps += 1; // these run skill procs at wakeup
        this.nightHelpsBeforeSS += 1;

        this.carriedAmount += totalDropAmount; // we don't care if we overflow carriedAmount

        // Calculate how much of the help fits in the bag
        const helpRatio = inventorySpace >= totalDropAmount ? 1 : inventorySpace / totalDropAmount;
        this.totalAverageHelps += helpRatio;

        // Calculate how much of the help fits in the bag
        const dropAmount = Math.min(totalDropAmount, inventorySpace);

        if (isBerryDrop) {
          // Berry drop
          this.totalBerryProduction += dropAmount;
          this.berryProductionPerDay[this.currentDay] += dropAmount;
        } else {
          // Ingredient drop
          this.totalIngredientProduction[ingredientId!] += dropAmount;
          this.ingredientProductionPerDay[this.currentDay][ingredientId!] += dropAmount;
          this.ingredientsSinceLastCook[ingredientId!] += dropAmount;

          this.voidIngredients[ingredientId!] += totalDropAmount - dropAmount;
        }
      }

      this.nextHelp += frequency / 60;
    }
  }

  public scheduleHelp(currentMinutesSincePeriodStart: number) {
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      const frequency = this.calculateFrequencyWithEnergy();
      this.nextHelp += frequency / 60;
    }
  }

  /**
   * Rolls chance for skill proc on any unclaimed helps.
   * Resets carried amount.
   *
   * @returns team skill value for any skill procs that were stored in the inventory
   */
  public collectInventory(): TeamSkillActivation[] {
    let currentMorningProcs = 0;
    const bankedSkillProcs: TeamSkillActivation[] = [];
    for (let help = 0; help < this.currentNightHelps; help++) {
      if (currentMorningProcs > 1) {
        break;
      } else {
        const activations = this.skillState.attemptSkill();
        if (activations.length > 0) {
          bankedSkillProcs.push(...activations);
          currentMorningProcs += 1;
        }
      }
    }

    this.morningProcs += currentMorningProcs;
    this.currentNightHelps = 0;
    this.carriedAmount = 0;

    return bankedSkillProcs;
  }

  public degradeEnergy() {
    const energyToDegrade = Math.min(1, this.currentEnergy);
    this.currentEnergy = Math.max(0, MathUtils.round(this.currentEnergy - energyToDegrade, 2));
  }

  public results(iterations: number): MemberProduction {
    const totalSkillProduce: Produce = multiplyProduce(this.skillProduce, 1 / iterations); // so far only skill value has been added to totalProduce

    // Calculate total help produce based on tracked help counts
    const totalHelpProduce: Produce = {
      berries: [
        {
          berry: this.berry,
          level: this.level,
          amount: this.totalBerryProduction / iterations
        }
      ],
      ingredients: flatToIngredientSet(this.totalIngredientProduction.map((value) => value / iterations))
    };
    const produceTotal = CarrySizeUtils.addToInventory(totalSkillProduce, totalHelpProduce);

    const sneakySnack: BerrySet = {
      berry: this.berry,
      level: this.level,
      amount: Math.max(
        ...Array.from(this.berryDropAmounts).map(
          (value) => ((value as number) * this.totalSneakySnackHelps) / iterations
        )
      )
    };

    const {
      skillAmount,
      skillValue,
      skillProcs,
      skillCritValue,
      skillCrits,
      skillRegularValue,
      skillProcDistribution
    } = this.skillState.results(iterations);

    const totalHelps = (this.totalDayHelps + this.totalNightHelps) / iterations;
    const fiveMinIntervalsTotalDay = iterations * (TimeUtils.durationInMinutes(this.dayPeriod) / 5);
    const fiveMinIntervalsTotalNight = iterations * (TimeUtils.durationInMinutes(this.nightPeriod) / 5);

    // Calculate daily production distributions
    const berryProductionDistribution = calculateDistribution(this.berryProductionPerDay);
    const ingredientDistributions: { [ingredientName: string]: Record<number, number> } = {};

    // Initialize distribution objects for each ingredient that was produced
    const usedIngredients = new Set<string>();
    if (this.level0IngredientSet) usedIngredients.add(this.level0IngredientSet.ingredient.name);
    if (this.level30IngredientSet) usedIngredients.add(this.level30IngredientSet.ingredient.name);
    if (this.level60IngredientSet) usedIngredients.add(this.level60IngredientSet.ingredient.name);

    for (const ingredientName of usedIngredients) {
      const ingredientId = ING_ID_LOOKUP[ingredientName];
      // Extract daily values for this ingredient from the Float32Arrays
      const dailyValues = this.ingredientProductionPerDay.map((dayProduction) => dayProduction[ingredientId]);
      ingredientDistributions[ingredientName] = calculateDistribution(dailyValues);
    }

    return {
      produceTotal,
      produceWithoutSkill: totalHelpProduce,
      produceFromSkill: totalSkillProduce,
      skillAmount,
      skillValue,
      skillProcs,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients,
      advanced: {
        ingredientPercentage: this.ingredientPercentage,
        skillPercentage: this.skillPercentage,
        carrySize: this.inventoryLimit,
        maxFrequency: this.frequency80,
        dayHelps: this.totalDayHelps / iterations,
        nightHelps: this.totalNightHelps / iterations,
        averageHelps: this.totalAverageHelps / iterations,
        totalHelps,
        nightHelpsAfterSS: this.nightHelpsAfterSS / iterations,
        nightHelpsBeforeSS: this.nightHelpsBeforeSS / iterations,
        sneakySnack,
        skillCrits,
        skillRegularValue,
        skillCritValue,
        wastedEnergy: this.wastedEnergy / iterations,
        totalRecovery: this.totalRecovery / iterations,
        morningProcs: this.morningProcs / iterations,
        skillProcDistribution,
        berryProductionDistribution,
        ingredientDistributions,
        dayPeriod: {
          averageEnergy: this.energyIntervalsDay / fiveMinIntervalsTotalDay,
          averageFrequency: this.frequencyIntervalsDay / fiveMinIntervalsTotalDay,
          spilledIngredients: []
        },
        nightPeriod: {
          averageEnergy: this.energyIntervalsNight / fiveMinIntervalsTotalNight,
          averageFrequency: this.frequencyIntervalsNight / fiveMinIntervalsTotalNight,
          spilledIngredients: flatToIngredientSet(this.voidIngredients._mapUnary((amount) => amount / iterations))
        },
        frequencySplit: {
          zero: this.helpsAtFrequency0 / totalHelps,
          one: this.helpsAtFrequency1 / totalHelps,
          fourty: this.helpsAtFrequency40 / totalHelps,
          sixty: this.helpsAtFrequency60 / totalHelps,
          eighty: this.helpsAtFrequency80 / totalHelps
        },
        teamSupport: {
          energy: this.totalHealedByMembers / iterations,
          helps: this.totalHelpsByMembers / iterations
        }
      }
    };
  }

  public ivResults(iterations: number): MemberProductionBase {
    const totalSkillProduce: Produce = multiplyProduce(this.skillProduce, 1 / iterations);

    const totalHelpProduce: Produce = {
      berries: [
        {
          berry: this.berry,
          level: this.level,
          amount: this.totalBerryProduction / iterations
        }
      ],
      ingredients: flatToIngredientSet(this.totalIngredientProduction.map((value) => value / iterations))
    };

    const produceTotal = CarrySizeUtils.addToInventory(totalSkillProduce, totalHelpProduce);
    const { skillProcs } = this.skillState.results(iterations);

    return {
      produceTotal,
      skillProcs,
      externalId: this.id,
      pokemonWithIngredients: this.pokemonWithIngredients
    };
  }

  public simpleResults(iterations: number): SimpleTeamResult {
    const skillIngredients = ingredientSetToFloatFlat(multiplyProduce(this.skillProduce, 1 / iterations).ingredients);

    const { averageWeekdayPotSize, critMultiplier } = this.simpleCookingResults(iterations);
    const { skillProcs } = this.skillState.results(iterations);

    return {
      skillProcs,
      totalHelps: this.totalAverageHelps / iterations,
      skillIngredients,
      critMultiplier,
      averageWeekdayPotSize,
      member: this.member,
      ingredientPercentage: this.ingredientPercentage
    };
  }

  private countFrequencyAndEnergyIntervals(period: 'day' | 'night', frequency: number) {
    if (period === 'day') {
      this.frequencyIntervalsDay += frequency;
      this.energyIntervalsDay += this.currentEnergy;
    } else {
      this.frequencyIntervalsNight += frequency;
      this.energyIntervalsNight += this.currentEnergy;
    }
  }

  private simpleCookingResults(iterations: number) {
    if (!this.cookingState) {
      return {
        critMultiplier: AVERAGE_WEEKLY_CRIT_MULTIPLIER,
        averageWeekdayPotSize: MAX_POT_SIZE * (this.camp ? 1.5 : 1)
      };
    } else {
      const cookingResults = this.cookingState.results(iterations);
      return {
        critMultiplier: cookingResults.critInfo.averageCritMultiplierPerCook,
        averageWeekdayPotSize: cookingResults.critInfo.averageWeekdayPotSize
      };
    }
  }

  private calculateFrequencyWithEnergy() {
    const energy = this.currentEnergy; // Cache the value to avoid multiple property accesses
    if (energy >= 80) {
      this.helpsAtFrequency80++;
      return this.frequency80;
    }
    if (energy >= 60) {
      this.helpsAtFrequency60++;
      return this.frequency60;
    }
    if (energy >= 40) {
      this.helpsAtFrequency40++;
      return this.frequency40;
    }
    if (energy >= 1) {
      this.helpsAtFrequency1++;
      return this.frequency1;
    }
    this.helpsAtFrequency0++;
    return this.frequency0;
  }
}
