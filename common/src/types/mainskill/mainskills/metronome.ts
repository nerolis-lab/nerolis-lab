import { Mainskill, MAINSKILLS } from '../mainskill';
import { BerryBurstDisguise } from './berry-burst-disguise';
import { ChargeStrengthMBadDreams } from './charge-strength-m-bad-dreams';

export const Metronome = new (class extends Mainskill {
  name = 'Metronome';
  RP = [880, 1251, 1726, 2383, 3290, 4546, 5843];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description = (skillLevel: number) => `Uses one randomly chosen main skill.`;
  activations = {};
  image = 'metronome';

  readonly blockedSkills: Mainskill[] = [this, ChargeStrengthMBadDreams, BerryBurstDisguise];

  get metronomeSkills(): Mainskill[] {
    return MAINSKILLS.filter((skill) => {
      return !this.blockedSkills.some((blockedSkill) => skill.is(blockedSkill));
    });
  }
})(true);
