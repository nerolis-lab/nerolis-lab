import type { AmountParams } from '../mainskill';
import { Mainskill, MAINSKILLS } from '../mainskill';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';

// TODO: skill doesn't exist yet, values are guessed
export const SkillCopy = new (class extends Mainskill {
  name = 'Skill Copy';
  RP = [600, 853, 1177, 1625, 2243, 3099, 3984];
  image = 'copy';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description = (params: AmountParams) =>
    'Copies and performs the main skill of one randomly selected Pokémon on the team.';

  activations = {};

  readonly blockedSkills: Mainskill[] = [this, ChargeStrengthMBadDreams, BerryBurstDisguise];

  get copySkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !this.blockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);
