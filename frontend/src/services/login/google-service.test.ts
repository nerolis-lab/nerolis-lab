import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getGoogleAuthCode, GOOGLE_REDIRECT_URI, loginWithGoogle } from './google-service'

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

describe('google-service', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'incorrect-url' },
      configurable: true
    })

    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', mockClientId)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('getGoogleAuthCode', () => {
    it('should construct the correct authorization URL with required parameters', () => {
      getGoogleAuthCode(mockRoute)

      const expectedScopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: expectedScopes.join(' '),
        state: '/calculator'
      })

      const expectedUrl = `https://accounts.google.com/o/oauth2/v2/auth?${expectedParams.toString()}`
      expect(window.location.href).toEqual(expectedUrl)
    })

    it('should preserve query parameters in state when present in route', () => {
      const routeWithQuery = {
        ...mockRoute,
        fullPath: '/calculator?param=value',
        query: { param: 'value' }
      } as unknown as RouteLocationNormalizedLoaded

      getGoogleAuthCode(routeWithQuery)

      const expectedScopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]

      const expectedParams = new URLSearchParams({
        client_id: mockClientId,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: expectedScopes.join(' '),
        state: '/calculator?param=value'
      })

      const expectedUrl = `https://accounts.google.com/o/oauth2/v2/auth?${expectedParams.toString()}`
      expect(window.location.href).toBe(expectedUrl)
    })
  })

  describe('loginWithGoogle', () => {
    it('should call getGoogleAuthCode with the current route', async () => {
      await loginWithGoogle(mockRoute)
      expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth')
    })
  })

  describe('GOOGLE_REDIRECT_URI', () => {
    it('should construct the correct redirect URI', () => {
      expect(GOOGLE_REDIRECT_URI).toBe('http://localhost:3000/google')
    })
  })
})
