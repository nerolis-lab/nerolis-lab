import type { Berry, GenderRatio, Ingredient, IngredientSet, Mainskill } from '../../types';
import type { Pokemon, PokemonSpecialty, PokemonWithIngredients } from '../../types/pokemon';
import { COMPLETE_POKEDEX } from '../../types/pokemon';
import { getIngredientAmount } from '../ingredient-utils';

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
  ingredient0?: IngredientSet[];
  ingredient30?: IngredientSet[];
  ingredient60?: IngredientSet[];
  ingredientA?: Ingredient;
  ingredientB?: Ingredient;
  ingredientC?: Ingredient;
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
    ingredientA,
    ingredientB,
    ingredientC,
    skill
  } = params;
  const abcSpecified = ingredientA !== undefined && ingredientB !== undefined;
  const dropsSpecified = ingredient0 !== undefined && ingredient30 !== undefined && ingredient60 !== undefined;
  if (abcSpecified === dropsSpecified) {
    throw new Error(
      'Expected either AB(C) ingredients or 0/30/60 ingredient sets to be specified. Got both or neither.'
    );
  }
  let ingredient0Normalized: IngredientSet[];
  let ingredient30Normalized: IngredientSet[];
  let ingredient60Normalized: IngredientSet[];
  if (ingredient0 && ingredient30 && ingredient60) {
    ingredient0Normalized = ingredient0;
    ingredient30Normalized = ingredient30;
    ingredient60Normalized = ingredient60;
  } else if (ingredientA && ingredientB) {
    ingredient0Normalized = [
      { amount: getIngredientAmount(ingredientA, ingredientA, 0, specialty), ingredient: ingredientA }
    ];
    ingredient30Normalized = [
      { amount: getIngredientAmount(ingredientA, ingredientA, 30, specialty), ingredient: ingredientA },
      { amount: getIngredientAmount(ingredientB, ingredientA, 30, specialty), ingredient: ingredientB }
    ];
    ingredient60Normalized = [
      { amount: getIngredientAmount(ingredientA, ingredientA, 60, specialty), ingredient: ingredientA },
      { amount: getIngredientAmount(ingredientB, ingredientA, 60, specialty), ingredient: ingredientB }
    ];
    if (ingredientC) {
      ingredient60Normalized.push({
        amount: getIngredientAmount(ingredientC, ingredientA, 60, specialty),
        ingredient: ingredientC
      });
    }
  }
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
    ingredient0: ingredient0Normalized,
    ingredient30: ingredient30Normalized,
    ingredient60: ingredient60Normalized,
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
