import type { SleepInfo } from '@src/domain/sleep/sleep-info.js';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator.js';
import type { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import type {
  SkillActivationValue,
  TeamSkillActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import { calculateSkillProcDistribution } from '@src/services/simulation-service/team-simulator/skill-state/skill-state-utils.js';
import { SkillState } from '@src/services/simulation-service/team-simulator/skill-state/skill-state.js';
import { TeamSimulatorUtils } from '@src/services/simulation-service/team-simulator/team-simulator-utils.js';
import { getMealRecoveryAmount } from '@src/utils/meal-utils/meal-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type {
  BerryIndexToFloatAmount,
  BerrySet,
  IngredientSet,
  MemberProduction,
  MemberProductionBase,
  PokemonWithIngredientsIndexed,
  Produce,
  ProduceFlat,
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
  RandomUtils,
  berrySetToFlat,
  calculateNrOfBerriesPerDrop,
  emptyBerryInventoryFloat,
  emptyIngredientInventoryFloat,
  flatToBerrySet,
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
  private helpsSinceLastCook = 0;
  private totalAverageHelps = 0;
  private totalSneakySnackHelps = 0;
  private totalBerryHelps = 0;
  private totalIngredientHelps = emptyIngredientInventoryFloat();
  private voidHelps = 0;

  // We want to produce histograms showing the distribution of how many helps we
  // got over the Monte Carlo simulations.  The way that MemberState is
  // interacted with over the simulations is that we repeatedly run the sim
  // with the *same* MemberState.  So we cannot have a single counter for
  // number of helps.  Instead, we need a per-day counter, which we then shove
  // into an array so we know exactly how much we produced each day.
  private berryProductionPerDay: number[] = [];
  private ingredientProductionPerDay: { [ingredientName: string]: number[] } = {};
  private currentDayBerryProduction = 0;
  private currentDayIngredientProduction: { [ingredientName: string]: number } = {};

  // Precomputed information about what ingredients the pokemon can drop.
  // Null if the Pokemon isn't leveled enough to unlock an ingredient.
  private level0IngredientSet: IngredientSet;
  private level30IngredientSet: IngredientSet | null = null;
  private level60IngredientSet: IngredientSet | null = null;
  // Either [0], [0, 1] or [0, 1, 2]
  private possibleIngredientLevels: number[] = [];

  // stats
  private frequency0;
  private frequency1;
  private frequency40;
  private frequency60;
  private frequency80;
  public skillPercentage: number;
  private ingredientPercentage: number;
  private sneakySnackBerries: BerryIndexToFloatAmount = emptyBerryInventoryFloat();

  // Pre-compute how many berries the Pokemon produces per drop
  private berryDropAmounts: Float32Array = new Float32Array();
  private berryDropAmount: number = 0;

  // summary

  // NB: Although this /looks/ like the total production over all Monte Carlo
  // runs, it isn't; this is a special extra production variable that is
  // modified by SkillState.
  totalProduce: Produce = CarrySizeUtils.getEmptyInventory();
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

  // This is for tracking how many ingredients for each cook, it's reset every
  // time we do a cook
  private ingredientHelpsSinceLastCook: { [ingredientName: string]: number } = {};

  constructor(params: {
    member: TeamMemberExt;
    team: TeamMemberExt[];
    settings: TeamSettingsExt;
    cookingState: CookingState | undefined;
  }) {
    const { member, team, settings, cookingState } = params;

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

    // Pre-calculate ingredient amounts by level using IngredientSet and initialize tracking
    const allIngredients = [];

    // Initialize ingredient sets from the Pokemon's actual ingredient list
    const ingredientList = member.pokemonWithIngredients.ingredientList;
    
    // Level 0 ingredient is always the first one
    this.level0IngredientSet = ingredientList[0];
    this.possibleIngredientLevels.push(0);
    allIngredients.push(ingredientList[0]);

    // Level 30 ingredient is second if available
    if (member.settings.level >= 30 && ingredientList.length > 1) {
      this.level30IngredientSet = ingredientList[1];
      this.possibleIngredientLevels.push(1);
      allIngredients.push(ingredientList[1]);
    } else {
      this.level30IngredientSet = null;
    }

    // Level 60 ingredient is third if available
    if (member.settings.level >= 60 && ingredientList.length > 2) {
      this.level60IngredientSet = ingredientList[2];
      this.possibleIngredientLevels.push(2);
      allIngredients.push(ingredientList[2]);
    } else {
      this.level60IngredientSet = null;
    }

    // Initialize tracking for all ingredients
    for (const ing of allIngredients) {
      const ingName = ing.ingredient.name;
      this.ingredientProductionPerDay[ingName] = [];
      this.currentDayIngredientProduction[ingName] = 0;
      this.ingredientHelpsSinceLastCook[ingName] = 0;
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

    this.berryDropAmounts = Float32Array.from(memberBerryInList, (value) => value * berriesPerDrop);
    this.berryDropAmount = Math.max(...this.berryDropAmounts);

    this.sneakySnackBerries = memberBerryInList.map((amount) => (amount *= berriesPerDrop));

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
    this.skillState = new SkillState(this);
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

    // Track daily production
    this.berryProductionPerDay.push(this.currentDayBerryProduction);
    for (const [ingredientName, production] of Object.entries(this.currentDayIngredientProduction)) {
      this.ingredientProductionPerDay[ingredientName].push(production);
    }
    
    this.currentDayBerryProduction = 0;
    for (const ingredientName in this.currentDayIngredientProduction) {
      this.currentDayIngredientProduction[ingredientName] = 0;
    }

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

    this.helpsSinceLastCook += totalHelps;
    this.totalAverageHelps += totalHelps;
  }

  public updateIngredientBag() {
    // Calculate total ingredients from each level's helps
    const totalIngredients = emptyIngredientInventoryFloat();
    
    // Add up all ingredient helps
    for (const [ingredientName, helps] of Object.entries(this.ingredientHelpsSinceLastCook)) {
      const index = ING_ID_LOOKUP[ingredientName];
      let amount = 0;
      
      // Find the matching ingredient set to get the amount
      if (this.level0IngredientSet && this.level0IngredientSet.ingredient.name === ingredientName) {
        amount = this.level0IngredientSet.amount;
      } else if (this.level30IngredientSet && this.level30IngredientSet.ingredient.name === ingredientName) {
        amount = this.level30IngredientSet.amount;
      } else if (this.level60IngredientSet && this.level60IngredientSet.ingredient.name === ingredientName) {
        amount = this.level60IngredientSet.amount;
      }
      
      totalIngredients[index] = amount * helps;
    }
    
    this.cookingState?.addIngredients(totalIngredients);
    
    // Reset help counters
    for (const ingredientName in this.ingredientHelpsSinceLastCook) {
      this.ingredientHelpsSinceLastCook[ingredientName] = 0;
    }
  }

  public recoverMeal() {
    this.totalRecovery += getMealRecoveryAmount(this.currentEnergy);
    this.currentEnergy += getMealRecoveryAmount(this.currentEnergy);
  }

  public attemptDayHelp(currentMinutesSincePeriodStart: number): TeamSkillActivation[] {
    const frequency = this.calculateFrequencyWithEnergy();
    this.countFrequencyAndEnergyIntervals('day', frequency);
    if (currentMinutesSincePeriodStart >= this.nextHelp) {
      this.totalDayHelps += 1;
      this.totalAverageHelps += 1;
      this.helpsSinceLastCook += 1;

      // Roll for berry vs ingredient
      if (RandomUtils.roll(1 - this.ingredientPercentage)) {
        // Berry drop
        this.totalBerryHelps += 1;
        this.currentDayBerryProduction += 1;
      } else {
        // Ingredient drop
        // Roll for which ingredient level (equal probability)
        const roll = RandomUtils.randomElement(this.possibleIngredientLevels) ?? 0;
        let ingredientSet: IngredientSet | null = null;
        if (roll === 2 && this.level60IngredientSet) { // Level 60
          ingredientSet = this.level60IngredientSet;
        } else if (roll === 1 && this.level30IngredientSet) { // Level 30
          ingredientSet = this.level30IngredientSet;
        } else { // Level 0
          ingredientSet = this.level0IngredientSet;
        }

        if (ingredientSet) {
          const ingredientName = ingredientSet.ingredient.name;
          const ingredientId = ING_ID_LOOKUP[ingredientName];
          this.totalIngredientHelps[ingredientId] += 1;
          this.currentDayIngredientProduction[ingredientName] = 
            (this.currentDayIngredientProduction[ingredientName] || 0) + ingredientSet.amount;
          this.ingredientHelpsSinceLastCook[ingredientName] = 
            (this.ingredientHelpsSinceLastCook[ingredientName] || 0) + 1;
        }
      }

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

      const inventorySpace = this.inventoryLimit - this.carriedAmount;
      if (inventorySpace > 0) {
        this.currentNightHelps += 1; // these run skill procs at wakeup
        this.nightHelpsBeforeSS += 1;

        // Calculate total drop amount for this help
        let totalDropAmount = 0;
        let isBerryDrop = false;
        let ingredientSet: IngredientSet | null = null;
        if (RandomUtils.roll(1 - this.ingredientPercentage)) {
          // Berry drop
          totalDropAmount = this.berryDropAmount;
          isBerryDrop = true;
        } else {
          // Ingredient drop - roll for which level (equal probability)
          const roll = RandomUtils.randomElement(this.possibleIngredientLevels) ?? 0;
          if (roll === 2 && this.level60IngredientSet) { // Level 60
            ingredientSet = this.level60IngredientSet;
          } else if (roll === 1 && this.level30IngredientSet) { // Level 30
            ingredientSet = this.level30IngredientSet;
          } else { // Level 0
            ingredientSet = this.level0IngredientSet;
          }
          if (ingredientSet) {
            totalDropAmount = ingredientSet.amount;
          }
        }

        this.carriedAmount += totalDropAmount;

        // Calculate how much of the help fits in the bag
        const helpRatio = inventorySpace >= totalDropAmount ? 1 : inventorySpace / totalDropAmount;
        this.totalAverageHelps += helpRatio;
        this.helpsSinceLastCook += helpRatio;
        
        if (isBerryDrop) {
          // Berry drop
          this.totalBerryHelps += helpRatio;
        } else if (ingredientSet) {
          // Ingredient drop
          const ingredientName = ingredientSet.ingredient.name;
          const ingredientId = ING_ID_LOOKUP[ingredientName];
          this.totalIngredientHelps[ingredientId] += helpRatio;
          // Add to the current day's production array since it will be pushed to per-day tracking at wakeup
          if (!this.ingredientProductionPerDay[ingredientName]) {
            this.ingredientProductionPerDay[ingredientName] = [];
          }
          this.currentDayIngredientProduction[ingredientName] = 
            (this.currentDayIngredientProduction[ingredientName] || 0) + helpRatio * ingredientSet.amount;
          this.ingredientHelpsSinceLastCook[ingredientName] = 
            (this.ingredientHelpsSinceLastCook[ingredientName] || 0) + helpRatio;
        }
        
        if (helpRatio < 1) {
          this.voidHelps += 1 - helpRatio;
        }
      } else {
        this.nightHelpsAfterSS += 1;
        this.totalSneakySnackHelps += 1;
        // Sneaky snack always gives berries
        this.totalBerryHelps += 1;
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
    const totalSkillProduce: Produce = multiplyProduce(this.totalProduce, 1 / iterations); // so far only skill value has been added to totalProduce

    // Calculate total help produce based on tracked help counts
    const totalHelpProduceFlat: ProduceFlat = {
      berries: this.berryDropAmounts._mapUnary(
        (dropAmount) => (dropAmount * this.totalBerryHelps) / iterations
      ),
      ingredients: emptyIngredientInventoryFloat()
    };

    // Add ingredients based on tracked help counts
    if (this.level0IngredientSet) {
      const index0 = ING_ID_LOOKUP[this.level0IngredientSet.ingredient.name];
      totalHelpProduceFlat.ingredients[index0] = this.level0IngredientSet.amount * this.totalIngredientHelps[index0] / iterations;
    }
    if (this.level30IngredientSet) {
      const index30 = ING_ID_LOOKUP[this.level30IngredientSet.ingredient.name];
      totalHelpProduceFlat.ingredients[index30] = this.level30IngredientSet.amount * this.totalIngredientHelps[index30] / iterations;
    }
    if (this.level60IngredientSet) {
      const index60 = ING_ID_LOOKUP[this.level60IngredientSet.ingredient.name];
      totalHelpProduceFlat.ingredients[index60] = this.level60IngredientSet.amount * this.totalIngredientHelps[index60] / iterations;
    }

    const totalHelpProduce: Produce = {
      berries: flatToBerrySet(totalHelpProduceFlat.berries, this.level),
      ingredients: flatToIngredientSet(totalHelpProduceFlat.ingredients)
    };
    const produceTotal = CarrySizeUtils.addToInventory(totalSkillProduce, totalHelpProduce);

    const spilledHelps = this.voidHelps + this.totalSneakySnackHelps;
    // Calculate spilled ingredients based on level-specific ingredient amounts
    const spilledIngredientsFlat = emptyIngredientInventoryFloat();
    const combinedSpill: { [key: string]: number } = {};
    combinedSpill[this.level0IngredientSet.ingredient.name] = this.level0IngredientSet.amount;
    if (this.member.settings.level >= 30 && this.level30IngredientSet) {
      combinedSpill[this.level30IngredientSet.ingredient.name] = this.level30IngredientSet.amount;
    }
    if (this.member.settings.level >= 60 && this.level60IngredientSet) {
      combinedSpill[this.level60IngredientSet.ingredient.name] = this.level60IngredientSet.amount;
    }
    for (const ingredient in combinedSpill) {
      const index = ING_ID_LOOKUP[ingredient];
      spilledIngredientsFlat[index] = (combinedSpill[ingredient] * spilledHelps) / iterations;
    }
    const spilledIngredients = flatToIngredientSet(spilledIngredientsFlat);

    const sneakySnack: BerrySet = {
      berry: this.berry,
      level: this.level,
      amount: Math.max(...this.sneakySnackBerries._mutateUnary((a) => (a * this.totalSneakySnackHelps) / iterations))
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
    const berryProductionDistribution = calculateSkillProcDistribution(this.berryProductionPerDay);
    const ingredientDistributions: { [ingredientName: string]: Record<number, number> } = {};
    
    for (const [ingredientName, productions] of Object.entries(this.ingredientProductionPerDay)) {
      ingredientDistributions[ingredientName] = calculateSkillProcDistribution(productions);
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
          spilledIngredients
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
    const totalSkillProduce: Produce = multiplyProduce(this.totalProduce, 1 / iterations);

    const totalHelpProduceFlat: ProduceFlat = {
      berries: this.berryDropAmounts._mapUnary(
        (dropAmount) => (dropAmount * this.totalBerryHelps) / iterations
      ),
      ingredients: this.totalIngredientHelps._mapUnary(
        (helps) => helps / iterations
      )
    };

    const totalHelpProduce: Produce = {
      berries: flatToBerrySet(totalHelpProduceFlat.berries, this.level),
      ingredients: flatToIngredientSet(totalHelpProduceFlat.ingredients)
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
    const skillIngredients = ingredientSetToFloatFlat(multiplyProduce(this.totalProduce, 1 / iterations).ingredients);

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
    if (this.currentEnergy >= 80) {
      this.helpsAtFrequency80 += 1;
      return this.frequency80;
    } else if (this.currentEnergy >= 60) {
      this.helpsAtFrequency60 += 1;
      return this.frequency60;
    } else if (this.currentEnergy >= 40) {
      this.helpsAtFrequency40 += 1;
      return this.frequency40;
    } else if (this.currentEnergy >= 1) {
      this.helpsAtFrequency1 += 1;
      return this.frequency1;
    } else {
      this.helpsAtFrequency0 += 1;
      return this.frequency0;
    }
  }
}
