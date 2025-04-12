import type { TimeWindowWeek } from '@/types/time/time-window'
import type { Mainskill, MemberSkillValue } from 'sleepapi-common'
import { MathUtils, berryPowerForLevel, type Berry, type BerrySet } from 'sleepapi-common'

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

    // Cache the time window factor
    const timeWindowFactor = this.timeWindowFactor(timeWindow)

    const berrySkillStrength = this.berryStrength(params)
    const skillStrength = this.skillValue({
      skill,
      amount: strengthSkillValue.amountToSelf + strengthSkillValue.amountToTeam,
      timeWindowFactor, // Pass the cached factor
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

    // Convert favoredBerries to a Set for faster lookups
    const favoredBerrySet = new Set(favoredBerries.map((berry) => berry.name))

    // Cache berry power calculations
    const berryPowerCache = new Map<string, number>()

    let strength = 0
    for (const producedBerry of berries) {
      const berryKey = `${producedBerry.berry.name}-${producedBerry.level}`
      if (!berryPowerCache.has(berryKey)) {
        berryPowerCache.set(berryKey, berryPowerForLevel(producedBerry.berry, producedBerry.level))
      }

      const favoredBerryMultiplier = favoredBerrySet.has(producedBerry.berry.name) ? 2 : 1

      strength +=
        producedBerry.amount * timeWindowFactor * berryPowerCache.get(berryKey)! * areaBonus * favoredBerryMultiplier
    }
    return Math.floor(strength)
  }

  public skillValue(params: { skill: Mainskill; amount: number; timeWindowFactor: number; areaBonus: number }) {
    const { skill, amount, timeWindowFactor, areaBonus } = params

    const isStrengthUnit = skill.isUnit('strength')
    const isShardsUnit = skill.isUnit('dream shards')

    const rounding = isStrengthUnit || isShardsUnit ? 0 : 1

    return MathUtils.round(isStrengthUnit ? amount * areaBonus * timeWindowFactor : amount * timeWindowFactor, rounding)
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
}

export const StrengthService = new StrengthServiceImpl()
