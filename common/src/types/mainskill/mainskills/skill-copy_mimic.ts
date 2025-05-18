import type { Mainskill } from '../mainskill';
import { MAINSKILLS, ModifiedMainskill } from '../mainskill';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';
import { SkillCopy } from './skill-copy';

export const SkillCopyMimic = new (class extends ModifiedMainskill {
  baseSkill = SkillCopy;
  modifierName = 'Mimic';
  RP = [600, 853, 1177, 1625, 2243, 3099, 3984];
  image = 'copy';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description = (skillLevel: number) =>
    `Copies and performs the main skill of one randomly selected Pokémon on the team.`;

  activations = {};

  readonly blockedSkills: Mainskill[] = [this, ChargeStrengthMBadDreams, BerryBurstDisguise];

  get copySkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !this.blockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);
