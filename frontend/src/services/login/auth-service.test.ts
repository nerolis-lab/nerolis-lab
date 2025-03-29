import { AuthService } from '@/services/login/auth-service'
import { AuthProvider, commonMocks, Roles, type RefreshResponse } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('axios')

vi.mock('@/router/server-axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }
  }
})

import serverAxios from '@/router/server-axios'
const mockedServerAxios = vi.mocked(serverAxios, true)

describe('AuthService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call signup endpoint with authorization code', async () => {
    // Arrange
    const expectedResponse = commonMocks.loginResponse({
      name: 'Test User',
      auth: {
        activeProvider: AuthProvider.Google,
        linkedProviders: {
          [AuthProvider.Google]: {
            linked: true,
            identifier: 'test@example.com'
          },
          [AuthProvider.Discord]: {
            linked: false
          }
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiryDate: 123456789
        }
      },
      externalId: 'external-id',
      role: Roles.Default
    })

    mockedServerAxios.post.mockResolvedValueOnce({
      data: expectedResponse
    })

    // Act
    const result = await AuthService.login('some-auth-code', AuthProvider.Google)

    // Assert
    expect(mockedServerAxios.post).toHaveBeenCalledWith('login/signup', {
      authorization_code: 'some-auth-code',
      provider: 'google'
    })
    expect(result).toEqual(expectedResponse)
  })

  it('should call refresh endpoint with refresh token', async () => {
    // Arrange
    const refresh_token = 'refresh-token'
    const expectedResponse = {
      access_token: 'new-access-token',
      expiry_date: 987654321
    } as RefreshResponse

    mockedServerAxios.post.mockResolvedValueOnce({
      data: expectedResponse
    })

    // Act
    const result = await AuthService.refresh(refresh_token, AuthProvider.Google)

    // Assert
    expect(mockedServerAxios.post).toHaveBeenCalledWith('login/refresh', {
      refresh_token,
      provider: 'google'
    })
    expect(result).toEqual(expectedResponse)
  })

  it('should throw an error if refresh fails', async () => {
    mockedServerAxios.post.mockRejectedValueOnce(new Error('Request failed'))

    await expect(AuthService.refresh('something', AuthProvider.Google)).rejects.toThrow('Request failed')
  })

  it('should call delete endpoint to delete user', async () => {
    // Act
    await AuthService.delete()

    // Assert
    expect(mockedServerAxios.delete).toHaveBeenCalledWith('/user')
  })
})
