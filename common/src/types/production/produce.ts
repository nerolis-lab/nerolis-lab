import type { BerrySet } from '../berry/berry';
import type { IngredientSet } from '../ingredient/ingredient';
import type { SkillActivation } from './skill-activation';

export interface Produce {
  berries: BerrySet[];
  ingredients: IngredientSet[];
}
export interface ProduceFlat {
  berries: Float32Array;
  ingredients: Float32Array;
}

export function emptyProduce(): Produce {
  return { berries: [], ingredients: [] };
}

export interface DetailedProduce {
  produce: Produce;
  spilledIngredients: IngredientSet[];
  sneakySnack: BerrySet[];
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  averageTotalSkillProcs: number;
  skillActivations: SkillActivation[];
}
