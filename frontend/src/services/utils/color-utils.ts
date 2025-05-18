import { capitalize, type Subskill } from 'sleepapi-common'

export function hexToRgba(hex: string, opacity: number) {
  hex = hex.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function withOpacity(color: string, opacity: number = 0.1) {
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity)
  }

  return `rgba(var(--v-theme-${color}), ${opacity})`
}

export function rarityColor(subskill: Subskill) {
  return `subskill${capitalize(subskill.rarity)}`
}
