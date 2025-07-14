import type { Berry } from '../../types/berry';
import type { GenderRatio } from '../../types/gender';
import type { IngredientSet } from '../../types/ingredient';
import type { Mainskill } from '../../types/mainskill';
import type { Pokemon, PokemonSpecialty } from '../../types/pokemon';

export function basePokemon(params: {
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
  const {
    name,
    displayName,
    pokedexNumber,
    specialty,
    frequency,
    ingredientPercentage,
    skillPercentage,
    berry,
    genders,
    carrySize,
    previousEvolutions,
    remainingEvolutions,
    ingredient0,
    ingredient30,
    ingredient60,
    skill
  } = params;
  return {
    name,
    displayName,
    pokedexNumber,
    specialty,
    frequency,
    ingredientPercentage,
    skillPercentage,
    berry,
    genders,
    carrySize,
    previousEvolutions,
    remainingEvolutions,
    ingredient0,
    ingredient30,
    ingredient60,
    skill
  };
}
