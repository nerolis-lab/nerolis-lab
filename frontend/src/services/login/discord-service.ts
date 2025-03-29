import { useUserStore } from '@/stores/user-store'

export const DISCORD_REDIRECT_URI = `${window.location.origin}/discord`

export function getDiscordAuthCode(scope = 'identify guilds.members.read') {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope
  })
  const url = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  window.location.href = url
}

export async function loginWithDiscord() {
  const userStore = useUserStore()
  try {
    getDiscordAuthCode()
  } catch {
    logger.error('Discord login failed')
    userStore.logout()
  }
}
