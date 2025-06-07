import { NotImplementedError } from '@src/domain/error/programming/not-implemented-error.js';
import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import { BerryBurstDisguiseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-disguise-effect.js';
import { BerryBurstEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-effect.js';
import { ChargeEnergySEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-effect.js';
import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-moonlight-effect.js';
import { ChargeStrengthMBadDreamsEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m-bad-dreams-effect.js';
import { ChargeStrengthMEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-m-effect.js';
import { ChargeStrengthSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-effect.js';
import { ChargeStrengthSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-range-effect.js';
import { ChargeStrengthSStockpileEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-strength-s-stockpile-effect.js';
import { CookingPowerUpSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/cooking-power-up-s-effect.js';
import { DreamShardMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s-effect.js';
import { DreamShardMagnetSRangeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/dream-shard-magnet-s-range-effect.js';
import { EnergizingCheerSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energizing-cheer-s-effect.js';
import { EnergyForEveryoneEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-effect.js';
import { EnergyForEveryoneLunarBlessingEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/energy-for-everyone-lunar-blessing-effect.js';
import { ExtraHelpfulSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/extra-helpful-s-effect.js';
import { HelperBoostEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/helper-boost-effect.js';
import { IngredientDrawSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-draw-s-effect.js';
import { IngredientDrawSSuperLuckEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-draw-s-super-luck-effect.js';
import { IngredientMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s-effect.js';
import { MetronomeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/metronome-effect.js';
import { SkillCopyEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-effect.js';
import { SkillCopyMimicEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-mimic-effect.js';
import { SkillCopyTransformEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-transform-effect.js';
import { TastyChanceSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/tasty-chance-s-effect.js';
import type {
  SkillActivation,
  TeamActivationValue
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { Mainskill, MainskillActivation, MainskillUnit, MemberSkillValue } from 'sleepapi-common';
import {
  BerryBurst,
  BerryBurstDisguise,
  calculatePityProcThreshold,
  ChargeEnergyS,
  ChargeEnergySMoonlight,
  ChargeStrengthM,
  ChargeStrengthMBadDreams,
  ChargeStrengthS,
  ChargeStrengthSRange,
  ChargeStrengthSStockpile,
  CookingPowerUpS,
  defaultZero,
  DreamShardMagnetS,
  DreamShardMagnetSRange,
  EnergizingCheerS,
  EnergyForEveryone,
  EnergyForEveryoneLunarBlessing,
  ExtraHelpfulS,
  HelperBoost,
  IngredientDrawS,
  IngredientDrawSSuperLuck,
  IngredientMagnetS,
  mainskillUnits,
  Metronome,
  SkillCopy,
  SkillCopyMimic,
  SkillCopyTransform,
  TastyChanceS
} from 'sleepapi-common';

export class SkillState {
  memberState: MemberState;
  skillEffects: Map<Mainskill, SkillEffect>;
  rng: PreGeneratedRandom;

  // quick access
  private pityProcThreshold;

  // state
  private helpsSinceLastSkillProc = 0;
  private todaysSkillProcs = 0;

  // stats
  private skillValue: MemberSkillValue = Object.fromEntries(
    mainskillUnits.map((key) => [key, { amountToSelf: 0, amountToTeam: 0 }])
  ) as MemberSkillValue;
  private regularValue = 0;
  private critValue = 0;
  private skillProcs = 0;
  private skillCrits = 0;
  private skillProcsPerDay: number[] = [];

  constructor(memberState: MemberState, rng: PreGeneratedRandom) {
    this.memberState = memberState;
    this.rng = rng;

    this.skillEffects = new Map<Mainskill, SkillEffect>([
      [BerryBurst, new BerryBurstEffect()],
      [BerryBurstDisguise, new BerryBurstDisguiseEffect()],
      [ChargeEnergyS, new ChargeEnergySEffect()],
      [ChargeEnergySMoonlight, new ChargeEnergySMoonlightEffect()],
      [ChargeStrengthM, new ChargeStrengthMEffect()],
      [ChargeStrengthMBadDreams, new ChargeStrengthMBadDreamsEffect()],
      [ChargeStrengthS, new ChargeStrengthSEffect()],
      [ChargeStrengthSRange, new ChargeStrengthSRangeEffect()],
      [ChargeStrengthSStockpile, new ChargeStrengthSStockpileEffect()],
      [CookingPowerUpS, new CookingPowerUpSEffect()],
      [DreamShardMagnetS, new DreamShardMagnetSEffect()],
      [DreamShardMagnetSRange, new DreamShardMagnetSRangeEffect()],
      [EnergizingCheerS, new EnergizingCheerSEffect()],
      [EnergyForEveryone, new EnergyForEveryoneEffect()],
      [EnergyForEveryoneLunarBlessing, new EnergyForEveryoneLunarBlessingEffect()],
      [ExtraHelpfulS, new ExtraHelpfulSEffect()],
      [HelperBoost, new HelperBoostEffect()],
      [IngredientMagnetS, new IngredientMagnetSEffect()],
      [IngredientDrawS, new IngredientDrawSEffect()],
      [IngredientDrawSSuperLuck, new IngredientDrawSSuperLuckEffect()],
      [Metronome, new MetronomeEffect()],
      [SkillCopy, new SkillCopyEffect()],
      [SkillCopyMimic, new SkillCopyMimicEffect()],
      [SkillCopyTransform, new SkillCopyTransformEffect()],
      [TastyChanceS, new TastyChanceSEffect()]
    ]);

    this.pityProcThreshold = calculatePityProcThreshold(memberState.member.pokemonWithIngredients.pokemon);
  }

  // // TODO: apparently returning early here makes the team sim insanely fast, so skill handling is slower than expected
  public attemptSkill(): SkillActivation[] {
    const activations: SkillActivation[] = [];
    this.helpsSinceLastSkillProc += 1;

    if (this.helpsSinceLastSkillProc > this.pityProcThreshold || this.rng() < this.skillPercentage) {
      this.todaysSkillProcs += 1;
      activations.push(this.activateSkill(this.skill));
    }

    return activations;
  }

  public wakeup() {
    this.skillProcsPerDay.push(this.todaysSkillProcs);
    this.todaysSkillProcs = 0;
  }

  public addValue(value: TeamActivationValue) {
    this.regularValue += value.regular;
    this.critValue += value.crit;
  }

  public addSkillValue(params: { unit: MainskillUnit; amountToSelf: number; amountToTeam: number }) {
    const { unit, amountToSelf, amountToTeam } = params;
    const entry = this.skillValue[unit];
    entry.amountToSelf += amountToSelf;
    entry.amountToTeam += amountToTeam;
  }

  public results(iterations: number) {
    const skillProcsPerDay = this.skillProcsPerDay.slice(1); // remove first wakeup when nothing has happened yet
    return {
      skillAmount: (this.regularValue + this.critValue) / iterations,
      skillValue: Object.fromEntries(
        Object.entries(this.skillValue)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([d_, value]) => value.amountToSelf !== 0 || value.amountToTeam !== 0)
          .map(([key, value]) => [
            key,
            {
              amountToSelf: value.amountToSelf / iterations,
              amountToTeam: value.amountToTeam / iterations
            }
          ])
      ) as MemberSkillValue,
      skillProcs: this.skillProcs / iterations,
      skillCrits: this.skillCrits / iterations,
      skillRegularValue: this.regularValue / iterations,
      skillCritValue: this.critValue / iterations,
      skillProcDistribution: calculateDistribution(skillProcsPerDay)
    };
  }

  get skill() {
    return this.memberState.skill;
  }

  get skillPercentage() {
    return this.memberState.skillPercentage;
  }

  get skillLevel() {
    return this.memberState.member.settings.skillLevel;
  }

  public skillAmount(activation: MainskillActivation) {
    return activation.amount(this.skillLevel);
  }

  private activateSkill(skill: Mainskill): SkillActivation {
    const effect = this.skillEffects.get(skill);
    if (!effect) {
      throw new NotImplementedError(`No SkillEffect implemented for skill: ${skill.name}`);
    }

    const skillActivation: SkillActivation = effect.activate(this);

    // update state
    this.skillProcs += 1;
    this.helpsSinceLastSkillProc = 0;

    let hadACrit = false;
    for (const activation of skillActivation.activations) {
      const selfRegular = defaultZero(activation.self?.regular);
      const selfCrit = defaultZero(activation.self?.crit);
      const teamRegular = defaultZero(activation.team?.regular);
      const teamCrit = defaultZero(activation.team?.crit);

      if (selfCrit > 0 || teamCrit > 0) {
        hadACrit = true;
      }

      // only add self value directly, team value is added after team feedback in addValue
      this.regularValue += selfRegular;
      this.critValue += selfCrit;

      const entry = this.skillValue[activation.unit];
      entry.amountToSelf += selfRegular + selfCrit;
      entry.amountToTeam += teamRegular + teamCrit;
    }

    if (hadACrit) {
      this.skillCrits += 1;
    }
    return skillActivation;
  }
}
