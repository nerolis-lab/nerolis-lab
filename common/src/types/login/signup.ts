import type { AuthProvider } from './auth-provider';

export interface SignupRequest {
  authorization_code: string;
  provider: AuthProvider;
  redirect_uri: string;
}
