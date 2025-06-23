import { useTheme } from 'vuetify'

export interface DiffDisplayInfo {
  text: string
  color: string
}

/**
 * Provides icon, icon color, and optional text color based on a diff value.
 * @param diff The numerical difference. Can be positive, negative, zero, or undefined (for new items).
 * @returns DiffDisplayInfo object with icon and color properties.
 */
export function getDiffDisplayInfo(diff?: number): DiffDisplayInfo {
  const theme = useTheme()

  if (diff === undefined) {
    return {
      text: '',
      color: theme.current.value.colors.transparent
    }
  }
  if (diff > 0) {
    return {
      color: theme.current.value.colors.success,
      text: '+' + diff
    }
  }
  if (diff < 0) {
    return {
      color: theme.current.value.colors['error-3'],
      text: `${diff}`
    }
  }
  return {
    color: theme.current.value.colors.secondary,
    text: 'New'
  }
}
