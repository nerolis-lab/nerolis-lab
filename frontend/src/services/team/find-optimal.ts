import { calculateAndCachePokemonStrengths } from '@/services/strength/individual-strength-calculator'
import { StrengthService } from '@/services/strength/strength-service' // Import StrengthService
import { TeamService } from '@/services/team/team-service' // Import TeamService
import { UserService } from '@/services/user/user-service'
import { useTeamStore } from '@/stores/team/team-store'
import { type PokemonInstanceExt, Mainskill } from 'sleepapi-common'

const MAX_TEAM_MEMBERS = 5

const SPECIAL_POKEMON_DISPLAY_NAMES: string[] = ['Entei', 'Suicune', 'Raikou', 'Cresselia', 'Darkrai']

const sortTeamByExternalId = (team: PokemonInstanceExt[]): PokemonInstanceExt[] => {
  return [...team].sort((a, b) => a.externalId.localeCompare(b.externalId))
}

const hasDuplicatePokemon = (team: PokemonInstanceExt[]): boolean => {
  const seen = new Set<string>()
  for (const member of team) {
    if (seen.has(member.externalId)) {
      return true
    }
    seen.add(member.externalId)
  }
  return false
}

const countSpecialPokemon = (team: PokemonInstanceExt[]): number => {
  return team.filter((member) => SPECIAL_POKEMON_DISPLAY_NAMES.includes(member.pokemon.displayName)).length
}

const generateNeighborTeams = (
  currentTeam: PokemonInstanceExt[],
  boxedPokemon: PokemonInstanceExt[]
): PokemonInstanceExt[][] => {
  const neighbors: Set<string> = new Set()

  currentTeam.forEach((member, index) => {
    boxedPokemon.forEach((replacement) => {
      if (!currentTeam.includes(replacement)) {
        const newTeam = [...currentTeam]
        newTeam[index] = replacement
        const sortedTeam = sortTeamByExternalId(newTeam)

        // Only add unique teams
        if (!hasDuplicatePokemon(sortedTeam) && countSpecialPokemon(sortedTeam) <= 1) {
          neighbors.add(JSON.stringify(sortedTeam))
        }
      }
    })
  })

  return Array.from(neighbors).map((team) => JSON.parse(team))
}

export const findOptimalTeam = async (
  updateProgress: (
    scored: number,
    total: number,
    totalTeamsSearched: number,
    totalPossibleTeams: number,
    bestTeam: PokemonInstanceExt[],
    bestTeamStrength: number
  ) => void
) => {
  const logger = console
  const teamStore = useTeamStore()

  try {
    const startTime = new Date()
    logger.log(`Find Optimal Team started at: ${startTime.toISOString()}`)

    const sortedPokemon = await calculateAndCachePokemonStrengths()
    logger.log(
      'Cached Pokémon strengths:',
      sortedPokemon.map((entry) => ({
        name: entry.pokemon.pokemon.displayName,
        strength: entry.strength
      }))
    )

    const boxedPokemon = await UserService.getUserPokemon()
    const filteredPokemon = sortedPokemon.filter(
      (entry) => !SPECIAL_POKEMON_DISPLAY_NAMES.includes(entry.pokemon.pokemon.displayName)
    )
    let currentTeam = sortTeamByExternalId(filteredPokemon.slice(0, MAX_TEAM_MEMBERS).map((entry) => entry.pokemon))

    const areaBonus = 1 // Replace with actual area bonus logic if needed
    const favoredBerries = teamStore.getCurrentTeam.favoredBerries.map((berry) => berry.name) // Keep as an array

    let highestStrength = StrengthService.calculateTotalStrength({
      team: { members: currentTeam, production: teamStore.getCurrentTeam.production },
      areaBonus,
      favoredBerries
    })

    let improved = true
    let totalTeamsSearched = 0
    const evaluatedTeams = new Set<string>()

    evaluatedTeams.add(JSON.stringify(currentTeam))

    const n = boxedPokemon.length
    const totalPossibleTeams = n >= 5 ? factorial(n) / (factorial(5) * factorial(n - 5)) : 0

    while (improved) {
      improved = false
      const neighborTeams = generateNeighborTeams(currentTeam, boxedPokemon)
      logger.log(`Generated ${neighborTeams.length} neighbor teams.`)
      const totalNeighborTeams = neighborTeams.length

      for (let i = 0; i < neighborTeams.length; i++) {
        const neighbor = neighborTeams[i]
        const serializedNeighbor = JSON.stringify(neighbor)

        if (evaluatedTeams.has(serializedNeighbor)) continue

        evaluatedTeams.add(serializedNeighbor)

        // Recalculate production for the neighbor team
        const production = await TeamService.calculateProduction({
          members: neighbor,
          settings: {
            camp: teamStore.getCurrentTeam.camp,
            bedtime: teamStore.getCurrentTeam.bedtime,
            wakeup: teamStore.getCurrentTeam.wakeup,
            stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
          }
        })

        // Synchronize team.members with production.members
        const updatedMembers = production.members.map((memberProduction) => {
          const pokemon = neighbor.find((pokemon) => pokemon.externalId === memberProduction.externalId)
          if (pokemon) {
            pokemon.pokemon.skill = new Mainskill(pokemon.pokemon.skill) // Transform skill into Mainskill
          }
          return pokemon
        })

        const strength = StrengthService.calculateTotalStrength({
          team: { members: updatedMembers, production, recipeType: teamStore.getCurrentTeam.recipeType },
          areaBonus,
          favoredBerries
        })

        logger.log(`Evaluated team ${i + 1} of ${totalNeighborTeams}`)
        logger.log(`Team: ${neighbor.map((member) => member.pokemon.displayName).join(', ')}`)
        logger.log(`Strength: ${strength}, Highest Strength: ${highestStrength}`)

        totalTeamsSearched++

        updateProgress(i + 1, totalNeighborTeams, totalTeamsSearched, totalPossibleTeams, currentTeam, highestStrength)

        if (strength > highestStrength) {
          highestStrength = strength
          currentTeam = neighbor
          improved = true

          const pokemonNames = currentTeam.map((member) => member.pokemon.displayName).join(', ')
          logger.log(`New best team found with strength ${highestStrength}: ${pokemonNames}`)

          // Update teamStore with the new best team
          const production = await TeamService.calculateProduction({
            members: currentTeam,
            settings: {
              camp: teamStore.getCurrentTeam.camp,
              bedtime: teamStore.getCurrentTeam.bedtime,
              wakeup: teamStore.getCurrentTeam.wakeup,
              stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
            }
          })
          teamStore.updateTeamMembers(currentTeam, production)

          break
        }
      }
    }

    teamStore.updateTeamMembers(currentTeam)

    const endTime = new Date()
    logger.log(`Find Optimal Team ended at: ${endTime.toISOString()}`)
    logger.log(`Total execution time: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`)
  } catch (error) {
    logger.error('Error in findOptimalTeam:', error)
  }
}

const factorial = (num: number): number => {
  if (num <= 1) return 1
  return num * factorial(num - 1)
}
