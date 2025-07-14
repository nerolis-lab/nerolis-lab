import type { Berry, GenderRatio, IngredientSet, Mainskill } from '../../types';
import type { Pokemon, PokemonSpecialty, PokemonWithIngredients } from '../../types/pokemon';
import { COMPLETE_POKEDEX } from '../../types/pokemon';

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
    name: displayName
      .toUpperCase()
      .replace(/\bFORM\b/, '')
      .replace(/\b\W+\b/, '_')
      .replace(/\W+/, ''),
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

export function getPokemon(name: string): Pokemon {
  const pkmn = COMPLETE_POKEDEX.find((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase());
  if (!pkmn) {
    throw new Error(`Can't find Pokemon with name ${name}`);
  }
  return pkmn;
}

export function hashPokemonWithIngredients(pokemonWithIngredients: {
  pokemon: string;
  ingredientList: { name: string }[];
}): string;
export function hashPokemonWithIngredients(pokemonWithIngredients: PokemonWithIngredients): string;
export function hashPokemonWithIngredients(
  pokemonWithIngredients: PokemonWithIngredients | { pokemon: string; ingredientList: { name: string }[] }
): string {
  const pokemonName =
    typeof pokemonWithIngredients.pokemon === 'string'
      ? pokemonWithIngredients.pokemon
      : pokemonWithIngredients.pokemon.name;

  const ingredients = pokemonWithIngredients.ingredientList
    .map((i) => ('ingredient' in i ? i.ingredient.name : i.name))
    .join(',');

  return `${pokemonName}:${ingredients}`;
}
