import { config } from '@src/config/config.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';
import type { TokenRequestResult as DiscordTokens, User as DiscordUser } from 'discord-oauth2';
import DiscordOauth2 from 'discord-oauth2';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';

// Neroli's Lab Discord server ID
export const DISCORD_GUILD_ID = '1300099710996058252';
export const DISCORD_SUPPORTER_ID = '1329185999816757338';
export const DISCORD_SERVER_BOOSTER_ID = '1330928076133240957';
export const DISCORD_CORE_TEAM_ID = '1300099958757789758';

export class DiscordProviderImpl extends AbstractProvider<DiscordOauth2> {
  provider = AuthProvider.Discord;
  client: DiscordOauth2 | undefined;

  private getClient(redirect_uri?: string) {
    if (!this.client) {
      this.client = new DiscordOauth2({
        clientId: config.DISCORD_CLIENT_ID,
        clientSecret: config.DISCORD_CLIENT_SECRET,
        redirectUri: redirect_uri // TODO: are we confident this is actually needed at this stage? We don't need redirects now
      });
    }
    return this.client;
  }

  async signup(params: {
    authorization_code: string;
    redirect_uri?: string;
    preExistingUser?: DBUser;
  }): Promise<LoginResponse> {
    const { authorization_code, redirect_uri, preExistingUser } = params;

    // TODO: now suddenly this is failing again
    const tokenData: DiscordTokens = await this.getClient(redirect_uri).tokenRequest({
      code: authorization_code,
      scope: 'identify guilds.members.read',
      grantType: 'authorization_code'
    });

    const { access_token, refresh_token, expires_in } = tokenData;

    if (!refresh_token || !access_token || !expires_in) {
      throw new AuthorizationError(`Missing data in Discord token response`);
    }

    const userData: DiscordUser = await this.getClient(redirect_uri).getUser(access_token);

    let existingUser: DBUser;
    if (preExistingUser) {
      // user sent credentials from frontend, indicating they are already signed up, but with different provider
      existingUser = await UserDAO.update({ ...preExistingUser, discord_id: userData.id });
    } else {
      // either first time signing up ever, or new device
      existingUser =
        (await UserDAO.find({ discord_id: userData.id })) ??
        (await UserDAO.insert({
          friend_code: generateFriendCode(),
          discord_id: userData.id,
          external_id: uuid.v4(),
          name: 'New user',
          role: Roles.Default
        }));
    }

    const expiry_date = Date.now() + expires_in * 1000;

    return {
      name: existingUser.name,
      avatar: existingUser.avatar,
      friendCode: existingUser.friend_code,
      auth: {
        activeProvider: AuthProvider.Discord,
        tokens: {
          accessToken: access_token,
          expiryDate: expiry_date,
          refreshToken: refresh_token
        },
        linkedProviders: {
          [AuthProvider.Discord]: {
            linked: true,
            identifier: userData.username
          },
          [AuthProvider.Google]: {
            linked: !!existingUser.google_id
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

    const tokenData: DiscordTokens = await this.getClient(redirect_uri).tokenRequest({
      refreshToken: refresh_token,
      grantType: 'refresh_token',
      scope: ['identify', 'guilds.members.read']
    });

    const { access_token, expires_in } = tokenData;

    if (!access_token || !expires_in) {
      throw new AuthorizationError('Missing data in Discord refresh token response');
    }

    // Calculate expiry date in milliseconds
    const expiry_date = Date.now() + expires_in * 1000;

    return {
      access_token,
      expiry_date
    };
  }

  async unlink(user: DBUser): Promise<void> {
    await UserDAO.update({ ...user, discord_id: undefined });
  }

  async verifyExistingUser(userHeader: UserHeader): Promise<DBUser> {
    const userData: DiscordUser = await this.getClient(userHeader.Redirect).getUser(userHeader.Authorization);
    const user = await UserDAO.get({ discord_id: userData.id });
    return this.updateLastLogin(user);
  }

  async updateLastLogin(user: DBUser): Promise<DBUser> {
    return UserDAO.update({ ...user, last_login: new Date() });
  }
}

export const DiscordProvider = new DiscordProviderImpl();
