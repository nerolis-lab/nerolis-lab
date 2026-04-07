import type { Mainskill, MainskillTargeting, MainskillUnit } from 'sleepapi-common';

export interface SelfActivationValue {
  regular: number;
  crit: number;
}
// TODO: Maybe replace both of these types with ActivationValue
export type TeamActivationValue = SelfActivationValue;

export interface UnitActivation {
  unit: MainskillUnit;
  self?: SelfActivationValue;
  team?: TeamActivationValue;
}

export interface SkillActivation {
  skill: Mainskill;
  targeting?: MainskillTargeting;
  activations: UnitActivation[];
}
