import type { IngredientSet } from '../ingredient/ingredient';
import type { Mainskill } from '../mainskill/mainskill';
import type { Time } from '../time/time';
import type { Produce } from './produce';

export interface Summary {
  ingredientPercentage: number;
  skillPercentage: number;
  carrySize: number;

  skill: Mainskill;
  skillProcs: number;
  skillEnergySelfValue: number;
  skillEnergyOthersValue: number;
  skillProduceValue: Produce;
  skillBerriesOtherValue: number;
  skillStrengthValue: number;
  skillDreamShardValue: number;
  skillPotSizeValue: number;
  skillHelpsValue: number;
  skillTastyChanceValue: number;

  nrOfHelps: number;
  helpsBeforeSS: number;
  helpsAfterSS: number;

  totalProduce: Produce;

  averageEnergy: number;
  averageFrequency: number;

  spilledIngredients: IngredientSet[];

  collectFrequency?: Time;

  totalRecovery: number;
}
