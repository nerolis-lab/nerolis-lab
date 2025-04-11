import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import type { AuthProvider } from 'sleepapi-common';
import { Roles, type LoginResponse, type RefreshResponse, type UserHeader } from 'sleepapi-common';

export abstract class AbstractProvider<TClient> {
  public abstract provider: AuthProvider;
  abstract client: TClient | undefined;

  abstract signup(params: {
    authorization_code: string;
    redirect_uri: string;
    preExistingUser?: DBUser;
  }): Promise<LoginResponse>;

  abstract refresh(params: { refresh_token: string; redirect_uri: string }): Promise<RefreshResponse>;

  abstract unlink(user: DBUser): Promise<void>;

  abstract verifyExistingUser(userHeader: UserHeader): Promise<DBUser>;

  public async verifyAdmin(userHeader: UserHeader): Promise<DBUser> {
    const user = await this.verifyExistingUser(userHeader);
    if (user.role !== Roles.Admin) {
      throw new AuthorizationError('User is not an admin');
    }
    return user;
  }

  abstract updateLastLogin(auth_id: string, role?: Roles): Promise<DBUser>;
}
