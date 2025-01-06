import type { PokemonGender } from '../gender/gender';
import type { IngredientInstance } from './ingredient-instance';
import type { SubskillInstance } from './subskill-instance';

export interface PokemonInstance {
  pokemon: string;
  level: number;
  ribbon: number;
  carrySize: number;
  skillLevel: number;
  nature: string;
  subskills: SubskillInstance[];
  ingredients: IngredientInstance[];
}

export interface PokemonInstanceWithMeta extends PokemonInstance {
  version: number;
  externalId: string;
  saved: boolean;
  shiny: boolean;
  gender: PokemonGender;
  name: string;
}
