import type { TimeWindowWeek } from '@/types/time/time-window'
import { MathUtils, type MainskillActivation } from 'sleepapi-common'

class StrengthServiceImpl {
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

    const adjustedAmount = isStrengthUnit ? amount * areaBonus : amount

    return MathUtils.round(adjustedAmount * this.timeWindowFactor(timeWindow), rounding)
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
