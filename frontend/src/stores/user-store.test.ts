import router from '@/router/router'
import { AuthService } from '@/services/login/auth-service'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import { AuthProvider, commonMocks, MAX_POT_SIZE, Roles } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'
import { googleLogout } from 'vue3-google-login'

vi.mock('vue3-google-login', () => ({
  googleLogout: vi.fn()
}))

describe('User Store', () => {
  it('should migrate the store', () => {
    const userStore = useUserStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStore.role = null as any
    expect(userStore.role).toBeNull()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStore.areaBonus = null as any
    expect(userStore.areaBonus).toBeNull()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStore.potSize = null as any
    expect(userStore.potSize).toBeNull()

    userStore.migrate()
    expect(userStore.role).toBe(Roles.Default)
    expect(userStore.areaBonus).toEqual({
      cyan: 0,
      greengrass: 0,
      lapis: 0,
      powerplant: 0,
      snowdrop: 0,
      taupe: 0
    })
    expect(userStore.potSize).toBe(MAX_POT_SIZE)
  })

  it('should have expected default state', () => {
    const userStore = useUserStore()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
        "auth": null,
        "avatar": null,
        "externalId": null,
        "friendCode": null,
        "name": "Guest",
        "potSize": 69,
        "role": "default",
      }
    `)

    expect(userStore.loggedIn).toBeFalsy()
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
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
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
        "name": "some name",
        "potSize": 69,
        "role": "default",
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
      potSize: 25
    })

    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 10,
          "greengrass": 20,
          "lapis": 30,
          "powerplant": 40,
          "snowdrop": 50,
          "taupe": 60,
        },
        "auth": null,
        "avatar": "new avatar",
        "externalId": null,
        "friendCode": null,
        "name": "new name",
        "potSize": 25,
        "role": "admin",
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
      potSize: 30
    })

    const userStore = useUserStore()
    await userStore.syncUserSettings()

    expect(UserService.getUserSettings).toHaveBeenCalled()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 15,
          "greengrass": 25,
          "lapis": 35,
          "powerplant": 45,
          "snowdrop": 55,
          "taupe": 65,
        },
        "auth": null,
        "avatar": "synced avatar",
        "externalId": null,
        "friendCode": null,
        "name": "synced name",
        "potSize": 30,
        "role": "admin",
      }
    `)
  })

  it('reset should return name and avatar to defaults', () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
    userStore.$reset()
    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
        "auth": null,
        "avatar": null,
        "externalId": null,
        "friendCode": null,
        "name": "Guest",
        "potSize": 69,
        "role": "default",
      }
    `)
  })

  it('should call Google on login and update user data', async () => {
    AuthService.login = vi.fn().mockResolvedValue({
      auth: {
        google: {
          access_token: 'some access token',
          refresh_token: 'some refresh token',
          expiry_date: '10'
        }
      },
      name: 'some name',
      avatar: 'some avatar',
      role: 'default'
    })

    router.go = vi.fn()

    const userStore = useUserStore()
    await userStore.login('some auth code', AuthProvider.Google, 'http://localhost:3000')

    expect(AuthService.login).toHaveBeenCalledWith('some auth code', 'google', 'http://localhost:3000')
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
            }
          },
          tokens: {
            accessToken: 'old access token',
            refreshToken: 'old refresh token',
            expiryDate: -10
          }
        }
      })
    )

    await userStore.refresh()

    expect(AuthService.refresh).toHaveBeenCalledWith('old refresh token', 'google', undefined)
    expect(userStore.auth).toMatchObject({
      activeProvider: 'google',
      linkedProviders: {
        google: {
          linked: true
        },
        discord: {
          linked: false
        }
      },
      tokens: {
        accessToken: 'new access token',
        refreshToken: 'old refresh token',
        expiryDate: 10
      }
    })
  })

  it('should not refresh tokens if not expired', async () => {
    AuthService.refresh = vi.fn()

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
            }
          },
          tokens: {
            accessToken: 'old access token',
            refreshToken: 'old refresh token',
            expiryDate: Date.now() + 3600 * 1000 // 1 hour later
          }
        }
      })
    )

    await userStore.refresh()

    expect(AuthService.refresh).not.toHaveBeenCalled()
  })

  it('should clear user data if no tokens are available', async () => {
    const userStore = useUserStore()
    userStore.$reset = vi.fn()

    userStore.auth = null

    await userStore.refresh()

    expect(userStore.$reset).toHaveBeenCalled()
  })

  it('should logout on refresh error', async () => {
    AuthService.refresh = vi.fn().mockRejectedValue(new Error('Refresh error'))

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
            }
          },
          tokens: {
            accessToken: 'old access token',
            refreshToken: 'old refresh token',
            expiryDate: -10
          }
        }
      })
    )

    userStore.logout = vi.fn()

    await userStore.refresh()

    expect(userStore.logout).toHaveBeenCalled()
  })

  it('should clean up on logout', async () => {
    router.push = vi.fn()

    const userStore = useUserStore()
    userStore.setInitialLoginData(
      commonMocks.loginResponse({
        name: 'some name',
        avatar: 'some avatar',
        externalId: 'some id',
        role: Roles.Default,
        auth: {
          activeProvider: AuthProvider.Google,
          linkedProviders: {
            [AuthProvider.Google]: {
              linked: true,
              identifier: 'some-email'
            },
            [AuthProvider.Discord]: {
              linked: false
            }
          },
          tokens: {
            accessToken: 'old access token',
            refreshToken: 'old refresh token',
            expiryDate: -10
          }
        }
      })
    )

    userStore.logout()

    expect(userStore.$state).toMatchInlineSnapshot(`
      {
        "areaBonus": {
          "cyan": 0,
          "greengrass": 0,
          "lapis": 0,
          "powerplant": 0,
          "snowdrop": 0,
          "taupe": 0,
        },
        "auth": null,
        "avatar": null,
        "externalId": null,
        "friendCode": null,
        "name": "Guest",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
      }
    `)
    expect(googleLogout).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/')
  })
})
