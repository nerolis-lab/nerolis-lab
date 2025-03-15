import router from '@/router/router'
import { GoogleService } from '@/services/login/google-service'
import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { MAX_POT_SIZE, Roles } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { googleLogout } from 'vue3-google-login'

vi.mock('vue3-google-login', () => ({
  googleLogout: vi.fn()
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

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
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": null,
      }
    `)

    expect(userStore.loggedIn).toBeFalsy()
  })

  it('setUserData should update the name and avatar', () => {
    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id',
      role: Roles.Default
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
        "avatar": "some avatar",
        "email": "some email",
        "externalId": "some id",
        "name": "some name",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": null,
      }
    `)
  })

  it('setTokens should update the token info', () => {
    const userStore = useUserStore()

    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
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
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": {
          "accessToken": "some access token",
          "expiryDate": 10,
          "refreshToken": "some refresh token",
        },
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
        "avatar": "new avatar",
        "email": null,
        "externalId": null,
        "name": "new name",
        "potSize": 25,
        "role": "admin",
        "tokens": null,
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
        "avatar": "synced avatar",
        "email": null,
        "externalId": null,
        "name": "synced name",
        "potSize": 30,
        "role": "admin",
        "tokens": null,
      }
    `)
  })

  it('reset should return name and avatar to defaults', () => {
    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id',
      role: Roles.Default
    })
    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
    })
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
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": null,
      }
    `)
  })

  it('should call Google on login and update user data', async () => {
    GoogleService.login = vi.fn().mockResolvedValue({
      access_token: 'some access token',
      refresh_token: 'some refresh token',
      expiry_date: '10',
      name: 'some name',
      avatar: 'some avatar',
      role: 'default'
    })

    router.go = vi.fn()

    const userStore = useUserStore()
    await userStore.login('some auth code')

    expect(GoogleService.login).toHaveBeenCalledWith('some auth code')
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
        "avatar": "some avatar",
        "email": undefined,
        "externalId": undefined,
        "name": "some name",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": {
          "accessToken": "some access token",
          "expiryDate": "10",
          "refreshToken": "some refresh token",
        },
      }
    `)
    expect(router.go).toHaveBeenCalledWith(0)
  })

  it('should refresh tokens if expired', async () => {
    GoogleService.refresh = vi.fn().mockResolvedValue({
      access_token: 'new access token',
      expiry_date: 10
    })

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'old access token',
      refreshToken: 'old refresh token',
      expiryDate: -10
    })

    await userStore.refresh()

    expect(GoogleService.refresh).toHaveBeenCalledWith('old refresh token')
    expect(userStore.tokens).toMatchObject({
      accessToken: 'new access token',
      refreshToken: 'old refresh token',
      expiryDate: 10
    })
  })

  it('should not refresh tokens if not expired', async () => {
    GoogleService.refresh = vi.fn()

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: Date.now() + 3600 * 1000 // 1 hour later
    })

    await userStore.refresh()

    expect(GoogleService.refresh).not.toHaveBeenCalled()
  })

  it('should clear user data if no tokens are available', async () => {
    const userStore = useUserStore()
    userStore.$reset = vi.fn()

    userStore.tokens = null

    await userStore.refresh()

    expect(userStore.$reset).toHaveBeenCalled()
  })

  it('should logout on refresh error', async () => {
    GoogleService.refresh = vi.fn().mockRejectedValue(new Error('Refresh error'))

    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'access token',
      refreshToken: 'refresh token',
      expiryDate: -10
    })

    userStore.logout = vi.fn()

    await userStore.refresh()

    expect(userStore.logout).toHaveBeenCalled()
  })

  it('should clean up on logout', () => {
    router.push = vi.fn()

    const userStore = useUserStore()
    userStore.setUserData({
      name: 'some name',
      avatar: 'some avatar',
      email: 'some email',
      externalId: 'some id',
      role: Roles.Default
    })
    userStore.setTokens({
      accessToken: 'some access token',
      refreshToken: 'some refresh token',
      expiryDate: 10
    })

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
        "avatar": null,
        "email": null,
        "externalId": null,
        "name": "Guest",
        "potSize": ${MAX_POT_SIZE},
        "role": "default",
        "tokens": null,
      }
    `)
    expect(googleLogout).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith('/')
  })
})
