import { useUserStore } from '@/stores/user-store'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const PATREON_REDIRECT_URI = `${window.location.origin}/patreon`

export function getPatreonAuthCode(currentRoute: RouteLocationNormalizedLoaded, scope = 'identity[email]') {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_PATREON_CLIENT_ID,
    redirect_uri: PATREON_REDIRECT_URI,
    response_type: 'code',
    scope,
    state: currentRoute.fullPath
  })

  const url = `https://www.patreon.com/oauth2/authorize?${params.toString()}`

  window.location.href = url // navigate to the patreon authorization page
}

export async function loginWithPatreon(currentRoute: RouteLocationNormalizedLoaded) {
  const userStore = useUserStore()
  try {
    getPatreonAuthCode(currentRoute)
  } catch {
    logger.error('Patreon login failed')
    userStore.logout()
  }
}
