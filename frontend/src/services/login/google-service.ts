import { useUserStore } from '@/stores/user-store'
import { AuthProvider } from 'sleepapi-common'
import type { CallbackTypes } from 'vue3-google-login'

export type CodePopupResponse = CallbackTypes.CodePopupResponse

export async function googleCallback(response: CodePopupResponse) {
  const userStore = useUserStore()
  const authCode = response.code
  if (authCode) {
    try {
      await userStore.login(authCode, AuthProvider.Google)
    } catch {
      logger.error('Google login failed')
      userStore.logout()
    }
  }
}
