import { MathUtils } from 'sleepapi-common'

// Marks the skill level with `*` when it exceeds the base level (e.g. from an expert mode event bonus)
export function skillLevelBadgeText(effectiveSkillLevel: number, baseSkillLevel: number): string {
  return effectiveSkillLevel > baseSkillLevel ? `Lv.${effectiveSkillLevel}*` : `Lv.${effectiveSkillLevel}`
}

// Applies an island area bonus percentage to a raw strength value, rounded to the nearest whole number
export function applyAreaBonus(rawValue: number, areaBonus: number): number {
  return MathUtils.round(rawValue * (1 + areaBonus / 100), 0)
}
