import { useTeamStore } from '@/stores/team/team-store'
import { UserService } from '@/services/user/user-service'
import { type PokemonInstanceExt } from 'sleepapi-common'
import { StrengthService } from './strength-service'
import { TeamService } from '../team/team-service'

interface ScoredPokemon {
  pokemon: PokemonInstanceExt
  strength: number
}

/**
 * Calculates and caches the strength of all boxed Pokémon.
 */
export const calculateAndCachePokemonStrengths = async (): Promise<ScoredPokemon[]> => {
  const teamStore = useTeamStore()

  // Fetch all boxed Pokémon
  const boxedPokemon = await UserService.getUserPokemon()

  // Calculate strength for each Pokémon individually
  const pokemonStrengths = await Promise.all(
    boxedPokemon.map(async (pokemon) => {
      const production = await TeamService.calculateProduction({
        members: [pokemon],
        settings: {
          camp: teamStore.getCurrentTeam.camp,
          bedtime: teamStore.getCurrentTeam.bedtime,
          wakeup: teamStore.getCurrentTeam.wakeup,
          stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
        }
      })

      const strength = StrengthService.calculateTotalStrength({
        team: { members: [pokemon], production },
        areaBonus: 1, // Replace with actual area bonus logic if needed
        favoredBerries: teamStore.getCurrentTeam.favoredBerries.map((berry) => berry.name)
      })

      return { pokemon, strength }
    })
  )

  // Sort Pokémon by strength in descending order
  const sortedPokemon = pokemonStrengths.sort((a, b) => b.strength - a.strength)

  logger.log('Recalculated Pokémon strengths:', sortedPokemon)
  return sortedPokemon
}
