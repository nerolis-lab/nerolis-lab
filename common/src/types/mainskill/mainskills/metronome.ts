import type { AmountParams } from '../mainskill';
import { Mainskill, MAINSKILLS } from '../mainskill';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';
import { IngredientDrawS } from './ingredient-draw-s';
import { SkillCopyMimic } from './skill-copy_mimic';
import { SkillCopyTransform } from './skill-copy_transform';

export const Metronome = new (class extends Mainskill {
  name = 'Metronome';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description = (params: AmountParams) => `Uses one randomly chosen main skill.`;
  activations = {};
  image = 'metronome';

  readonly blockedSkills: Mainskill[] = [
    this,
    BerryBurstDisguise,
    ChargeStrengthMBadDreams,
    IngredientDrawS,
    SkillCopyMimic,
    SkillCopyTransform
    // Toxtricity's version of Plus is blocked, but we don't yet correctly split that into two skills
  ];

  get metronomeSkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !this.blockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);
