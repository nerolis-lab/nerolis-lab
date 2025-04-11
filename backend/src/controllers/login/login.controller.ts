import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { ProviderFactory } from '@src/services/user-service/login-service/providers/provider-factory.js';
import type { AuthProvider } from 'sleepapi-common';

export default class LoginController {
  public async signup(body: {
    authorization_code: string;
    provider: AuthProvider;
    redirect_uri: string;
    preExistingUser?: DBUser;
  }) {
    const Provider = ProviderFactory.getProvider(body.provider);
    return await Provider.signup(body);
  }

  public async unlink(provider: AuthProvider, user: DBUser) {
    const Provider = ProviderFactory.getProvider(provider);
    return await Provider.unlink(user);
  }

  public async refresh(body: { refresh_token: string; provider: AuthProvider; redirect_uri: string }) {
    const Provider = ProviderFactory.getProvider(body.provider);
    return await Provider.refresh(body);
  }
}
