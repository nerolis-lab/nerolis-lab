import type { ActivationsType, AmountParams } from '../../mainskill';
import { Mainskill, MAINSKILLS } from '../../mainskill';
import { BerryBurstDisguise } from '../berry-burst/berry-burst-disguise';
import { BerryZonePsystrike } from '../berry-zone';
import { ChargeStrengthMBadDreams } from '../charge-strength-m/charge-strength-m-bad-dreams';
import {
  IngredientDrawSCutiefly,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSSandshrew
} from '../ingredient-draw-s';
import { IngredientMagnetSPlusToxtricity } from '../ingredient-magnet-s';
import { SkillCopyMimic } from '../skill-copy/skill-copy_mimic';
import { SkillCopyTransform } from '../skill-copy/skill-copy_transform';

const otherBlockedSkills: Mainskill[] = [
  BerryBurstDisguise,
  BerryZonePsystrike, // Unconfirmed
  ChargeStrengthMBadDreams,
  IngredientDrawSCutiefly,
  IngredientDrawSDwebble,
  IngredientDrawSHawlucha,
  IngredientDrawSSandshrew,
  IngredientMagnetSPlusToxtricity,
  SkillCopyMimic,
  SkillCopyTransform
];

export const Metronome = new (class extends Mainskill {
  name = 'Metronome';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  description = (_params: AmountParams) => `Uses one randomly chosen main skill.`;
  activations: ActivationsType = {};
  image = 'metronome';

  blockedSkillNames: string[] = [this, ...otherBlockedSkills].map((skill) => skill.uniqueName);

  get metronomeSkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !MetronomeBlockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);

export const MetronomeBlockedSkills = [Metronome, ...otherBlockedSkills];
