import type { Pokemon, PokemonWithIngredients } from '../../types/pokemon';
import { COMPLETE_POKEDEX } from '../../types/pokemon';

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
