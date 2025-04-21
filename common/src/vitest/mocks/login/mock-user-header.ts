import { AuthProvider } from '../../../api/login/auth-provider';
import type { UserHeader } from '../../../api/login/user-header';

export function userHeader(attrs?: Partial<UserHeader>): UserHeader {
  return {
    Authorization: 'some-access-token',
    Provider: AuthProvider.Google,
    Redirect: 'http://localhost:3000',
    ...attrs
  };
}
