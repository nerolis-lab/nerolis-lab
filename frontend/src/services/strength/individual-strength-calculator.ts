import { useTeamStore } from '@/stores/team/team-store'
import { UserService } from '@/services/user/user-service'
import { type PokemonInstanceExt } from 'sleepapi-common'

interface ScoredPokemon {
  pokemon: PokemonInstanceExt
  strength: number
}

let cachedPokemonStrengths: ScoredPokemon[] | null = null
let cachedBoxedPokemonIds: string[] | null = null

/**
 * Calculates and caches the strength of all boxed Pokémon.
 * If the list of boxed Pokémon hasn't changed, returns the cached results.
 */
export const calculateAndCachePokemonStrengths = async (): Promise<ScoredPokemon[]> => {
  const teamStore = useTeamStore()

  // Fetch all boxed Pokémon
  const boxedPokemon = await UserService.getUserPokemon()
  const boxedPokemonIds = boxedPokemon.map((pokemon) => pokemon.externalId)

  // Check if the cached list matches the current list
  if (cachedBoxedPokemonIds && cachedPokemonStrengths && arraysAreEqual(cachedBoxedPokemonIds, boxedPokemonIds)) {
    logger.log('Using cached Pokémon strengths.')
    return cachedPokemonStrengths
  }

  logger.log('Calculating Pokémon strengths...')
  // Calculate strength for each Pokémon individually
  const pokemonStrengths = await Promise.all(
    boxedPokemon.map(async (pokemon) => {
      const strength = await teamStore.calculateTeamStrength([pokemon])
      return { pokemon, strength }
    })
  )

  // Sort Pokémon by strength in descending order
  const sortedPokemon = pokemonStrengths.sort((a, b) => b.strength - a.strength)

  // Cache the results
  cachedPokemonStrengths = sortedPokemon
  cachedBoxedPokemonIds = boxedPokemonIds

  logger.log(`Cached Pokémon strengths: ${JSON.stringify(sortedPokemon)}`)
  return sortedPokemon
}

/**
 * Utility function to compare two arrays for equality.
 */
const arraysAreEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false
  return arr1.every((value, index) => value === arr2[index])
}
