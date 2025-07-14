import type { Berry } from '../../types/berry';
import type { GenderRatio } from '../../types/gender';
import type { IngredientSet } from '../../types/ingredient';
import type { Mainskill } from '../../types/mainskill';
import type { Pokemon, PokemonSpecialty } from '../../types/pokemon';

function createPokemon(params: {
  name: string;
  displayName: string;
  pokedexNumber: number;
  specialty: PokemonSpecialty;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}): Pokemon {
  return {
    ...params
  };
}

export function createAllSpecialist(params: {
  name: string;
  displayName: string;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'all'
  });
}

export function createBerrySpecialist(params: {
  name: string;
  displayName: string;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'berry'
  });
}

export function createIngredientSpecialist(params: {
  name: string;
  displayName: string;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'ingredient'
  });
}

export function createSkillSpecialist(params: {
  name: string;
  displayName: string;
  pokedexNumber: number;
  frequency: number;
  ingredientPercentage: number;
  skillPercentage: number;
  berry: Berry;
  genders: GenderRatio;
  carrySize: number;
  previousEvolutions: number;
  remainingEvolutions: number;
  ingredient0: IngredientSet[];
  ingredient30: IngredientSet[];
  ingredient60: IngredientSet[];
  skill: Mainskill;
}): Pokemon {
  return createPokemon({
    ...params,
    specialty: 'skill'
  });
}
