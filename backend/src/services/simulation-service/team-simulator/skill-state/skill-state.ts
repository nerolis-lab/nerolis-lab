import { NotImplementedError } from '@src/domain/error/programming/not-implemented-error.js';
import { calculateDistribution } from '@src/services/simulation-service/team-simulator/member-state/member-state-utils.js';
import type { MemberState } from '@src/services/simulation-service/team-simulator/member-state/member-state.js';
import type { SkillEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effect.js';
import { BerryBurstDisguiseEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-disguise-effect.js';
import { BerryBurstEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/berry-burst-effect.js';
import { ChargeEnergySEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-effect.js';
import { ChargeEnergySMoonlightEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/charge-energy-s-moonlight-effect.js';
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
import { IngredientMagnetSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/ingredient-magnet-s-effect.js';
import { MetronomeEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/metronome-effect.js';
import { SkillCopyEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-effect.js';
import { SkillCopyMimicEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-mimic-effect.js';
import { SkillCopyTransformEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/skill-copy-transform-effect.js';
import { TastyChanceSEffect } from '@src/services/simulation-service/team-simulator/skill-state/skill-effects/tasty-chance-s-effect.js';
import type {
  SkillActivationValue,
  TeamSkillActivation
} from '@src/services/simulation-service/team-simulator/skill-state/skill-state-types.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { Mainskill, MemberSkillValue } from 'sleepapi-common';
import { calculatePityProcThreshold, defaultZero, mainskill, mainskillUnits } from 'sleepapi-common';

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

    this.skillEffects = new Map([
      [mainskill.BERRY_BURST, new BerryBurstEffect()],
      [mainskill.BERRY_BURST_DISGUISE, new BerryBurstDisguiseEffect()],
      [mainskill.CHARGE_ENERGY_S, new ChargeEnergySEffect()],
      [mainskill.CHARGE_ENERGY_S_MOONLIGHT, new ChargeEnergySMoonlightEffect()],
      [mainskill.CHARGE_STRENGTH_M, new ChargeStrengthMEffect()],
      [mainskill.CHARGE_STRENGTH_S, new ChargeStrengthSEffect()],
      [mainskill.CHARGE_STRENGTH_S_RANGE, new ChargeStrengthSRangeEffect()],
      [mainskill.CHARGE_STRENGTH_S_STOCKPILE, new ChargeStrengthSStockpileEffect()],
      [mainskill.COOKING_POWER_UP_S, new CookingPowerUpSEffect()],
      [mainskill.DREAM_SHARD_MAGNET_S, new DreamShardMagnetSEffect()],
      [mainskill.DREAM_SHARD_MAGNET_S_RANGE, new DreamShardMagnetSRangeEffect()],
      [mainskill.ENERGIZING_CHEER_S, new EnergizingCheerSEffect()],
      [mainskill.ENERGY_FOR_EVERYONE, new EnergyForEveryoneEffect()],
      [mainskill.ENERGY_FOR_EVERYONE_LUNAR_BLESSING, new EnergyForEveryoneLunarBlessingEffect()],
      [mainskill.EXTRA_HELPFUL_S, new ExtraHelpfulSEffect()],
      [mainskill.HELPER_BOOST, new HelperBoostEffect()],
      [mainskill.INGREDIENT_MAGNET_S, new IngredientMagnetSEffect()],
      [mainskill.METRONOME, new MetronomeEffect()],
      [mainskill.SKILL_COPY, new SkillCopyEffect()],
      [mainskill.SKILL_COPY_MIMIC, new SkillCopyMimicEffect()],
      [mainskill.SKILL_COPY_TRANSFORM, new SkillCopyTransformEffect()],
      [mainskill.TASTY_CHANCE_S, new TastyChanceSEffect()]
    ]);

    this.pityProcThreshold = calculatePityProcThreshold(memberState.member.pokemonWithIngredients.pokemon);
  }

  // // TODO: apparently returning early here makes the team sim insanely fast, so skill handling is slower than expected
  public attemptSkill(): TeamSkillActivation[] {
    const activations: TeamSkillActivation[] = [];
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

  public addValue(value: SkillActivationValue) {
    this.regularValue += value.regular;
    this.critValue += value.crit;
  }

  public results(iterations: number) {
    const skillProcsPerDay = this.skillProcsPerDay.slice(1); // remove first wakeup when nothing has happened yet
    return {
      skillAmount: (this.regularValue + this.critValue) / iterations,
      skillValue: Object.fromEntries(
        Object.entries(this.skillValue)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([d_, value]) => value.amountToSelf > 0 || value.amountToTeam > 0)
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

  public skillLevel(skill: Mainskill) {
    return Math.min(this.memberState.member.settings.skillLevel, skill.maxLevel);
  }

  public skillAmount(skill: Mainskill) {
    return skill.amount(this.skillLevel(skill));
  }

  private activateSkill(skill: Mainskill): TeamSkillActivation {
    const effect = this.skillEffects.get(skill);
    if (!effect) {
      throw new NotImplementedError(`No SkillEffect implemented for skill: ${skill.name}`);
    }

    const activation = effect.activate(this);

    // update state
    this.skillProcs += 1;
    // checks both that selfValue is not undefined and also crit is > 0 since 0 is falsy
    this.skillCrits += activation?.selfValue?.crit || activation?.teamValue?.crit ? 1 : 0;
    this.helpsSinceLastSkillProc = 0;

    const selfRegular = defaultZero(activation.selfValue?.regular);
    const selfCrit = defaultZero(activation.selfValue?.crit);
    const teamRegular = defaultZero(activation.teamValue?.regular);
    const teamCrit = defaultZero(activation.teamValue?.crit);

    // only add self value directly, team value is added after team feedback in addValue
    this.regularValue += selfRegular;
    this.critValue += selfCrit;

    const entry = this.skillValue[skill.unit];
    entry.amountToSelf += selfRegular + selfCrit;
    entry.amountToTeam += teamRegular + teamCrit;

    return activation;
  }
}
