import type { UserHeader } from '../../../types/login';
import { AuthProvider } from '../../../types/login/auth-provider';

export function userHeader(attrs?: Partial<UserHeader>): UserHeader {
  return {
    Authorization: 'some-access-token',
    Provider: AuthProvider.Google,
    Redirect: 'http://localhost:3000',
    ...attrs
  };
}
