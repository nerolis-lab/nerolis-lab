import type { TimeWindowWeek } from '@/types/time/time-window'
import type { MainskillActivation, MemberSkillValue } from 'sleepapi-common'
import { MathUtils, berryPowerForLevel, type Berry, type BerrySet } from 'sleepapi-common'

class StrengthServiceImpl {
  /**
   * @returns the combined strength of the berry skill and strength skill values
   */
  public skillStrength(params: {
    skillActivation: MainskillActivation
    skillValues: MemberSkillValue
    berries: BerrySet[]
    favoredBerries: Berry[]
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { skillActivation, skillValues, timeWindow, areaBonus } = params

    const strengthSkillValue = skillValues['strength'] ?? { amountToSelf: 0, amountToTeam: 0 }

    const berrySkillStrength = this.berryStrength(params)
    const skillStrength = this.skillValue({
      skillActivation,
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

  public skillValue(params: {
    skillActivation: MainskillActivation
    amount: number
    timeWindow: TimeWindowWeek
    areaBonus: number
  }) {
    const { skillActivation, amount, timeWindow, areaBonus } = params

    const isStrengthUnit = skillActivation.unit === 'strength'
    const isShardsUnit = skillActivation.unit === 'dream shards'

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
}

export const StrengthService = new StrengthServiceImpl()
