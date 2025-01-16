import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { clearCacheAndLogout } from '@/stores/store-service'
import { defineStore } from 'pinia'
import { MAX_ISLAND_BONUS, Roles, type LoginResponse } from 'sleepapi-common'
import { googleLogout } from 'vue3-google-login'

export interface UserState {
  name: string
  avatar: string | null
  email: string | null
  tokens: TokenInfo | null
  externalId: string | null
  role: Roles
}

export interface TokenInfo {
  expiryDate: number
  accessToken: string
  refreshToken: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      name: 'Guest',
      avatar: null,
      email: null,
      tokens: null,
      externalId: null,
      role: Roles.Default
    }
  },
  getters: {
    loggedIn: (state) => state.tokens !== null,
    islandBonus: () => 1 + MAX_ISLAND_BONUS / 100
  },
  actions: {
    migrate() {
      if (!this.role) {
        this.role = Roles.Default
      }
    },
    setUserData(userData: { name: string; avatar?: string; email: string; externalId: string; role: Roles }) {
      this.name = userData.name
      this.avatar = userData.avatar ?? 'default'
      this.email = userData.email
      this.externalId = userData.externalId
      this.role = userData.role
    },
    setTokens(tokens: TokenInfo) {
      this.tokens = tokens
    },
    async login(authCode: string) {
      const loginResponse: LoginResponse = await GoogleService.login(authCode)
      this.setTokens({
        accessToken: loginResponse.access_token,
        refreshToken: loginResponse.refresh_token,
        expiryDate: loginResponse.expiry_date
      })
      this.setUserData({
        name: loginResponse.name,
        avatar: loginResponse.avatar,
        email: loginResponse.email,
        externalId: loginResponse.externalId,
        role: loginResponse.role
      })

      // Refresh the current page
      router.go(0)
    },
    async refresh() {
      try {
        const tokens = this.tokens
        if (tokens?.expiryDate) {
          if (Date.now() > tokens.expiryDate) {
            const { refreshToken } = tokens
            const { access_token, expiry_date } = await GoogleService.refresh(refreshToken)
            this.setTokens({
              accessToken: access_token,
              refreshToken,
              expiryDate: expiry_date
            })
          }
        } else {
          this.logout()
        }
      } catch {
        this.logout()
      }
    },
    logout() {
      clearCacheAndLogout()
      googleLogout()
      router.push('/')
    }
  },
  persist: true
})
