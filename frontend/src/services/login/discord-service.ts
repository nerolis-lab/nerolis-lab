import { useUserStore } from '@/stores/user-store'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const DISCORD_REDIRECT_URI = `${window.location.origin}/discord`

export function getDiscordAuthCode(
  currentRoute: RouteLocationNormalizedLoaded,
  scope = 'identify guilds.members.read'
) {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope,
    state: currentRoute.fullPath
  })
  const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  window.location.href = url // navigate to the discord login page
}

export async function loginWithDiscord(currentRoute: RouteLocationNormalizedLoaded) {
  const userStore = useUserStore()
  try {
    getDiscordAuthCode(currentRoute)
  } catch {
    logger.error('Discord login failed')
    userStore.logout()
  }
}
