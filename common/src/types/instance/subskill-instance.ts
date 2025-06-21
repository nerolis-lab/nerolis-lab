import type { Subskill } from '../subskill/subskill';

export interface SubskillInstance {
  level: number;
  subskill: string;
}
export interface SubskillInstanceExt {
  level: number;
  subskill: Subskill;
}
