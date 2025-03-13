import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { UserService } from '@/services/user/user-service'
import { clearCacheAndLogout } from '@/stores/store-service'
import { defineStore } from 'pinia'
import { ISLANDS, Roles, type IslandShortName, type LoginResponse, type UserSettingsResponse } from 'sleepapi-common'
import { googleLogout } from 'vue3-google-login'

export interface UserState {
  name: string
  avatar: string | null
  email: string | null
  tokens: TokenInfo | null
  externalId: string | null
  friendCode?: string
  role: Roles
  areaBonus: Record<IslandShortName, number>
  potSize: number
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
      role: Roles.Default,
      areaBonus: Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<IslandShortName, number>,
      potSize: 15
    }
  },
  getters: {
    loggedIn: (state) => state.tokens !== null,
    islandBonus: (state) => (shortName: IslandShortName) => 1 + state.areaBonus[shortName] / 100
  },
  actions: {
    migrate() {
      if (!this.role) {
        this.role = Roles.Default
      }

      if (!this.areaBonus) {
        this.areaBonus = Object.fromEntries(ISLANDS.map((island) => [island.shortName, 0])) as Record<
          IslandShortName,
          number
        >
      }

      if (!this.potSize) {
        this.potSize = 15
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
    setUserSettings(userSettings: UserSettingsResponse) {
      this.name = userSettings.name
      this.avatar = userSettings.avatar
      this.role = userSettings.role
      this.potSize = userSettings.potSize

      for (const [area, bonus] of Object.entries(userSettings.areaBonuses)) {
        this.areaBonus[area as IslandShortName] = bonus
      }
    },
    async syncUserSettings() {
      const userSettings = await UserService.getUserSettings()
      this.setUserSettings(userSettings)
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
