import { StrengthService } from '@/services/strength/strength-service'
import type { TimeWindowWeek } from '@/types/time/time-window'
import { ChargeStrengthM, DreamShardMagnetS, EnergizingCheerS, MathUtils } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const mockTimeWindow: TimeWindowWeek = 'WEEK'

describe('StrengthService', () => {
  describe('skillValue', () => {
    it('should calculate value for Strength skill type', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skillActivation: ChargeStrengthM.activations.strength,
        amount,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(value).toBe(Math.floor(amount * 7))
    })

    it('should calculate value for Dream Shards skill type', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skillActivation: DreamShardMagnetS.activations.dreamShards,
        amount,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(value).toBe(Math.floor(amount * 7))
    })

    it('should calculate and round 1 decimal value for other skill types', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skillActivation: EnergizingCheerS.activations.energy,
        amount,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(value).toBe(MathUtils.round(amount * 7, 1))
    })
  })

  describe('timeWindowFactor', () => {
    it('should return correct factor for WEEK time window', () => {
      const factor = StrengthService.timeWindowFactor('WEEK')
      expect(factor).toBe(7)
    })

    it('should return correct factor for 24H time window', () => {
      const factor = StrengthService.timeWindowFactor('24H')
      expect(factor).toBe(1)
    })

    it('should return correct factor for 8H time window', () => {
      const factor = StrengthService.timeWindowFactor('8H')
      expect(factor).toBeCloseTo(1 / 3)
    })
  })
})
