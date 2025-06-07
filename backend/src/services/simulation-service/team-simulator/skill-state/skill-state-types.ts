import type { Mainskill, MainskillUnit } from 'sleepapi-common';

export interface SelfActivationValue {
  regular: number;
  crit: number;
}
export interface TeamActivationValue extends SelfActivationValue {
  chanceToTargetLowestMember?: number; // optional, if undefined this skill does not randomize between members
}

export interface UnitActivation {
  unit: MainskillUnit;
  self?: SelfActivationValue;
  team?: TeamActivationValue;
}

export interface SkillActivation {
  skill: Mainskill;
  activations: UnitActivation[];
}
