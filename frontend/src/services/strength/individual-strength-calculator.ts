import { UserService } from '@/services/user/user-service'
import { useTeamStore } from '@/stores/team/team-store'
import { type PokemonInstanceExt } from 'sleepapi-common'
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
      // Use TeamService to calculate team strength with a single member
      const calculateTeamRequest = {
        settings: {
          camp: teamStore.getCurrentTeam.camp,
          bedtime: teamStore.getCurrentTeam.bedtime,
          wakeup: teamStore.getCurrentTeam.wakeup,
          stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
        },
        members: [
          {
            externalId: pokemon.externalId,
            pokemon: pokemon.pokemon.name,
            level: pokemon.level,
            ingredients: pokemon.ingredients.map((ingredient) => ({
              level: ingredient.level,
              amount: ingredient.amount,
              name: ingredient.ingredient.name
            })),
            nature: pokemon.nature.name,
            subskills: pokemon.subskills.map((subskill) => {
              let subskillString: string
              if (typeof subskill.subskill === 'object' && subskill.subskill !== null) {
                subskillString = String(subskill.subskill)
              } else {
                subskillString = String(subskill.subskill)
              }

              return {
                ...subskill,
                subskill: subskillString
              }
            }),
            ribbon: pokemon.ribbon,
            carrySize: pokemon.carrySize,
            skillLevel: pokemon.skillLevel
          }
        ],
        userRecipes: teamStore.getCurrentTeam.recipeType
      }

      try {
        const teamStrengthResult = await TeamService.calculateTeam(calculateTeamRequest, 1)

        // Extract strength from the members array
        // logger.log(`teamStrengthResult: ${JSON.stringify(teamStrengthResult)}`)
        const member = teamStrengthResult.members[0]
        const berryStrength = member.produceTotal.berries.reduce(
          (sum, berryProd) => sum + berryProd.berry.value * berryProd.amount,
          0
        )
        const ingredientStrength = member.produceTotal.ingredients.reduce(
          (sum, ingredientProd) => sum + ingredientProd.ingredient.value * ingredientProd.amount,
          0
        )
        const skillStrength = member.skillValue?.strength?.amountToSelf ?? 0

        logger.log(`${berryStrength} \t ${ingredientStrength} \t ${skillStrength}`)

        const strength = berryStrength + ingredientStrength + skillStrength

        return { pokemon, strength }
      } catch (error) {
        logger.error(`Error calculating strength for ${pokemon.pokemon.name}: ` + error)
        return { pokemon, strength: 0 } // Or handle the error as appropriate
      }
    })
  )

  // Sort Pokémon by strength in descending order
  const sortedPokemon = pokemonStrengths.sort((a, b) => b.strength - a.strength)

  logger.log(`Recalculated Pokémon strengths: ${sortedPokemon}`)
  return sortedPokemon
}
