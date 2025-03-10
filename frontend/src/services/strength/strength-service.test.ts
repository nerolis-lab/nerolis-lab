import { StrengthService } from '@/services/strength/strength-service'
import type { TimeWindowWeek } from '@/types/time/time-window'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, berry, berryPowerForLevel, mainskill, type BerrySet } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('StrengthService', () => {
  const mockBerrySet: BerrySet[] = [
    { berry: berry.BELUE, amount: 10, level: 5 },
    { berry: berry.SITRUS, amount: 20, level: 3 }
  ]
  const favoredBerries = [berry.BELUE]
  const mockTimeWindow: TimeWindowWeek = 'WEEK'

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('berryStrength', () => {
    it('should calculate strength correctly with favored berry multiplier', () => {
      const strength = StrengthService.berryStrength({
        berries: mockBerrySet,
        favored: favoredBerries,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })

      const berries =
        mockBerrySet[0].amount * 2 * berryPowerForLevel(berry.BELUE, 5) +
        mockBerrySet[1].amount * 1 * berryPowerForLevel(berry.SITRUS, 3)
      const expected = Math.floor(berries * 7)

      expect(strength).toBe(expected)
    })

    it('should calculate strength without favored berry multiplier', () => {
      const strength = StrengthService.berryStrength({
        berries: mockBerrySet,
        favored: [],
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      const berries =
        mockBerrySet[0].amount * 1 * berryPowerForLevel(berry.BELUE, 5) +
        mockBerrySet[1].amount * 1 * berryPowerForLevel(berry.SITRUS, 3)
      const expected = Math.floor(berries * 7)
      expect(strength).toBe(expected)
    })
  })

  describe('skillStrength', () => {
    it('should return correct strength for Strength skill type', () => {
      const skillValueSpy = vi.spyOn(StrengthService, 'skillValue')
      StrengthService.skillStrength({
        skill: mainskill.CHARGE_STRENGTH_M,
        amount: 10,
        berries: mockBerrySet,
        favored: favoredBerries,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })

      expect(skillValueSpy).toHaveBeenCalled()
    })

    it('should return correct strength for Berries skill type', () => {
      const berryStrengthSpy = vi.spyOn(StrengthService, 'berryStrength')

      StrengthService.skillStrength({
        skill: mainskill.BERRY_BURST_DISGUISE,
        amount: 10,
        berries: mockBerrySet,
        favored: favoredBerries,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(berryStrengthSpy).toHaveBeenCalled()
    })
  })

  describe('skillValue', () => {
    it('should calculate value for Strength skill type', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skill: mainskill.CHARGE_STRENGTH_M,
        amount,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(value).toBe(Math.floor(amount * 7))
    })

    it('should calculate value for Dream Shards skill type', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skill: mainskill.DREAM_SHARD_MAGNET_S,
        amount,
        timeWindow: mockTimeWindow,
        areaBonus: 1
      })
      expect(value).toBe(Math.floor(amount * 7))
    })

    it('should calculate and round 1 decimal value for other skill types', () => {
      const amount = 10.7816238
      const value = StrengthService.skillValue({
        skill: mainskill.ENERGIZING_CHEER_S,
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
