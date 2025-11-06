import router from '@/router/router'
import { AuthService } from '@/services/login/auth-service'
import { UserService } from '@/services/user/user-service'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { AuthProvider, commonMocks, Roles } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

describe('User Store', () => {
  it('should have expected default state', () => {
    const userStore = useUserStore()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "auth": null,
        "avatar": null,
        "externalId": null,
        "friendCode": null,
        "islands": {
          "GGEX": {
            "areaBonus": 0,
            "berries": [],
            "expert": true,
            "name": "Greengrass Isle (Expert Mode)",
            "shortName": "GGEX",
          },
          "cyan": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "ORAN",
                "type": "water",
                "value": 31,
              },
              {
                "name": "PAMTRE",
                "type": "flying",
                "value": 24,
              },
              {
                "name": "PECHA",
                "type": "fairy",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Cyan Beach",
            "shortName": "cyan",
          },
          "greengrass": {
            "areaBonus": 0,
            "berries": [],
            "expert": false,
            "name": "Greengrass Isle",
            "shortName": "greengrass",
          },
          "lapis": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "CHERI",
                "type": "fighting",
                "value": 27,
              },
              {
                "name": "DURIN",
                "type": "grass",
                "value": 30,
              },
              {
                "name": "MAGO",
                "type": "psychic",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Lapis Lakeside",
            "shortName": "lapis",
          },
          "powerplant": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              {
                "name": "BLUK",
                "type": "ghost",
                "value": 26,
              },
              {
                "name": "GREPA",
                "type": "electric",
                "value": 25,
              },
            ],
            "expert": false,
            "name": "Old Gold Power Plant",
            "shortName": "powerplant",
          },
          "snowdrop": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "PERSIM",
                "type": "normal",
                "value": 28,
              },
              {
                "name": "RAWST",
                "type": "ice",
                "value": 32,
              },
              {
                "name": "WIKI",
                "type": "dark",
                "value": 31,
              },
            ],
            "expert": false,
            "name": "Snowdrop Tundra",
            "shortName": "snowdrop",
          },
          "taupe": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "FIGY",
                "type": "ground",
                "value": 29,
              },
              {
                "name": "LEPPA",
                "type": "fire",
                "value": 27,
              },
              {
                "name": "SITRUS",
                "type": "rock",
                "value": 30,
              },
            ],
            "expert": false,
            "name": "Taupe Hollow",
            "shortName": "taupe",
          },
        },
        "name": "Guest",
        "potSize": 81,
        "randomizeNicknames": true,
        "role": "default",
        "supporterSince": null,
      }
    `)

    expect(userStore.loggedIn).toBeFalsy()
  })

  describe('Getters', () => {
    it('should correctly identify admin status', () => {
      const userStore = useUserStore()
      expect(userStore.isAdmin).toBe(false)

      userStore.role = Roles.Admin
      expect(userStore.isAdmin).toBe(true)
    })

    it('should correctly identify supporter status', () => {
      const userStore = useUserStore()
      expect(userStore.isSupporter).toBe(false)

      userStore.role = Roles.Supporter
      expect(userStore.isSupporter).toBe(true)
    })

    it('should correctly identify admin or supporter status', () => {
      const userStore = useUserStore()
      expect(userStore.isAdminOrSupporter).toBe(false)

      userStore.role = Roles.Admin
      expect(userStore.isAdminOrSupporter).toBe(true)

      userStore.role = Roles.Supporter
      expect(userStore.isAdminOrSupporter).toBe(true)

      userStore.role = Roles.Default
      expect(userStore.isAdminOrSupporter).toBe(false)
    })

    it('should return correct role data', () => {
      const userStore = useUserStore()

      // Default role
      expect(userStore.roleData).toEqual({
        color: 'surface',
        icon: '',
        text: ''
      })

      userStore.role = Roles.Admin
      expect(userStore.roleData).toEqual({
        color: 'primary',
        icon: 'mdi-crown',
        text: 'Admin'
      })

      userStore.role = Roles.Supporter
      expect(userStore.roleData).toEqual({
        color: 'supporter',
        icon: 'mdi-heart',
        text: 'Supporter'
      })
    })

    it('should count number of linked providers', () => {
      const userStore = useUserStore()
      expect(userStore.numberOfLinkedProviders).toBe(0)

      userStore.setInitialLoginData(
        commonMocks.loginResponse({
          auth: {
            activeProvider: AuthProvider.Google,
            linkedProviders: {
              [AuthProvider.Google]: { linked: true, identifier: 'test@example.com' },
              [AuthProvider.Discord]: { linked: true },
              [AuthProvider.Patreon]: { linked: false }
            },
            tokens: {
              accessToken: 'token',
              refreshToken: 'refresh',
              expiryDate: 0
            }
          }
        })
      )
      expect(userStore.numberOfLinkedProviders).toBe(2)
    })

    it('should check if provider is linked', () => {
      const userStore = useUserStore()
      expect(userStore.isProviderLinked(AuthProvider.Google)).toBe(false)

      userStore.setInitialLoginData(
        commonMocks.loginResponse({
          auth: {
            activeProvider: AuthProvider.Google,
            linkedProviders: {
              [AuthProvider.Google]: { linked: true, identifier: 'test@example.com' },
              [AuthProvider.Discord]: { linked: false },
              [AuthProvider.Patreon]: { linked: true }
            },
            tokens: {
              accessToken: 'token',
              refreshToken: 'refresh',
              expiryDate: 0
            }
          }
        })
      )

      expect(userStore.isProviderLinked(AuthProvider.Google)).toBe(true)
      expect(userStore.isProviderLinked(AuthProvider.Discord)).toBe(false)
      expect(userStore.isProviderLinked(AuthProvider.Patreon)).toBe(true)
    })

    it('should return only non-expert islands from baseIslands', () => {
      const userStore = useUserStore()

      const baseIslands = userStore.baseIslands
      const expected = Object.values(userStore.islands).filter((island) => !island.expert)

      expect(baseIslands).toHaveLength(expected.length)
      expect(baseIslands.every((island) => !island.expert)).toBe(true)
      expect(baseIslands.map((island) => island.shortName)).toEqual(expected.map((island) => island.shortName))
    })

    it('should return only expert islands from expertIslands', () => {
      const userStore = useUserStore()

      const expertIslands = userStore.expertIslands
      const expected = Object.values(userStore.islands).filter((island) => island.expert)

      expect(expertIslands).toHaveLength(expected.length)
      expect(expertIslands.every((island) => island.expert)).toBe(true)
      expect(expertIslands.map((island) => island.shortName)).toEqual(expected.map((island) => island.shortName))
    })
  })

  it('setInitialLoginData should update the name and avatar', () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData({
      name: 'some name',
      avatar: 'some avatar',
      externalId: 'some id',
      role: Roles.Default,
      friendCode: 'some friend code',
      auth: {
        activeProvider: AuthProvider.Google,
        linkedProviders: {
          [AuthProvider.Google]: {
            linked: true,
            identifier: 'some-email'
          },
          [AuthProvider.Discord]: {
            linked: false
          },
          [AuthProvider.Patreon]: {
            linked: false
          }
        },
        tokens: {
          accessToken: 'some access token',
          refreshToken: 'some refresh token',
          expiryDate: 0
        }
      }
    })
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "auth": {
          "activeProvider": "google",
          "linkedProviders": {
            "discord": {
              "linked": false,
            },
            "google": {
              "identifier": "some-email",
              "linked": true,
            },
            "patreon": {
              "linked": false,
            },
          },
          "tokens": {
            "accessToken": "some access token",
            "expiryDate": 0,
            "refreshToken": "some refresh token",
          },
        },
        "avatar": "some avatar",
        "externalId": "some id",
        "friendCode": "some friend code",
        "islands": {
          "GGEX": {
            "areaBonus": 0,
            "berries": [],
            "expert": true,
            "name": "Greengrass Isle (Expert Mode)",
            "shortName": "GGEX",
          },
          "cyan": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "ORAN",
                "type": "water",
                "value": 31,
              },
              {
                "name": "PAMTRE",
                "type": "flying",
                "value": 24,
              },
              {
                "name": "PECHA",
                "type": "fairy",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Cyan Beach",
            "shortName": "cyan",
          },
          "greengrass": {
            "areaBonus": 0,
            "berries": [],
            "expert": false,
            "name": "Greengrass Isle",
            "shortName": "greengrass",
          },
          "lapis": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "CHERI",
                "type": "fighting",
                "value": 27,
              },
              {
                "name": "DURIN",
                "type": "grass",
                "value": 30,
              },
              {
                "name": "MAGO",
                "type": "psychic",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Lapis Lakeside",
            "shortName": "lapis",
          },
          "powerplant": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              {
                "name": "BLUK",
                "type": "ghost",
                "value": 26,
              },
              {
                "name": "GREPA",
                "type": "electric",
                "value": 25,
              },
            ],
            "expert": false,
            "name": "Old Gold Power Plant",
            "shortName": "powerplant",
          },
          "snowdrop": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "PERSIM",
                "type": "normal",
                "value": 28,
              },
              {
                "name": "RAWST",
                "type": "ice",
                "value": 32,
              },
              {
                "name": "WIKI",
                "type": "dark",
                "value": 31,
              },
            ],
            "expert": false,
            "name": "Snowdrop Tundra",
            "shortName": "snowdrop",
          },
          "taupe": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "FIGY",
                "type": "ground",
                "value": 29,
              },
              {
                "name": "LEPPA",
                "type": "fire",
                "value": 27,
              },
              {
                "name": "SITRUS",
                "type": "rock",
                "value": 30,
              },
            ],
            "expert": false,
            "name": "Taupe Hollow",
            "shortName": "taupe",
          },
        },
        "name": "some name",
        "potSize": 81,
        "randomizeNicknames": true,
        "role": "default",
        "supporterSince": null,
      }
    `)
  })

  it('setUserSettings should update user settings and area bonuses', () => {
    const userStore = useUserStore()
    userStore.setUserSettings({
      name: 'new name',
      avatar: 'new avatar',
      role: Roles.Admin,
      areaBonuses: {
        cyan: 10,
        greengrass: 20,
        lapis: 30,
        powerplant: 40,
        snowdrop: 50,
        taupe: 60
      },
      potSize: 25,
      supporterSince: '2024-01-01',
      randomizeNicknames: false
    })

    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "auth": null,
        "avatar": "new avatar",
        "externalId": null,
        "friendCode": null,
        "islands": {
          "GGEX": {
            "areaBonus": 0,
            "berries": [],
            "expert": true,
            "name": "Greengrass Isle (Expert Mode)",
            "shortName": "GGEX",
          },
          "cyan": {
            "areaBonus": 10,
            "berries": [
              {
                "name": "ORAN",
                "type": "water",
                "value": 31,
              },
              {
                "name": "PAMTRE",
                "type": "flying",
                "value": 24,
              },
              {
                "name": "PECHA",
                "type": "fairy",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Cyan Beach",
            "shortName": "cyan",
          },
          "greengrass": {
            "areaBonus": 20,
            "berries": [],
            "expert": false,
            "name": "Greengrass Isle",
            "shortName": "greengrass",
          },
          "lapis": {
            "areaBonus": 30,
            "berries": [
              {
                "name": "CHERI",
                "type": "fighting",
                "value": 27,
              },
              {
                "name": "DURIN",
                "type": "grass",
                "value": 30,
              },
              {
                "name": "MAGO",
                "type": "psychic",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Lapis Lakeside",
            "shortName": "lapis",
          },
          "powerplant": {
            "areaBonus": 40,
            "berries": [
              {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              {
                "name": "BLUK",
                "type": "ghost",
                "value": 26,
              },
              {
                "name": "GREPA",
                "type": "electric",
                "value": 25,
              },
            ],
            "expert": false,
            "name": "Old Gold Power Plant",
            "shortName": "powerplant",
          },
          "snowdrop": {
            "areaBonus": 50,
            "berries": [
              {
                "name": "PERSIM",
                "type": "normal",
                "value": 28,
              },
              {
                "name": "RAWST",
                "type": "ice",
                "value": 32,
              },
              {
                "name": "WIKI",
                "type": "dark",
                "value": 31,
              },
            ],
            "expert": false,
            "name": "Snowdrop Tundra",
            "shortName": "snowdrop",
          },
          "taupe": {
            "areaBonus": 60,
            "berries": [
              {
                "name": "FIGY",
                "type": "ground",
                "value": 29,
              },
              {
                "name": "LEPPA",
                "type": "fire",
                "value": 27,
              },
              {
                "name": "SITRUS",
                "type": "rock",
                "value": 30,
              },
            ],
            "expert": false,
            "name": "Taupe Hollow",
            "shortName": "taupe",
          },
        },
        "name": "new name",
        "potSize": 25,
        "randomizeNicknames": false,
        "role": "admin",
        "supporterSince": "2024-01-01",
      }
    `)
  })

  it('syncUserSettings should fetch and update user settings', async () => {
    UserService.getUserSettings = vi.fn().mockResolvedValue({
      name: 'synced name',
      avatar: 'synced avatar',
      role: Roles.Admin,
      areaBonuses: {
        cyan: 15,
        greengrass: 25,
        lapis: 35,
        powerplant: 45,
        snowdrop: 55,
        taupe: 65
      },
      potSize: 30,
      supporterSince: '2024-02-01'
    })

    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    await userStore.syncUserSettings()

    expect(UserService.getUserSettings).toHaveBeenCalled()
  })

  it('reset should return name and avatar to defaults', () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    userStore.$reset()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "auth": null,
        "avatar": null,
        "externalId": null,
        "friendCode": null,
        "islands": {
          "GGEX": {
            "areaBonus": 0,
            "berries": [],
            "expert": true,
            "name": "Greengrass Isle (Expert Mode)",
            "shortName": "GGEX",
          },
          "cyan": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "ORAN",
                "type": "water",
                "value": 31,
              },
              {
                "name": "PAMTRE",
                "type": "flying",
                "value": 24,
              },
              {
                "name": "PECHA",
                "type": "fairy",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Cyan Beach",
            "shortName": "cyan",
          },
          "greengrass": {
            "areaBonus": 0,
            "berries": [],
            "expert": false,
            "name": "Greengrass Isle",
            "shortName": "greengrass",
          },
          "lapis": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "CHERI",
                "type": "fighting",
                "value": 27,
              },
              {
                "name": "DURIN",
                "type": "grass",
                "value": 30,
              },
              {
                "name": "MAGO",
                "type": "psychic",
                "value": 26,
              },
            ],
            "expert": false,
            "name": "Lapis Lakeside",
            "shortName": "lapis",
          },
          "powerplant": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              {
                "name": "BLUK",
                "type": "ghost",
                "value": 26,
              },
              {
                "name": "GREPA",
                "type": "electric",
                "value": 25,
              },
            ],
            "expert": false,
            "name": "Old Gold Power Plant",
            "shortName": "powerplant",
          },
          "snowdrop": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "PERSIM",
                "type": "normal",
                "value": 28,
              },
              {
                "name": "RAWST",
                "type": "ice",
                "value": 32,
              },
              {
                "name": "WIKI",
                "type": "dark",
                "value": 31,
              },
            ],
            "expert": false,
            "name": "Snowdrop Tundra",
            "shortName": "snowdrop",
          },
          "taupe": {
            "areaBonus": 0,
            "berries": [
              {
                "name": "FIGY",
                "type": "ground",
                "value": 29,
              },
              {
                "name": "LEPPA",
                "type": "fire",
                "value": 27,
              },
              {
                "name": "SITRUS",
                "type": "rock",
                "value": 30,
              },
            ],
            "expert": false,
            "name": "Taupe Hollow",
            "shortName": "taupe",
          },
        },
        "name": "Guest",
        "potSize": 81,
        "randomizeNicknames": true,
        "role": "default",
        "supporterSince": null,
      }
    `)
  })

  it('should call Google on login and update user data', async () => {
    AuthService.login = vi.fn().mockResolvedValue(
      commonMocks.loginResponse({
        name: 'some name',
        avatar: 'some avatar',
        role: Roles.Default,
        auth: {
          activeProvider: AuthProvider.Google,
          linkedProviders: {
            [AuthProvider.Google]: { linked: true },
            [AuthProvider.Discord]: { linked: false },
            [AuthProvider.Patreon]: { linked: false }
          },
          tokens: {
            accessToken: 'some access token',
            refreshToken: 'some refresh token',
            expiryDate: 10
          }
        }
      })
    )

    router.push = vi.fn()
    UserService.getUserSettings = vi.fn().mockResolvedValue({
      name: 'some name',
      avatar: 'some avatar',
      role: Roles.Default,
      areaBonuses: {
        cyan: 0,
        greengrass: 0,
        lapis: 0,
        powerplant: 0,
        snowdrop: 0,
        taupe: 0
      },
      potSize: 69,
      supporterSince: null,
      randomizeNicknames: true
    })

    const teamStore = useTeamStore()
    teamStore.syncTeams = vi.fn()
    const userStore = useUserStore()
    await userStore.login({
      authCode: 'some auth code',
      provider: AuthProvider.Google,
      originalRoute: 'http://localhost:3000/original',
      redirectUri: 'http://localhost:3000/patreon'
    })

    expect(AuthService.login).toHaveBeenCalledWith('some auth code', 'google', 'http://localhost:3000/patreon')
    expect(router.push).toHaveBeenCalledWith('http://localhost:3000/original')
    expect(teamStore.syncTeams).toHaveBeenCalled()
  })

  it('should refresh tokens if expired', async () => {
    AuthService.refresh = vi.fn().mockResolvedValue({
      access_token: 'new access token',
      expiry_date: 10
    })

    const userStore = useUserStore()
    userStore.setInitialLoginData(
      commonMocks.loginResponse({
        auth: {
          activeProvider: AuthProvider.Google,
          linkedProviders: {
            [AuthProvider.Google]: {
              linked: true,
              identifier: 'some-email'
            },
            [AuthProvider.Discord]: {
              linked: false
            },
            [AuthProvider.Patreon]: {
              linked: false
            }
          },
          tokens: {
            accessToken: 'old access token',
            refreshToken: 'refresh token',
            expiryDate: Date.now() - 1000 // expired
          }
        }
      })
    )

    await userStore.refresh()

    expect(AuthService.refresh).toHaveBeenCalledWith('refresh token', 'google', undefined)
    expect(userStore.auth?.tokens.accessToken).toBe('new access token')
    expect(userStore.auth?.tokens.refreshToken).toBe('refresh token')
    expect(userStore.auth?.tokens.expiryDate).toBe(10)
  })

  describe('unlinkProvider', () => {
    it('should call auth service and logout if unlinking active provider', async () => {
      AuthService.unlinkProvider = vi.fn()
      const userStore = useUserStore()
      const logoutSpy = vi.spyOn(userStore, 'logout')
      userStore.setInitialLoginData(
        commonMocks.loginResponse({
          auth: {
            activeProvider: AuthProvider.Google,
            linkedProviders: {
              [AuthProvider.Google]: { linked: true, identifier: 'test@example.com' },
              [AuthProvider.Discord]: { linked: false },
              [AuthProvider.Patreon]: { linked: false }
            },
            tokens: {
              accessToken: 'some access token',
              refreshToken: 'some refresh token',
              expiryDate: 0
            }
          }
        })
      )
      await userStore.unlinkProvider(AuthProvider.Google)

      expect(AuthService.unlinkProvider).toHaveBeenCalledWith(AuthProvider.Google)
      expect(logoutSpy).toHaveBeenCalled()
    })

    it('should not logout if unlinking non-active provider', async () => {
      const userStore = useUserStore()
      const logoutSpy = vi.spyOn(userStore, 'logout')
      AuthService.unlinkProvider = vi.fn()

      userStore.setInitialLoginData(
        commonMocks.loginResponse({
          auth: {
            activeProvider: AuthProvider.Google,
            linkedProviders: {
              [AuthProvider.Google]: { linked: true },
              [AuthProvider.Discord]: { linked: true },
              [AuthProvider.Patreon]: { linked: false }
            },
            tokens: {
              accessToken: 'some access token',
              refreshToken: 'some refresh token',
              expiryDate: 0
            }
          }
        })
      )
      await userStore.unlinkProvider(AuthProvider.Discord)
      expect(AuthService.unlinkProvider).toHaveBeenCalledWith(AuthProvider.Discord)
      expect(logoutSpy).not.toHaveBeenCalled()
    })

    it('should handle errors', async () => {
      AuthService.unlinkProvider = vi.fn().mockRejectedValue(new Error('Failed to unlink'))
      const userStore = useUserStore()
      const logoutSpy = vi.spyOn(userStore, 'logout')

      await expect(userStore.unlinkProvider(AuthProvider.Google)).rejects.toThrow('Failed to unlink')
      expect(AuthService.unlinkProvider).toHaveBeenCalledWith(AuthProvider.Google)
      expect(logoutSpy).not.toHaveBeenCalled()
    })
  })
})
