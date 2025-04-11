import { AuthProvider } from '../../../api/login/auth-provider';
import type { LoginResponse } from '../../../api/login/login';
import { Roles } from '../../../domain/user/roles';

export function loginResponse(attrs?: Partial<LoginResponse>): LoginResponse {
  return {
    name: 'Test User',
    avatar: 'test-avatar',
    externalId: 'test-external-id',
    friendCode: 'test-friend-code',
    role: Roles.Default,
    auth: {
      tokens: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiryDate: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days from now
      },
      activeProvider: AuthProvider.Google,
      linkedProviders: {
        [AuthProvider.Google]: {
          linked: true
        },
        [AuthProvider.Discord]: {
          linked: false
        },
        [AuthProvider.Patreon]: {
          linked: false
        }
      }
    },
    ...attrs
  };
}
