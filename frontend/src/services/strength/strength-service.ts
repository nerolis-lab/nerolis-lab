import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import type { TimeWindowWeek } from '@/types/time/time-window'
import type { Mainskill, MemberProduction, MemberSkillValue, RecipeTypeResult } from 'sleepapi-common'
import { MathUtils, berryPowerForLevel, getBerry, type Berry, type BerrySet } from 'sleepapi-common'

class StrengthServiceImpl {
  /**
   * @returns the combined strength of the berry skill and strength skill values
   */
  public skillStrength(params: {
    skill: Mainskill
    skillValues: MemberSkillValue
    berries: BerrySet[]
    favoredBerries: Berry[]
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { skill, skillValues, timeWindow, areaBonus } = params

    const strengthSkillValue = skillValues['strength'] ?? { amountToSelf: 0, amountToTeam: 0 }

    const berrySkillStrength = this.berryStrength(params)
    const skillStrength = this.skillValue({
      skill,
      amount: strengthSkillValue.amountToSelf + strengthSkillValue.amountToTeam,
      timeWindow,
      areaBonus
    })
    return berrySkillStrength + skillStrength
  }

  public berryStrength(params: {
    berries: BerrySet[]
    favoredBerries: Berry[]
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { berries, favoredBerries, timeWindow, areaBonus } = params

    const timeWindowFactor = this.timeWindowFactor(timeWindow)

    let strength = 0
    for (const producedBerry of berries) {
      const favoredBerryMultiplier = favoredBerries.some((berry) => berry.name === producedBerry.berry.name) ? 2 : 1

      strength +=
        producedBerry.amount *
        timeWindowFactor *
        berryPowerForLevel(producedBerry.berry, producedBerry.level) *
        areaBonus *
        favoredBerryMultiplier
    }
    return Math.floor(strength)
  }

  public skillValue(params: { skill: Mainskill; amount: number; timeWindow: TimeWindowWeek; areaBonus: number }) {
    const { skill, amount, timeWindow, areaBonus } = params

    const isStrengthUnit = skill.isUnit('strength')
    const isShardsUnit = skill.isUnit('dream shards')

    const rounding = isStrengthUnit || isShardsUnit ? 0 : 1

    return MathUtils.round(
      isStrengthUnit
        ? amount * areaBonus * this.timeWindowFactor(timeWindow)
        : amount * this.timeWindowFactor(timeWindow),
      rounding
    )
  }

  public timeWindowFactor(timeWindow: TimeWindowWeek) {
    switch (timeWindow) {
      case 'WEEK':
        return 7
      case '24H':
        return 1
      case '8H':
        return 1 / 3
      default:
        return 1
    }
  }

  public calculateTotalStrength(params: { team: TeamInstance; areaBonus: number; favoredBerries: Berry[] }): number {
    const teamStore = useTeamStore()
    const { team, areaBonus, favoredBerries } = params
    // logger.log(`team: ${JSON.stringify(team)}`)

    const favoredBerrySet = new Set(favoredBerries.map((berry) => berry.name))

    // Ensure recipeType is valid
    const recipeType = team.recipeType // Default to 'curry' if undefined
    const recipeTypeResult: RecipeTypeResult = team.production?.team.cooking?.[recipeType] ?? ({} as RecipeTypeResult)
    const cookingStrength = (recipeTypeResult?.weeklyStrength ?? 0) * areaBonus

    const berryStrength = (team.production?.members ?? []).reduce(
      (sum: number, member: { produceWithoutSkill: { berries: BerrySet[] } }) => {
        const berries: BerrySet[] = member.produceWithoutSkill.berries

        return (
          sum +
          this.berryStrength({
            favoredBerries: Array.from(favoredBerrySet).map((berryName) => getBerry(berryName)),
            berries,
            timeWindow: 'WEEK',
            areaBonus: areaBonus
          })
        )
      },
      0
    )

    const skillStrength = (team.production?.members ?? []).reduce((sum: number, memberProduction: MemberProduction) => {
      // Find the corresponding Pokémon in team.members using externalId
      const member = team.members.find((m) => m.externalId === memberProduction.externalId)
      // logger.log(`member: ${JSON.stringify(memberProduction.externalId)}`)

      // logger.log(`Team Members: ${JSON.stringify(team.members, null, 2)}`)
      // logger.log(`Production Members: ${JSON.stringify(team.production.members, null, 2)}`)

      if (!member) {
        logger.warn(`No Pokémon data found for externalId: ${memberProduction.externalId}`)
        return sum // Skip this member if no data is found
      }

      const memberSkillStrength = StrengthService.skillStrength({
        skill: member.pokemon.skill, // Use the skill from the Pokémon data
        skillValues: memberProduction.skillValue, // Use the skill values from production
        berries: memberProduction.produceFromSkill.berries, // Use the berries from production
        favoredBerries: Array.from(favoredBerrySet).map((berryName) => getBerry(berryName)),
        timeWindow: 'WEEK',
        areaBonus: areaBonus
      })

      logger.log(`Skill strength for Pokémon with externalId: ${member.externalId}: ${memberSkillStrength}`)

      return sum + memberSkillStrength
    }, 0)

    const stockpiledBerryStrength = (team.stockpiledBerries ?? []).reduce(
      (sum: number, berry: { name: string; amount: number; level: number }) => {
        return (
          sum +
          this.berryStrength({
            favoredBerries: Array.from(favoredBerrySet).map((berryName) => getBerry(berryName)),
            berries: [{ berry: getBerry(berry.name), amount: berry.amount, level: berry.level }],
            timeWindow: '24H',
            areaBonus: areaBonus
          })
        )
      },
      0
    )

    // Log all components of strength
    logger.log(`Recipe Type: ${recipeType}`)
    logger.log(`Cooking Strength: ${cookingStrength}`)
    logger.log(`Berry Strength: ${berryStrength}`)
    logger.log(`Skill Strength: ${skillStrength}`)
    logger.log(`Stockpiled Berry Strength: ${stockpiledBerryStrength}`)

    return Math.floor(cookingStrength + berryStrength + skillStrength + stockpiledBerryStrength)
  }
}
export const StrengthService = new StrengthServiceImpl()
