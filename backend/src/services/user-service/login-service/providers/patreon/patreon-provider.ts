import { config } from '@src/config/config.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';
import type { Patron } from '@src/services/user-service/login-service/providers/patreon/patreon-types.js';
import { PatreonCreatorClient, PatreonOauthScope, PatreonUserClient, QueryBuilder, simplify } from 'patreon-api.ts';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';

export class PatreonProviderImpl extends AbstractProvider<PatreonUserClient> {
  provider = AuthProvider.Patreon;
  client: PatreonUserClient | undefined;
  creatorClient: PatreonCreatorClient | undefined;

  private patrons: Map<string, Patron> = new Map();
  private lastPatronsUpdate: number = 0;
  private readonly PATRONS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly NEROLI_CAMPAIGN_ID = '12771188';

  private identityQuery = QueryBuilder.identity.setAttributes({
    user: ['email']
  });

  // can add currently_entitled_tiers to addRelationships to find which tier the user is in
  private memberQuery = QueryBuilder.campaignMembers
    .addRelationships(['user']) // needed so we can grab id to compare with patreon_id
    .setAttributes({
      member: ['patron_status', 'pledge_relationship_start']
    })
    .setRequestOptions({ count: 1000 });

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

    const { patreon_id, identifier } = await this.getPatronId({
      token: access_token,
      redirect_uri
    });

    const { role } = await this.isSupporter({ patreon_id, previousRole: preExistingUser?.role });

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
    const { patreon_id } = await this.getPatronId({
      token: userHeader.Authorization,
      redirect_uri: userHeader.Redirect
    });

    const user = await UserDAO.get({ patreon_id });
    const { role } = await this.isSupporter({ patreon_id, previousRole: user.role });

    return this.updateLastLogin(user, role);
  }

  async updateLastLogin(user: DBUser, role: Roles): Promise<DBUser> {
    return UserDAO.update({ ...user, last_login: new Date(), role });
  }

  public async getPatronId(params: {
    token: string;
    redirect_uri: string;
  }): Promise<{ patreon_id: string; identifier: string }> {
    const { token, redirect_uri } = params;
    const userData = simplify(
      await this.getUserClient(redirect_uri).fetchIdentity(this.identityQuery, {
        token
      })
    );

    return {
      patreon_id: userData.id,
      identifier: userData.email
    };
  }

  public async isSupporter(params: { patreon_id: string; previousRole?: Roles }): Promise<{
    role: Roles;
    patronSince: string | null;
  }> {
    const { patreon_id, previousRole } = params;
    let patronSince: string | null = null;
    let role = previousRole ?? Roles.Default;

    await this.getPatrons();
    const patron = this.patrons.get(patreon_id);

    if (patron) {
      const { patronStatus, pledgeRelationshipStart } = patron;
      if (patronStatus === 'active_patron') {
        // if user was default, we upgrade to supporter, but we dont downgrade admins
        role = role === Roles.Default ? Roles.Supporter : role;
        patronSince = pledgeRelationshipStart;
      }
    }

    return { role, patronSince };
  }

  private async getPatrons(): Promise<Map<string, Patron>> {
    const now = Date.now();
    if (this.patrons.size === 0 || now - this.lastPatronsUpdate > this.PATRONS_CACHE_TTL_MS) {
      await this.updatePatrons();
      this.lastPatronsUpdate = now;
    }
    return this.patrons;
  }

  private async updatePatrons(): Promise<Map<string, Patron>> {
    const memberData = simplify(
      await this.getCreatorClient().fetchCampaignMembers(this.NEROLI_CAMPAIGN_ID, this.memberQuery)
    ).data;

    for (const member of memberData) {
      this.patrons.set(member.user.id, {
        id: member.user.id,
        patronStatus: member.patronStatus,
        pledgeRelationshipStart: member.pledgeRelationshipStart
      });
    }
    return this.patrons;
  }

  private getUserClient(redirect_uri: string) {
    if (!this.client) {
      this.client = new PatreonUserClient({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          redirectUri: redirect_uri,
          scopes: [PatreonOauthScope.Identity, PatreonOauthScope.IdentityEmail]
        }
      });
    }
    return this.client;
  }

  private getCreatorClient(): PatreonCreatorClient {
    if (!this.creatorClient) {
      this.creatorClient = new PatreonCreatorClient({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          token: {
            access_token: config.PATREON_CREATOR_ACCESS_TOKEN,
            refresh_token: config.PATREON_CREATOR_REFRESH_TOKEN
          }
        }
      });
    }
    return this.creatorClient;
  }
}

export const PatreonProvider = new PatreonProviderImpl();
