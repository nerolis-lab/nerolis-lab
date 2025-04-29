import serverAxios from '@/router/server-axios'
import { AuthService } from '@/services/login/auth-service'
import axios from 'axios'
import { AuthProvider } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

const mockedServerAxios = vi.mocked(serverAxios, true)
const mockedAxios = vi.mocked(axios, true)

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}))

vi.mock('@/router/server-axios', () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
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

describe('AuthService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call signup endpoint with authorization code', async () => {
      await AuthService.login('some-auth-code', AuthProvider.Google)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/signup', {
        authorization_code: 'some-auth-code',
        provider: 'google'
      })
    })

    it('should include redirect_uri when provided', async () => {
      await AuthService.login('some-auth-code', AuthProvider.Google, 'http://localhost:3000/callback')

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/signup', {
        authorization_code: 'some-auth-code',
        provider: 'google',
        redirect_uri: 'http://localhost:3000/callback'
      })
    })
  })

  describe('refresh', () => {
    it('should call refresh endpoint with refresh token', async () => {
      await AuthService.refresh('refresh-token', AuthProvider.Google)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/refresh', {
        refresh_token: 'refresh-token',
        provider: 'google'
      })
    })

    it('should include redirect_uri when provided', async () => {
      await AuthService.refresh('refresh-token', AuthProvider.Google, 'http://localhost:3000/callback')

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/login/refresh', {
        refresh_token: 'refresh-token',
        provider: 'google',
        redirect_uri: 'http://localhost:3000/callback'
      })
    })

    it('should throw an error if refresh fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.refresh('something', AuthProvider.Google)).rejects.toThrow('Request failed')
    })
  })

  describe('unlinkProvider', () => {
    it('should call unlink endpoint with provider', async () => {
      await AuthService.unlinkProvider(AuthProvider.Google)

      expect(mockedServerAxios.delete).toHaveBeenCalledWith('login/unlink/google')
    })

    it('should throw an error if unlink fails', async () => {
      mockedServerAxios.delete.mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.unlinkProvider(AuthProvider.Google)).rejects.toThrow('Request failed')
    })
  })

  describe('delete', () => {
    it('should call delete endpoint to delete user', async () => {
      await AuthService.delete()

      expect(mockedServerAxios.delete).toHaveBeenCalledWith('/user')
    })

    it('should throw an error if delete fails', async () => {
      mockedServerAxios.delete.mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.delete()).rejects.toThrow('Request failed')
    })
  })
})
