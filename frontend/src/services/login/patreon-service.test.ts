import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getPatreonAuthCode, loginWithPatreon, PATREON_REDIRECT_URI } from './patreon-service'

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

describe('patreon-service', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'incorrect-url' },
      configurable: true
    })

    vi.stubEnv('VITE_PATREON_CLIENT_ID', mockClientId)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('getPatreonAuthCode', () => {
    it('should construct the correct authorization URL', () => {
      getPatreonAuthCode(mockRoute)

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: PATREON_REDIRECT_URI,
        response_type: 'code',
        scope: 'identity identity[email]',
        state: '/calculator'
      })

      const expectedUrl = `https://www.patreon.com/oauth2/authorize?${expectedParams.toString()}`
      expect(window.location.href).toEqual(expectedUrl)
    })

    it('should preserve query parameters in state when present in route', () => {
      const routeWithQuery = {
        ...mockRoute,
        fullPath: '/calculator?param=value',
        query: { param: 'value' }
      } as unknown as RouteLocationNormalizedLoaded

      getPatreonAuthCode(routeWithQuery)

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: 'http://localhost:3000/patreon',
        response_type: 'code',
        scope: 'identity identity[email]',
        state: '/calculator?param=value'
      })

      const expectedUrl = `https://www.patreon.com/oauth2/authorize?${expectedParams.toString()}`
      expect(window.location.href).toBe(expectedUrl)
    })
  })

  describe('loginWithPatreon', () => {
    it('should call getPatreonAuthCode with the current route', async () => {
      await loginWithPatreon(mockRoute)
      expect(window.location.href).toContain('https://www.patreon.com/oauth2/authorize')
    })
  })

  describe('PATREON_REDIRECT_URI', () => {
    it('should construct the correct redirect URI', () => {
      expect(PATREON_REDIRECT_URI).toBe('http://localhost:3000/patreon')
    })
  })
})
