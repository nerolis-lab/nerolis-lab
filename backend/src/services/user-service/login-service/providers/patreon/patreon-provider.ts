import { config } from '@src/config/config.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';
import { PatreonOauthScope, PatreonUserClient, QueryBuilder, simplify } from 'patreon-api.ts';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';

export class PatreonProviderImpl extends AbstractProvider<PatreonUserClient> {
  provider = AuthProvider.Patreon;
  client: PatreonUserClient | undefined;

  private identityQuery = QueryBuilder.identity.addRelationships(['memberships', 'campaign']).setAttributes({
    member: ['patron_status', 'pledge_relationship_start', 'is_follower'],
    user: ['email']
    // campaign: ['creation_name']
  });

  async signup(params: {
    authorization_code: string;
    redirect_uri: string;
    preExistingUser?: DBUser;
  }): Promise<LoginResponse> {
    const { authorization_code, redirect_uri, preExistingUser } = params;
    const token = await this.getUserClient(redirect_uri).oauth.getOauthTokenFromCode({ code: authorization_code });

    if (!token) {
      throw new AuthorizationError('Failed to get Patreon tokens from authorization code');
    }

    const { access_token, refresh_token, expires_in_epoch } = token;

    const { patreon_id, identifier, userData } = await this.getPatronId({
      token: access_token,
      redirect_uri
    });

    const { role } = this.parsePatronStatus(userData, preExistingUser);

    const expiryDate = Number(expires_in_epoch);

    let existingUser: DBUser;
    if (preExistingUser) {
      // user sent credentials from frontend, indicating they are already signed up, but with different provider
      existingUser = await UserDAO.update({ ...preExistingUser, patreon_id, role });
    } else {
      // either first time signing up ever, or new device
      existingUser =
        (await UserDAO.find({ patreon_id })) ??
        (await UserDAO.insert({
          friend_code: generateFriendCode(),
          patreon_id,
          external_id: uuid.v4(),
          name: 'New user',
          role
        }));
    }

    return {
      name: existingUser.name,
      externalId: existingUser.external_id,
      auth: {
        tokens: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiryDate
        },
        activeProvider: AuthProvider.Patreon,
        linkedProviders: {
          [AuthProvider.Patreon]: {
            linked: true,
            identifier
          },
          [AuthProvider.Discord]: {
            linked: !!existingUser.discord_id
          },
          [AuthProvider.Google]: {
            linked: !!existingUser.google_id
          }
        }
      },
      friendCode: existingUser.friend_code,
      role: existingUser.role,
      avatar: existingUser.avatar
    };
  }
  async refresh(params: { refresh_token: string; redirect_uri: string }): Promise<RefreshResponse> {
    const { refresh_token, redirect_uri } = params;

    const token = await this.getUserClient(redirect_uri).oauth.refreshToken(refresh_token);

    return {
      access_token: token.access_token,
      expiry_date: Number(token.expires_in_epoch)
    };
  }

  async unlink(user: DBUser): Promise<void> {
    await UserDAO.update({ ...user, patreon_id: undefined });
  }

  async verifyExistingUser(userHeader: UserHeader): Promise<DBUser> {
    const { patreon_id, userData } = await this.getPatronId({
      token: userHeader.Authorization,
      redirect_uri: userHeader.Redirect
    });

    const user = await UserDAO.get({ patreon_id });
    const { role } = this.parsePatronStatus(userData, user);

    logger.info(`[${user?.name}] Verified existing user with patreon_id: ${patreon_id} and role: ${role}`);

    return this.updateLastLogin(user, role);
  }

  async updateLastLogin(user: DBUser, role: Roles): Promise<DBUser> {
    return UserDAO.update({ ...user, last_login: new Date(), role });
  }

  public async getPatronId(params: {
    token: string;
    redirect_uri: string;
    // TODO: set up a type for the patronData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<{ patreon_id: string; identifier: string; userData: any }> {
    const { token, redirect_uri } = params;
    try {
      logger.debug(`Calling getPatronId with redirect_uri: ${redirect_uri} and token: ${token}`);
      const userData = await this.getUserClient(redirect_uri).fetchIdentity(this.identityQuery, {
        token
      });

      if (!userData || !userData.data) {
        logger.error(`userData missing data: ${JSON.stringify(userData)}`);
        throw new AuthorizationError('Invalid response from Patreon API: missing user data');
      }

      return {
        patreon_id: userData.data.id,
        identifier: userData.data.attributes.email,
        userData: simplify(userData)
      };
    } catch (error) {
      logger.error(`getPatronId error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  // TODO: set up a type for the patronData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parsePatronStatus(userData: any, user?: DBUser): { role: Roles; patronSince?: string } {
    let patronSince: string | undefined;
    let role = user?.role ?? Roles.Default;

    logger.debug(`[${user?.name}] Called parsePatronStatus with userData: ${JSON.stringify(userData)}`);

    if (!userData.memberships) {
      logger.error(`userData missing memberships: ${JSON.stringify(userData)}`);
    } else if (userData.memberships.length > 0) {
      const membership = userData.memberships[0]; // Using direct index instead of .at(0)
      if (membership) {
        const { patronStatus, pledgeRelationshipStart } = membership;
        if (patronStatus === 'active_patron') {
          role = Roles.Supporter;
          patronSince = pledgeRelationshipStart!;
        }
      }
    }

    return { role, patronSince };
  }

  private getUserClient(redirect_uri: string) {
    if (!this.client) {
      this.client = new PatreonUserClient({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          redirectUri: redirect_uri,
          scopes: [PatreonOauthScope.IdentityEmail, PatreonOauthScope.Identity]
        }
      });
    }
    return this.client;
  }
}

export const PatreonProvider = new PatreonProviderImpl();
