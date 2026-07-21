import { skillLevelBadgeText } from '@/services/utils/skill-level-utils'
import { describe, expect, it } from 'vitest'

describe('skillLevelBadgeText', () => {
  it('returns the plain level when it matches the base level', () => {
    expect(skillLevelBadgeText(4, 4)).toBe('Lv.4')
  })

  it('marks the level with * when it exceeds the base level', () => {
    expect(skillLevelBadgeText(4, 3)).toBe('Lv.4*')
  })
})
