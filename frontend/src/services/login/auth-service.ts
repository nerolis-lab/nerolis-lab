import serverAxios from '@/router/server-axios'
import type { AuthProvider, LoginResponse, RefreshResponse } from 'sleepapi-common'

class AuthServiceImpl {
  public async login(
    authorization_code: string,
    provider: AuthProvider,
    redirect_uri?: string
  ): Promise<LoginResponse> {
    const response = await serverAxios.post<LoginResponse>(
      '/login/signup',
      {
        authorization_code,
        provider,
        redirect_uri
      },
      { skipRefresh: true }
    )

    return response.data
  }

  public async unlinkProvider(provider: AuthProvider) {
    await serverAxios.delete(`login/unlink/${provider}`)
  }

  public async refresh(refresh_token: string, provider: AuthProvider, redirect_uri?: string): Promise<RefreshResponse> {
    const response = await serverAxios.post<RefreshResponse>(
      '/login/refresh',
      {
        refresh_token,
        provider,
        redirect_uri
      },
      { skipRefresh: true }
    )

    return response.data
  }

  public async delete() {
    await serverAxios.delete('/user')
  }
}
export const AuthService = new AuthServiceImpl()
