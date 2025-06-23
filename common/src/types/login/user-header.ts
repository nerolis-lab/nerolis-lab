import type { AuthProvider } from '.';

export interface UserHeader {
  Authorization: string; // Bearer token
  Provider: AuthProvider;
  Redirect: string;
}
