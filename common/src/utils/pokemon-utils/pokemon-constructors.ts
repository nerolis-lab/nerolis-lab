import type { Berry } from '../../types/berry';
import type { GenderRatio } from '../../types/gender';
import type { IngredientSet } from '../../types/ingredient';
import type { Mainskill } from '../../types/mainskill';
import type { Pokemon, PokemonSpecialty } from '../../types/pokemon';

export function nameFromDisplayName(displayName: string): string {
  return displayName
    .toUpperCase()
    .replace(/\bFORM\b/, '')
    .replace("'", '')
    .replace(/\b\W+\b/, '_')
    .replace(/\W+/, '');
}

export function basePokemon(params: {
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
    name: nameFromDisplayName(displayName),
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
