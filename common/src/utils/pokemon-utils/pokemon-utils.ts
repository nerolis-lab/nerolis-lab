import type { PokemonWithIngredients } from '../../types/pokemon';

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
