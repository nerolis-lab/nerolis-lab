import { hexToRgba, rarityColor, withOpacity } from '@/services/utils/color-utils'
import { subskill } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

describe('hexToRgba', () => {
  it('converts 6-character hex to rgba correctly', () => {
    expect(hexToRgba('#ff5733', 0.5)).toBe('rgba(255, 87, 51, 0.5)')
  })

  it('converts 3-character hex to rgba correctly', () => {
    expect(hexToRgba('#f53', 0.7)).toBe('rgba(255, 85, 51, 0.7)')
  })

  it('handles hex without # correctly', () => {
    expect(hexToRgba('4287f5', 1)).toBe('rgba(66, 135, 245, 1)')
  })

  it('handles opacity of 0 correctly', () => {
    expect(hexToRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('handles full opacity correctly', () => {
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)')
  })
})

describe('rarityColor', () => {
  it('should return white subskill', () => {
    expect(rarityColor(subskill.INVENTORY_S)).toEqual('subskillWhite')
  })
  it('should return silver subskill', () => {
    expect(rarityColor(subskill.INVENTORY_M)).toEqual('subskillSilver')
  })
  it('should return gold subskill', () => {
    expect(rarityColor(subskill.BERRY_FINDING_S)).toEqual('subskillGold')
  })
})

describe('withOpacity', () => {
  it('should handle hex colors by delegating to hexToRgba', () => {
    expect(withOpacity('#ff5733', 0.5)).toBe('rgba(255, 87, 51, 0.5)')
  })

  it('should handle 3-character hex colors', () => {
    expect(withOpacity('#f53', 0.3)).toBe('rgba(255, 85, 51, 0.3)')
  })

  it('should use default opacity of 0.1 for hex colors', () => {
    expect(withOpacity('#ff5733')).toBe('rgba(255, 87, 51, 0.1)')
  })

  it('should handle theme colors with CSS custom properties', () => {
    expect(withOpacity('primary', 0.5)).toBe('rgba(var(--v-theme-primary), 0.5)')
  })

  it('should handle theme colors with default opacity', () => {
    expect(withOpacity('secondary')).toBe('rgba(var(--v-theme-secondary), 0.1)')
  })

  it('should handle theme colors with zero opacity', () => {
    expect(withOpacity('error', 0)).toBe('rgba(var(--v-theme-error), 0)')
  })

  it('should handle theme colors with full opacity', () => {
    expect(withOpacity('success', 1)).toBe('rgba(var(--v-theme-success), 1)')
  })

  it('should handle custom theme color names', () => {
    expect(withOpacity('customColor', 0.25)).toBe('rgba(var(--v-theme-customColor), 0.25)')
  })

  it('should handle empty string as theme color', () => {
    expect(withOpacity('', 0.5)).toBe('rgba(var(--v-theme-), 0.5)')
  })
})
