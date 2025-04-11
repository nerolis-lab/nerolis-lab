import type { Roles } from '../../domain';
import type { AuthProvider } from './auth-provider';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

export interface LinkedProvider {
  linked: boolean;
  identifier?: string;
  additionalProperties?: Record<string, string>;
}

export interface AuthProviders {
  tokens: Tokens;
  activeProvider: AuthProvider;
  linkedProviders: Record<AuthProvider, LinkedProvider>;
}

export interface LoginResponse {
  name: string;
  auth: AuthProviders;
  externalId: string;
  friendCode: string;
  role: Roles;
  avatar?: string;
}

export interface RefreshResponse {
  access_token: string;
  expiry_date: number;
}
