import type { Mainskill } from 'sleepapi-common';

export interface SkillActivationValue {
  regular: number;
  crit: number;
  chanceToTargetLowestMember?: number; // optional, if undefined this skill does not randomize between members
}

export interface TeamSkillActivation {
  skill: Mainskill;
  selfValue?: SkillActivationValue;
  teamValue?: SkillActivationValue;
}
