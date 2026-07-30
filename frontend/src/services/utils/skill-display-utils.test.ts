import { applyAreaBonus, skillLevelBadgeText } from '@/services/utils/skill-display-utils'
import { describe, expect, it } from 'vitest'

describe('skillLevelBadgeText', () => {
  it('returns the plain level when it matches the base level', () => {
    expect(skillLevelBadgeText(4, 4)).toBe('Lv.4')
  })

  it('marks the level with * when it exceeds the base level', () => {
    expect(skillLevelBadgeText(4, 3)).toBe('Lv.4*')
  })
})

describe('applyAreaBonus', () => {
  it('returns the raw value unchanged when area bonus is 0', () => {
    expect(applyAreaBonus(400, 0)).toBe(400)
  })

  it('applies the area bonus percentage and rounds to the nearest whole number', () => {
    expect(applyAreaBonus(400, 20)).toBe(480)
    expect(applyAreaBonus(569, 35)).toBe(768)
  })
})
