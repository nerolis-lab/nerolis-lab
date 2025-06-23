import type { Mainskill } from '../mainskill/mainskill';
import type { Produce } from '../production';

export interface SkillActivation {
  skill: Mainskill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  fractionOfProc: number;
  critChance?: number;
  adjustedProduce?: Produce;
}
