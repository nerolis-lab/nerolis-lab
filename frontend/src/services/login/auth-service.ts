import serverAxios from '@/router/server-axios'
import axios from 'axios'
import type { AuthProvider, LoginResponse, RefreshResponse } from 'sleepapi-common'

class AuthServiceImpl {
  public async login(
    authorization_code: string,
    provider: AuthProvider,
    redirect_uri?: string
  ): Promise<LoginResponse> {
    // we can't use serverAxios here because it triggers a refresh before we have signed up
    const response = await axios.post<LoginResponse>('/api/login/signup', {
      authorization_code,
      provider,
      redirect_uri
    })

    return response.data
  }

  public async unlinkProvider(provider: AuthProvider) {
    await serverAxios.delete(`login/unlink/${provider}`)
  }

  public async refresh(refresh_token: string, provider: AuthProvider, redirect_uri?: string): Promise<RefreshResponse> {
    // we can't use serverAxios here because it triggers a refresh causing infinite loop
    const response = await axios.post<RefreshResponse>('/api/login/refresh', {
      refresh_token,
      provider,
      redirect_uri
    })

    return response.data
  }

  public async delete() {
    await serverAxios.delete('/user')
  }
}
export const AuthService = new AuthServiceImpl()
