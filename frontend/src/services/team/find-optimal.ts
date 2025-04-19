import { StrengthService } from '@/services/strength/strength-service'
import { TeamService } from '@/services/team/team-service'
import { UserService } from '@/services/user/user-service'
import { getIsland } from '@/services/utils/island/island-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { getBerry, type PokemonInstanceExt, type TeamSettings } from 'sleepapi-common'

const MAX_TEAM_MEMBERS = 5
const SPECIAL_POKEMON_DISPLAY_NAMES: string[] = ['Entei', 'Suicune', 'Raikou', 'Cresselia', 'Darkrai']
const numWalkers = 10
const numTopTeams = 25

// Global list of top teams
const topTeams: { team: PokemonInstanceExt[]; strength: number }[] = []

const areTeamsEqual = (a: PokemonInstanceExt[], b: PokemonInstanceExt[]): boolean =>
  a.length === b.length && a.every((member, i) => member.externalId === b[i].externalId)

const addToTopTeams = (team: PokemonInstanceExt[], strength: number) => {
  if (!topTeams.some((t) => areTeamsEqual(t.team, team))) {
    topTeams.push({ team, strength })
    topTeams.sort((a, b) => b.strength - a.strength)
    if (topTeams.length > numTopTeams) topTeams.pop()
  }
}

// Utilities
const sortTeamByExternalId = (team: PokemonInstanceExt[]): PokemonInstanceExt[] =>
  [...team].sort((a, b) => a.externalId.localeCompare(b.externalId))

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const generateRandomTeam = (boxedPokemon: PokemonInstanceExt[], size = MAX_TEAM_MEMBERS): PokemonInstanceExt[] => {
  const nonSpecial = boxedPokemon.filter((p) => !SPECIAL_POKEMON_DISPLAY_NAMES.includes(p.pokemon.displayName))
  const shuffled = shuffleArray([...nonSpecial])
  return sortTeamByExternalId(shuffled.slice(0, size))
}

const hasTooManySpecialPokemon = (team: PokemonInstanceExt[]): boolean =>
  team.filter((p) => SPECIAL_POKEMON_DISPLAY_NAMES.includes(p.pokemon.displayName)).length > 1

const generateNeighbor = (team: PokemonInstanceExt[], boxedPokemon: PokemonInstanceExt[]): PokemonInstanceExt[] => {
  const idx = Math.floor(Math.random() * team.length)
  const options = boxedPokemon.filter((p) => !team.includes(p))
  if (!options.length) return [...team]
  const replacement = options[Math.floor(Math.random() * options.length)]
  const newTeam = [...team]
  newTeam[idx] = replacement
  if (hasTooManySpecialPokemon(newTeam)) return [...team]
  return sortTeamByExternalId(newTeam)
}

function toPokemonInstanceIdentity(p: PokemonInstanceExt) {
  return {
    externalId: p.externalId,
    pokemon: p.pokemon.name,
    level: p.level,
    ingredients: p.ingredients.map((ing) => ({
      level: ing.level,
      amount: ing.amount,
      name: ing.ingredient.name
    })),
    nature: p.nature.name,
    subskills: p.subskills.map((ss) => {
      const val =
        typeof ss.subskill === 'object' && ss.subskill !== null
          ? ss.subskill.id || ss.subskill.name
          : String(ss.subskill)
      return { ...ss, subskill: val }
    }),
    ribbon: p.ribbon,
    carrySize: p.carrySize,
    skillLevel: p.skillLevel
  }
}

const evaluateTeam = async (team: PokemonInstanceExt[], settings: TeamSettings, iterations = 5110): Promise<number> => {
  const teamStore = useTeamStore()
  const userStore = useUserStore()

  const favoredBerries = teamStore.getCurrentTeam.favoredBerries

  const request = {
    settings,
    members: team.map((p) => ({ ...toPokemonInstanceIdentity(p), nature: p.nature.name })),
    userRecipes: teamStore.getCurrentTeam.recipeType,
    iterations
  }
  const result = await TeamService.calculateTeam(request)
  const recipeType = teamStore.getCurrentTeam.recipeType
  const islandBonus = userStore.islandBonus(getIsland(teamStore.getCurrentTeam.favoredBerries).shortName) || 1

  const cooking = result.cooking?.[recipeType]?.weeklyStrength ?? 0
  const cookingStrength = cooking * islandBonus

  const berryStrength = result.members.reduce(
    (sum, m) =>
      sum +
      StrengthService.berryStrength({
        favoredBerries: favoredBerries,
        berries: m.produceWithoutSkill.berries,
        timeWindow: 'WEEK',
        areaBonus: islandBonus
      }),
    0
  )

  const skillStrength = result.members.reduce((sum, prod) => {
    const member = team.find((p) => p.externalId === prod.externalId)
    return (
      sum +
      (member
        ? StrengthService.skillStrength({
            skill: member.pokemon.skill,
            skillValues: prod.skillValue,
            berries: prod.produceFromSkill.berries,
            favoredBerries: favoredBerries,
            timeWindow: 'WEEK',
            areaBonus: islandBonus
          })
        : 0)
    )
  }, 0)

  const stockpiledStrength = teamStore.getCurrentTeam.stockpiledBerries.reduce(
    (sum, sb) =>
      sum +
      StrengthService.berryStrength({
        favoredBerries: favoredBerries,
        berries: [{ berry: getBerry(sb.name), amount: sb.amount, level: sb.level }],
        timeWindow: '24H',
        areaBonus: islandBonus
      }),
    0
  )
  logger.log(
    `members: ${team.map((p) => p.pokemon.displayName).join(', ')}\n berryStrength: ${Math.floor(berryStrength)}`
  )

  return Math.floor(cookingStrength + berryStrength + skillStrength + stockpiledStrength)
}

export const findOptimalTeam = async (
  updateProgress: (
    scored: number,
    totalToSearch: number,
    totalTeamsSearched: number,
    totalPossibleTeams: number,
    bestTeam: PokemonInstanceExt[],
    bestTeamStrength: number,
    progressString?: string
  ) => void
) => {
  const logger = console
  const teamStore = useTeamStore()
  const userStore = useUserStore()

  try {
    const startTime = new Date()
    logger.log(`Find Optimal Team started at: ${startTime.toISOString()}`)
    const boxedPokemon = await UserService.getUserPokemon()

    // Initialize walkers
    const walkers: PokemonInstanceExt[][] = []
    const walkerStrengths: number[] = []
    for (let i = 0; i < numWalkers; i++) {
      const team = generateRandomTeam(boxedPokemon)
      if (hasTooManySpecialPokemon(team)) {
        i--
        continue
      }
      walkers.push(team)
      const strength = await evaluateTeam(
        team,
        {
          camp: teamStore.getCurrentTeam.camp,
          bedtime: teamStore.getCurrentTeam.bedtime,
          wakeup: teamStore.getCurrentTeam.wakeup,
          stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
        },
        5110
      )
      walkerStrengths.push(strength)
      addToTopTeams(team, strength)
      logger.log(`Walker ${i + 1} init: ${team.map((p) => p.pokemon.displayName).join(', ')}`)
      updateProgress(i + 1, numWalkers, i + 1, 0, team, strength, 'Initializing random teams')
    }

    const settings: TeamSettings = {
      camp: teamStore.getCurrentTeam.camp,
      bedtime: teamStore.getCurrentTeam.bedtime,
      wakeup: teamStore.getCurrentTeam.wakeup,
      stockpiledIngredients: teamStore.getCurrentTeam.stockpiledIngredients
    }

    const initialTemperature = Math.max(...walkerStrengths)
    const totalPossibleTeams =
      boxedPokemon.length >= MAX_TEAM_MEMBERS
        ? factorial(boxedPokemon.length) /
          (factorial(MAX_TEAM_MEMBERS) * factorial(boxedPokemon.length - MAX_TEAM_MEMBERS))
        : 0
    const globalBest = { team: walkers[0], strength: walkerStrengths[0] }
    const counter = { count: 0 }

    // Run SA
    await Promise.all(
      walkers.map((walker, idx) =>
        simulatedAnnealing(
          idx,
          walker,
          boxedPokemon,
          settings,
          updateProgress,
          globalBest,
          totalPossibleTeams,
          counter,
          initialTemperature
        )
      )
    )

    // Recalculate top numTopTeams with full iterations
    const initialTop = [...topTeams]
    topTeams.length = 0
    const recalcTotal = initialTop.length
    for (let i = 0; i < recalcTotal; i++) {
      const team = initialTop[i].team
      const strength = await evaluateTeam(team, settings, 5110)
      addToTopTeams(team, strength)
      if (strength > globalBest.strength) {
        globalBest.team = team
        globalBest.strength = strength
      }
      // report recalculation progress
      updateProgress(
        i + 1,
        numTopTeams,
        i + 1,
        totalPossibleTeams,
        globalBest.team,
        globalBest.strength,
        'Refining top team scores'
      )
    }

    teamStore.updateTeamMembers(globalBest.team)
    const endTime = new Date()
    logger.log(`Find Optimal Team ended at: ${endTime.toISOString()}`)
    logger.log(`Total teams searched: ${counter.count}`)
    logger.log(`Best team strength: ${globalBest.strength}`)
    logger.log(`Top ${numTopTeams} teams:`)
    topTeams.forEach(({ team, strength }, i) =>
      logger.log(`#${i + 1}: ${team.map((p) => p.pokemon.displayName).join(', ')}\tStrength: ${strength}`)
    )
  } catch (err) {
    logger.error('Error in findOptimalTeam:', err)
  }
}

const simulatedAnnealing = async (
  walkerId: number,
  initialTeam: PokemonInstanceExt[],
  boxedPokemon: PokemonInstanceExt[],
  settings: TeamSettings,
  updateProgress: (
    scored: number,
    totalToSearch: number,
    totalTeamsSearched: number,
    totalPossibleTeams: number,
    bestTeam: PokemonInstanceExt[],
    bestTeamStrength: number,
    progressString?: string
  ) => void,
  globalBest: { team: PokemonInstanceExt[]; strength: number },
  totalPossibleTeams: number,
  teamsSearchedCounter: { count: number },
  initialTemperature: number
): Promise<void> => {
  const logger = console
  let currentTeam = initialTeam
  let currentStrength = await evaluateTeam(currentTeam, settings)
  let bestTeam = currentTeam
  let bestStrength = currentStrength
  let temperature = initialTemperature
  const teamsToCheck = 1000
  const coolingRate = (100 / initialTemperature) ** (numWalkers / teamsToCheck)

  logger.log(`Walker ${walkerId} started (temp=${temperature.toFixed(2)}, strength=${currentStrength}`)

  let stagnantSteps = 0
  const MAX_STAGNATION = 100

  while (teamsSearchedCounter.count + numWalkers < teamsToCheck) {
    const neighbor = generateNeighbor(currentTeam, boxedPokemon)
    const neighborStrength = await evaluateTeam(neighbor, settings, 8)
    teamsSearchedCounter.count++
    const delta = neighborStrength - currentStrength
    const accepted = delta > 0 || Math.random() < Math.exp(delta / temperature)
    if (accepted) {
      currentTeam = neighbor
      currentStrength = neighborStrength
      stagnantSteps = 0
    } else {
      stagnantSteps++
    }
    if (currentStrength > bestStrength) {
      bestTeam = currentTeam
      bestStrength = currentStrength
      logger.log(`Walker ${walkerId} local best updated to ${bestStrength}`)
      addToTopTeams(bestTeam, bestStrength)
      if (bestStrength > globalBest.strength) {
        globalBest.team = bestTeam
        globalBest.strength = bestStrength
        logger.log(`Walker ${walkerId} global best updated to ${bestStrength}`)
      }
    }
    if (stagnantSteps >= MAX_STAGNATION) {
      currentTeam = bestTeam
      currentStrength = bestStrength
      stagnantSteps = 0
      logger.log(
        `Walker ${walkerId} reset to local best (strength=${bestStrength}) after ${MAX_STAGNATION} stagnant steps`
      )
    }
    updateProgress(
      teamsSearchedCounter.count + numWalkers,
      teamsToCheck,
      teamsSearchedCounter.count,
      totalPossibleTeams,
      globalBest.team,
      globalBest.strength,
      'Evaulating teams'
    )
    temperature *= coolingRate
  }
}

const factorial = (num: number): number => (num <= 1 ? 1 : num * factorial(num - 1))
