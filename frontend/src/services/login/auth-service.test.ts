import serverAxios from '@/router/server-axios'
import { AuthService } from '@/services/login/auth-service'
import { AuthProvider } from 'sleepapi-common'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} })
  }
}))

describe('AuthService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call signup endpoint with authorization code', async () => {
      await AuthService.login('some-auth-code', AuthProvider.Google)

      expect(serverAxios.post).toHaveBeenCalledWith(
        '/login/signup',
        {
          authorization_code: 'some-auth-code',
          provider: 'google',
          redirect_uri: undefined
        },
        { skipRefresh: true }
      )
    })

    it('should include redirect_uri when provided', async () => {
      await AuthService.login('some-auth-code', AuthProvider.Google, 'http://localhost:3000/callback')

      expect(serverAxios.post).toHaveBeenCalledWith(
        '/login/signup',
        {
          authorization_code: 'some-auth-code',
          provider: 'google',
          redirect_uri: 'http://localhost:3000/callback'
        },
        { skipRefresh: true }
      )
    })
  })

  describe('refresh', () => {
    it('should call refresh endpoint with refresh token', async () => {
      await AuthService.refresh('refresh-token', AuthProvider.Google)

      expect(serverAxios.post).toHaveBeenCalledWith(
        '/login/refresh',
        {
          refresh_token: 'refresh-token',
          provider: 'google',
          redirect_uri: undefined
        },
        { skipRefresh: true }
      )
    })

    it('should include redirect_uri when provided', async () => {
      await AuthService.refresh('refresh-token', AuthProvider.Google, 'http://localhost:3000/callback')

      expect(serverAxios.post).toHaveBeenCalledWith(
        '/login/refresh',
        {
          refresh_token: 'refresh-token',
          provider: 'google',
          redirect_uri: 'http://localhost:3000/callback'
        },
        { skipRefresh: true }
      )
    })

    it('should throw an error if refresh fails', async () => {
      vi.mocked(serverAxios.post).mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.refresh('something', AuthProvider.Google)).rejects.toThrow('Request failed')
    })
  })

  describe('unlinkProvider', () => {
    it('should call unlink endpoint with provider', async () => {
      await AuthService.unlinkProvider(AuthProvider.Google)

      expect(serverAxios.delete).toHaveBeenCalledWith('login/unlink/google')
    })

    it('should throw an error if unlink fails', async () => {
      vi.mocked(serverAxios.delete).mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.unlinkProvider(AuthProvider.Google)).rejects.toThrow('Request failed')
    })
  })

  describe('delete', () => {
    it('should call delete endpoint to delete user', async () => {
      await AuthService.delete()

      expect(serverAxios.delete).toHaveBeenCalledWith('/user')
    })

    it('should throw an error if delete fails', async () => {
      vi.mocked(serverAxios.delete).mockRejectedValueOnce(new Error('Request failed'))

      await expect(AuthService.delete()).rejects.toThrow('Request failed')
    })
  })
})
