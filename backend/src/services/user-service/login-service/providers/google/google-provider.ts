import { config } from '@src/config/config.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';
import type { TokenInfo } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';

export interface GoogleUserData {
  sub: string;
  email: string;
  given_name: string;
  picture: string;
}

export class GoogleProviderImpl extends AbstractProvider<OAuth2Client> {
  provider = AuthProvider.Google;
  client: OAuth2Client | undefined;

  private getClient(redirect_uri: string) {
    if (!this.client) {
      this.client = new OAuth2Client({
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        redirectUri: redirect_uri
      });
    }
    return this.client;
  }

  async signup(params: {
    authorization_code: string;
    redirect_uri: string;
    preExistingUser?: DBUser;
  }): Promise<LoginResponse> {
    const { authorization_code, redirect_uri, preExistingUser } = params;

    const { tokens } = await this.getClient(redirect_uri).getToken({
      code: authorization_code,
      redirect_uri
    });

    if (!tokens.refresh_token || !tokens.access_token || !tokens.expiry_date) {
      throw new AuthorizationError(`Missing data in google getToken response. Response: [${JSON.stringify(tokens)}]`);
    }

    this.getClient(redirect_uri).setCredentials({ access_token: tokens.access_token });

    const userinfo = await this.getClient(redirect_uri).request<GoogleUserData>({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    let existingUser: DBUser;
    if (preExistingUser) {
      // user sent credentials from frontend, indicating they are already signed up, but with different provider
      existingUser = await UserDAO.update({ ...preExistingUser, google_id: userinfo.data.sub });
    } else {
      // either first time signing up ever, or new device
      existingUser =
        (await UserDAO.find({ google_id: userinfo.data.sub })) ??
        (await UserDAO.insert({
          friend_code: generateFriendCode(),
          google_id: userinfo.data.sub,
          external_id: uuid.v4(),
          name: 'New user',
          role: Roles.Default
        }));
    }

    return {
      name: existingUser.name,
      avatar: existingUser.avatar,
      friendCode: existingUser.friend_code,
      auth: {
        activeProvider: AuthProvider.Google,
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date
        },
        linkedProviders: {
          [AuthProvider.Google]: {
            linked: true,
            identifier: userinfo.data.email
          },
          [AuthProvider.Discord]: {
            linked: !!existingUser.discord_id
          },
          [AuthProvider.Patreon]: {
            linked: !!existingUser.patreon_id
          }
        }
      },
      externalId: existingUser.external_id,
      role: existingUser.role
    };
  }

  async refresh(params: { refresh_token: string; redirect_uri: string }): Promise<RefreshResponse> {
    const { refresh_token, redirect_uri } = params;
    this.getClient(redirect_uri).setCredentials({ refresh_token });

    const { token } = await this.getClient(redirect_uri).getAccessToken();
    const { expiry_date } = this.getClient(redirect_uri).credentials;

    if (!token || !expiry_date) {
      throw new AuthorizationError('Failed to refresh Google access token');
    }

    return {
      access_token: token,
      expiry_date
    };
  }

  async unlink(user: DBUser): Promise<void> {
    await UserDAO.update({ ...user, google_id: undefined });
  }

  async verifyExistingUser(userHeader: UserHeader): Promise<DBUser> {
    this.getClient(userHeader.Redirect).setCredentials({ access_token: userHeader.Authorization });
    const response = await this.getClient(userHeader.Redirect).request<TokenInfo>({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${userHeader.Authorization}`
    });
    if (!response?.data?.sub) {
      throw new AuthorizationError('Missing sub in Google token info response');
    }

    const user = await UserDAO.get({ google_id: response.data.sub });
    return this.updateLastLogin(user);
  }

  async updateLastLogin(user: DBUser): Promise<DBUser> {
    return UserDAO.update({ ...user, last_login: new Date() });
  }
}

export const GoogleProvider = new GoogleProviderImpl();
