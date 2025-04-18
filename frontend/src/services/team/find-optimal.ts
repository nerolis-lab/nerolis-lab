import { StrengthService } from '@/services/strength/strength-service'
import { TeamService } from '@/services/team/team-service'
import { UserService } from '@/services/user/user-service'
import { getIsland } from '@/services/utils/island/island-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { getBerry, type PokemonInstanceExt, type TeamSettings } from 'sleepapi-common'

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

  // Shuffle the list of neighbors before returning
  return shuffleArray(Array.from(neighbors).map((team) => JSON.parse(team)))
}

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
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
  const userStore = useUserStore()

  try {
    const startTime = new Date()
    logger.log(`Find Optimal Team started at: ${startTime.toISOString()}`)

    const boxedPokemon = await UserService.getUserPokemon()
    // const sortedPokemon = await calculateAndCachePokemonStrengths()
    // logger.log(
    //   'Pokémon strengths: ' +
    //     JSON.stringify(
    //       sortedPokemon.map((entry) => ({
    //         name: entry.pokemon.pokemon.displayName,
    //         strength: entry.strength
    //       }))
    //     )
    // )

    const filteredPokemon = boxedPokemon.filter(
      (entry) => !SPECIAL_POKEMON_DISPLAY_NAMES.includes(entry.pokemon.displayName)
    )
    const currentTeam = sortTeamByExternalId(filteredPokemon.slice(0, MAX_TEAM_MEMBERS))

    const settings: TeamSettings = {
      camp: teamStore.getCurrentTeam.camp,
      bedtime: teamStore.getCurrentTeam.bedtime,
      wakeup: teamStore.getCurrentTeam.wakeup,
      stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
    }

    logger.log(`Current team: ${currentTeam.map((p) => p.pokemon.displayName).join(', ')}`)
    const calculateTeamRequest = {
      settings,
      members: currentTeam.map((pokemon) => ({
        ...toPokemonInstanceIdentity(pokemon),
        nature: pokemon.nature.name
      })),
      userRecipes: teamStore.getCurrentTeam.recipeType,
      iterations: 1
    }
    // logger.log('calculateTeamRequest: ' + JSON.stringify(calculateTeamRequest))

    // Call the backend to calculate team strength
    const teamStrengthResult = await TeamService.calculateTeam(calculateTeamRequest, 1)
    // logger.log(`Team strength result: ${JSON.stringify(teamStrengthResult)}`)

    // Calculate the total team strength using the same approach as team-results.vue

    // 1. Cooking Strength
    const recipeType = teamStore.getCurrentTeam.recipeType
    const cookingStrength =
      teamStrengthResult.cooking && teamStrengthResult.cooking[recipeType]
        ? teamStrengthResult.cooking[recipeType].weeklyStrength *
          (userStore.islandBonus(getIsland(teamStore.getCurrentTeam.favoredBerries).shortName) || 1)
        : 0

    // 2. Berry Strength
    const berryStrength = teamStrengthResult.members.reduce((sum, member) => {
      const berries = member.produceWithoutSkill.berries
      const favoredBerries = teamStore.getCurrentTeam.favoredBerries

      // Use StrengthService.berryStrength method
      const memberBerryStrength = StrengthService.berryStrength({
        favoredBerries: favoredBerries,
        berries,
        timeWindow: 'WEEK',
        areaBonus: userStore.islandBonus(getIsland(favoredBerries).shortName) || 1
      })

      return sum + memberBerryStrength
    }, 0)

    // 3. Skill Strength
    const skillStrength = teamStrengthResult.members.reduce((sum, memberProduction) => {
      const member = currentTeam.find((p) => p.externalId === memberProduction.externalId)

      // Use StrengthService.skillStrength method
      const memberSkillStrength = member
        ? StrengthService.skillStrength({
            skill: member.pokemon.skill,
            skillValues: memberProduction.skillValue,
            berries: memberProduction.produceFromSkill.berries,
            favoredBerries: teamStore.getCurrentTeam.favoredBerries,
            timeWindow: 'WEEK',
            areaBonus: userStore.islandBonus(getIsland(teamStore.getCurrentTeam.favoredBerries).shortName) || 1
          })
        : 0

      return sum + memberSkillStrength
    }, 0)

    // 4. Stockpiled Berry Strength
    const stockpiledBerryStrength = teamStore.getCurrentTeam.stockpiledBerries.reduce((sum, stockpiledBerry) => {
      const { amount, level, name } = stockpiledBerry
      const berry = getBerry(name)

      // Use StrengthService.berryStrength method
      const berryStrength = StrengthService.berryStrength({
        favoredBerries: teamStore.getCurrentTeam.favoredBerries,
        berries: [{ berry, amount, level }],
        timeWindow: '24H', // week multiplies it by 7, but this is already for a week
        areaBonus: userStore.islandBonus(getIsland(teamStore.getCurrentTeam.favoredBerries).shortName) || 1
      })

      return sum + berryStrength
    }, 0)

    // Calculate total strength
    const totalTeamStrength = Math.floor(cookingStrength + berryStrength + skillStrength + stockpiledBerryStrength)

    logger.log(`Cooking strength: ${cookingStrength}`)
    logger.log(`Berry strength: ${berryStrength}`)
    logger.log(`Skill strength: ${skillStrength}`)
    logger.log(`Stockpiled berry strength: ${stockpiledBerryStrength}`)
    logger.log(`Total team strength: ${totalTeamStrength}`)

    // Update the progress with the calculated team strength
    updateProgress(1, 1, 1, 1, currentTeam, totalTeamStrength)

    const improved = true
    const totalTeamsSearched = 0
    const evaluatedTeams = new Set<string>()

    evaluatedTeams.add(JSON.stringify(currentTeam))

    const n = boxedPokemon.length
    const totalPossibleTeams = n >= 5 ? factorial(n) / (factorial(5) * factorial(n - 5)) : 0

    teamStore.updateTeamMembers(currentTeam)

    const endTime = new Date()
    logger.log(`Find Optimal Team ended at: ${endTime.toISOString()}`)
    logger.log(`Total execution time: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`)
  } catch (error) {
    logger.error('Error in findOptimalTeam: ' + error)
  }
}
const factorial = (num: number): number => {
  if (num <= 1) return 1
  return num * factorial(num - 1)
}

function toPokemonInstanceIdentity(pokemon: PokemonInstanceExt) {
  return {
    externalId: pokemon.externalId,
    pokemon: pokemon.pokemon.name,
    level: pokemon.level,
    ingredients: pokemon.ingredients.map((ingredient) => ({
      level: ingredient.level,
      amount: ingredient.amount,
      name: ingredient.ingredient.name // Access name from ingredient.ingredient
    })),
    nature: pokemon.nature.name,
    // Convert SubskillInstanceExt[] to SubskillInstance[]
    subskills: pokemon.subskills.map((subskill) => {
      let subskillString: string
      if (typeof subskill.subskill === 'object' && subskill.subskill !== null) {
        // Ensure subskill.subskill has a toString method or relevant property
        subskillString = subskill.subskill.id || subskill.subskill.name || String(subskill.subskill)
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
}
