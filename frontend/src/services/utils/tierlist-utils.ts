import { useTheme } from 'vuetify'
import { withOpacity } from './color-utils'

export function getTierColor(tier: string) {
  const theme = useTheme()
  const tierKey = `tier-${tier.toLowerCase()}` as keyof typeof theme.current.value.colors
  const tierColor = theme.current.value.colors[tierKey]

  return withOpacity(tierColor as string, 0.1)
}
