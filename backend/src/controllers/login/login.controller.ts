import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { refresh, signup, unlink } from '@src/services/user-service/login-service/login-service.js';
import type { AuthProvider } from 'sleepapi-common';

export default class LoginController {
  public async signup(body: {
    authorization_code: string;
    provider: AuthProvider;
    redirect_uri?: string;
    existingUser?: DBUser;
  }) {
    return await signup(body);
  }

  public async unlink(provider: AuthProvider, user: DBUser) {
    return await unlink(provider, user);
  }

  public async refresh(body: { refresh_token: string; provider: AuthProvider; redirect_uri?: string }) {
    return await refresh(body);
  }
}
