import { getPokemon } from 'sleepapi-common'

export function findPokemon(name: string) {
  const trimmedName = name.split('_')
  const pokemonName = trimmedName.filter((word) => !['shiny', 'happy'].includes(word)).join('_')
  return getPokemon(pokemonName)
}
