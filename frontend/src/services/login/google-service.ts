import { useUserStore } from '@/stores/user-store'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const GOOGLE_REDIRECT_URI = `${window.location.origin}/google`

export function getGoogleAuthCode(currentRoute: RouteLocationNormalizedLoaded) {
  const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const GOOGLE_CALLBACK_URL = GOOGLE_REDIRECT_URI
  const GOOGLE_OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_OAUTH_SCOPES.join(' '),
    state: currentRoute.fullPath
  })

  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?${params.toString()}`
  window.location.href = GOOGLE_OAUTH_CONSENT_SCREEN_URL
}

export async function loginWithGoogle(currentRoute: RouteLocationNormalizedLoaded) {
  const userStore = useUserStore()
  try {
    getGoogleAuthCode(currentRoute)
  } catch {
    logger.error('Google login failed')
    userStore.logout()
  }
}
