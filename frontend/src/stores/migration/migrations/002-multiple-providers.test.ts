/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StoreMap } from '@/stores/migration/migration-type'
import { useUserStore } from '@/stores/user-store'
import { AuthProvider } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import migration from './002-multiple-providers'

describe('002-multiple-providers', () => {
  let userStore: ReturnType<typeof useUserStore>
  let stores: StoreMap

  beforeEach(() => {
    userStore = useUserStore()
    stores = { user: userStore }
  })

  it('should have correct version and description', () => {
    expect(migration.version).toBe(2)
    expect(migration.description).toBe('Adds support for multiple providers.')
  })

  describe('user store migration', () => {
    it('should migrate Google auth structure', () => {
      const mockEmail = 'test@example.com'
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiryDate: Date.now() + 3600000
      }

      // Set up old state structure
      userStore.$state = {
        name: 'Test User',
        email: mockEmail,
        tokens: mockTokens
      } as any

      migration.up(stores)

      // Old properties should be removed
      expect(userStore.$state).not.toHaveProperty('email')
      expect(userStore.$state).not.toHaveProperty('tokens')
      expect(userStore.$state).not.toHaveProperty('identifier')

      // New auth structure should be set up correctly
      expect(userStore.auth).toEqual({
        activeProvider: AuthProvider.Google,
        tokens: {
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          expiryDate: mockTokens.expiryDate
        },
        linkedProviders: {
          google: {
            linked: true,
            identifier: mockEmail
          },
          discord: {
            linked: false
          },
          patreon: {
            linked: false
          }
        }
      })

      // Other properties should remain unchanged
      expect(userStore.name).toBe('Test User')
    })

    it('should not modify state if user is not logged in', () => {
      const initialState = {
        email: null,
        tokens: null,
        name: 'Test User'
      }

      userStore.$state = { ...initialState } as any

      migration.up(stores)

      expect(userStore.auth).toBeNull()
      expect(userStore.name).toBe('Test User')
      expect((userStore.$state as any).email).toBeNull()
      expect((userStore.$state as any).tokens).toBeNull()
    })
  })
})
