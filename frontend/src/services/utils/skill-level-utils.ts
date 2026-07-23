// Marks the skill level with `*` when it exceeds the base level (e.g. from an expert mode event bonus)
export function skillLevelBadgeText(effectiveSkillLevel: number, baseSkillLevel: number): string {
  return effectiveSkillLevel > baseSkillLevel ? `Lv.${effectiveSkillLevel}*` : `Lv.${effectiveSkillLevel}`
}
