import type { AuthProvider } from './auth-provider';

export interface RefreshRequest {
  refresh_token: string;
  provider: AuthProvider;
  redirect_uri: string;
}
