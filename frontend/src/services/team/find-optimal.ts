import { calculateAndCachePokemonStrengths } from '@/services/strength/individual-strength-calculator'
import { UserService } from '@/services/user/user-service'
import { useTeamStore } from '@/stores/team/team-store'
import { type PokemonInstanceExt } from 'sleepapi-common'
const MAX_TEAM_MEMBERS = 5

const SPECIAL_POKEMON_DISPLAY_NAMES: string[] = ['Entei', 'Suicune', 'Raikou', 'Cresselia', 'Darkrai'] //TODO: this list needs to be somewhere else, not just locally in a file. I'm bad at this though and can't figure out where it should go or how to access it. -- sheamusfitz 2025-04-13

/**
 * Sorts a team alphabetically by the Pokémon's `externalId`.
 * @param team - The team to sort.
 * @returns A sorted team.
 */
const sortTeamByExternalId = (team: PokemonInstanceExt[]): PokemonInstanceExt[] => {
  return [...team].sort((a, b) => a.externalId.localeCompare(b.externalId))
}

/**
 * Checks if a team contains duplicate Pokémon.
 * @param team - The team to check.
 * @returns `true` if the team contains duplicates, otherwise `false`.
 */
const hasDuplicatePokemon = (team: PokemonInstanceExt[]): boolean => {
  const seen = new Set<string>()
  for (const member of team) {
    if (seen.has(member.externalId)) {
      return true // Duplicate found
    }
    seen.add(member.externalId)
  }
  return false
}

/**
 * Counts the number of "special" Pokémon in a team.
 * @param team - The team to check.
 * @returns The count of special Pokémon.
 */
const countSpecialPokemon = (team: PokemonInstanceExt[]): number => {
  return team.filter((member) => SPECIAL_POKEMON_DISPLAY_NAMES.includes(member.pokemon.displayName)).length
}

/**
 * Generates all 1st and 2nd nearest neighbor teams by switching one or two Pokémon.
 * Ensures all generated teams are sorted alphabetically by `externalId`, removes duplicates,
 * and excludes teams with more than one "special" Pokémon.
 * @param currentTeam - The current team to generate neighbors for.
 * @param boxedPokemon - The list of all boxed Pokémon.
 * @returns An array of unique neighbor teams.
 */
const generateNeighborTeams = (
  currentTeam: PokemonInstanceExt[],
  boxedPokemon: PokemonInstanceExt[]
): PokemonInstanceExt[][] => {
  const neighbors: Set<string> = new Set()

  // Generate 1st nearest neighbors (switch one Pokémon)
  currentTeam.forEach((member, index) => {
    boxedPokemon.forEach((replacement) => {
      if (!currentTeam.includes(replacement)) {
        const newTeam = [...currentTeam]
        newTeam[index] = replacement
        const sortedTeam = sortTeamByExternalId(newTeam)

        // Exclude teams with more than one "special" Pokémon
        if (!hasDuplicatePokemon(sortedTeam) && countSpecialPokemon(sortedTeam) <= 1) {
          neighbors.add(JSON.stringify(sortedTeam)) // Serialize team to ensure uniqueness
        }
      }
    })
  })

  // Generate 2nd nearest neighbors (switch two Pokémon)
  for (let i = 0; i < currentTeam.length; i++) {
    for (let j = i + 1; j < currentTeam.length; j++) {
      boxedPokemon.forEach((replacement1) => {
        boxedPokemon.forEach((replacement2) => {
          if (
            !currentTeam.includes(replacement1) &&
            !currentTeam.includes(replacement2) &&
            replacement1 !== replacement2
          ) {
            const newTeam = [...currentTeam]
            newTeam[i] = replacement1
            newTeam[j] = replacement2
            const sortedTeam = sortTeamByExternalId(newTeam)

            // Exclude teams with more than one "special" Pokémon
            if (!hasDuplicatePokemon(sortedTeam) && countSpecialPokemon(sortedTeam) <= 1) {
              neighbors.add(JSON.stringify(sortedTeam)) // Serialize team to ensure uniqueness
            }
          }
        })
      })
    }
  }

  // Deserialize teams back into arrays
  return Array.from(neighbors).map((team) => JSON.parse(team))
}

/**
 * Finds the optimal team using a nearest neighbor search algorithm.
 * Ensures all teams are sorted alphabetically by `externalId`.
 */
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
    const boxedPokemon = await UserService.getUserPokemon()
    const filteredPokemon = sortedPokemon.filter(
      (entry) => !SPECIAL_POKEMON_DISPLAY_NAMES.includes(entry.pokemon.pokemon.displayName)
    )
    let currentTeam = sortTeamByExternalId(filteredPokemon.slice(0, MAX_TEAM_MEMBERS).map((entry) => entry.pokemon))
    let highestStrength = await teamStore.calculateTeamStrength(currentTeam)

    let improved = true
    let totalTeamsSearched = 0
    const evaluatedTeams = new Set<string>()

    evaluatedTeams.add(JSON.stringify(currentTeam))

    // Calculate total possible teams (n choose 5)
    const n = boxedPokemon.length
    const totalPossibleTeams = n >= 5 ? factorial(n) / (factorial(5) * factorial(n - 5)) : 0

    while (improved) {
      improved = false
      const neighborTeams = generateNeighborTeams(currentTeam, boxedPokemon)
      const totalNeighborTeams = neighborTeams.length

      for (let i = 0; i < neighborTeams.length; i++) {
        const neighbor = neighborTeams[i]
        const serializedNeighbor = JSON.stringify(neighbor)

        if (evaluatedTeams.has(serializedNeighbor)) continue

        evaluatedTeams.add(serializedNeighbor)
        const strength = await teamStore.calculateTeamStrength(neighbor)
        totalTeamsSearched++

        // Update progress with scored, total, totalTeamsSearched, totalPossibleTeams, bestTeam, and bestTeamStrength
        updateProgress(i + 1, totalNeighborTeams, totalTeamsSearched, totalPossibleTeams, currentTeam, highestStrength)

        if (strength > highestStrength) {
          highestStrength = strength
          currentTeam = neighbor
          improved = true
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

// Helper function to calculate factorial
const factorial = (num: number): number => {
  if (num <= 1) return 1
  return num * factorial(num - 1)
}
