import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { DISCORD_REDIRECT_URI, getDiscordAuthCode, loginWithDiscord } from './discord-service'

const mockClientId = 'test-client-id'

const mockRoute: RouteLocationNormalizedLoaded = {
  fullPath: '/calculator',
  path: '/calculator',
  query: {},
  hash: '',
  name: 'Calculator',
  matched: [],
  params: {},
  redirectedFrom: undefined,
  meta: {}
}

describe('discord-service', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'incorrect-url' },
      configurable: true
    })

    vi.stubEnv('VITE_DISCORD_CLIENT_ID', mockClientId)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('getDiscordAuthCode', () => {
    it('should construct the correct authorization URL with default scope', () => {
      getDiscordAuthCode(mockRoute)

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds.members.read',
        state: '/calculator'
      })

      const expectedUrl = `https://discord.com/api/oauth2/authorize?${expectedParams.toString()}`
      expect(window.location.href).toEqual(expectedUrl)
    })

    it('should use custom scope when provided', () => {
      const customScope = 'identify'
      getDiscordAuthCode(mockRoute, customScope)

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: customScope,
        state: '/calculator'
      })

      const expectedUrl = `https://discord.com/api/oauth2/authorize?${expectedParams.toString()}`
      expect(window.location.href).toBe(expectedUrl)
    })

    it('should preserve query parameters in state when present in route', () => {
      const routeWithQuery = {
        ...mockRoute,
        fullPath: '/calculator?param=value',
        query: { param: 'value' }
      } as unknown as RouteLocationNormalizedLoaded

      getDiscordAuthCode(routeWithQuery)

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds.members.read',
        state: '/calculator?param=value'
      })

      const expectedUrl = `https://discord.com/api/oauth2/authorize?${expectedParams.toString()}`
      expect(window.location.href).toBe(expectedUrl)
    })
  })

  describe('loginWithDiscord', () => {
    it('should call getDiscordAuthCode with the current route', async () => {
      await loginWithDiscord(mockRoute)
      expect(window.location.href).toContain('https://discord.com/api/oauth2/authorize')
    })
  })

  describe('DISCORD_REDIRECT_URI', () => {
    it('should construct the correct redirect URI', () => {
      expect(DISCORD_REDIRECT_URI).toBe('http://localhost:3000/discord')
    })
  })
})
