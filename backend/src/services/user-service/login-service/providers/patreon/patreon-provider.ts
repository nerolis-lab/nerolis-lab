import { config } from '@src/config/config.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { generateFriendCode } from '@src/services/user-service/login-service/login-utils.js';
import { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';

type PatreonMember = {
  relationships?: {
    user?: {
      data?: {
        id?: string;
      } | null;
    } | null;
  } | null;
  attributes: {
    patron_status: PatronStatus | null;
    pledge_relationship_start: string | null;
  };
};

type PatreonMembersResponse = {
  data: PatreonMember[];
  links?: {
    next?: string;
  };
};
import type { Patron, PatronStatus } from '@src/services/user-service/login-service/providers/patreon/patreon-types.js';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';

export class PatreonProviderImpl extends AbstractProvider {
  provider = AuthProvider.Patreon;
  client = undefined;

  private tokenUrl = 'https://www.patreon.com/api/oauth2/token';
  private identityUrl = 'https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email';
  private patronMembersUrl =
    // 12771188 is the campaign id for the Neroli's Lab campaign
    'https://www.patreon.com/api/oauth2/v2/campaigns/12771188/members?' +
    'include=user&fields%5Bmember%5D=patron_status,pledge_relationship_start&page%5Bcount%5D=1000';

  private patrons: Map<string, Patron> = new Map();
  private lastPatronsUpdate: number = 0;
  private readonly PATRONS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

  async signup(params: {
    authorization_code: string;
    redirect_uri: string;
    preExistingUser?: DBUser;
  }): Promise<LoginResponse> {
    const { authorization_code, redirect_uri, preExistingUser } = params;

    const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorization_code,
        redirect_uri: redirect_uri,
        client_id: config.PATREON_CLIENT_ID,
        client_secret: config.PATREON_CLIENT_SECRET
      })
    });

    if (!tokenResponse.ok) {
      throw new AuthorizationError(`Failed to exchange authorization code for tokens: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    const refresh_token = tokenData.refresh_token;
    const expires_in_epoch = String(Date.now() + tokenData.expires_in * 1000);

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
    const { refresh_token } = params;

    const tokenResponse = await fetch(this.tokenUrl, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: config.PATREON_CLIENT_ID,
        client_secret: config.PATREON_CLIENT_SECRET
      })
    });

    if (!tokenResponse.ok) {
      throw new AuthorizationError(`Failed to refresh token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    return {
      access_token: tokenData.access_token,
      expiry_date: Date.now() + tokenData.expires_in * 1000
    };
  }

  async unlink(user: DBUser): Promise<void> {
    const role = user.role === Roles.Supporter ? Roles.Default : user.role;
    await UserDAO.update({ ...user, patreon_id: undefined, role });
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
    const { token } = params;

    const identityResponse = await fetch(this.identityUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!identityResponse.ok) {
      throw new AuthorizationError(`Failed to fetch Patreon identity: ${identityResponse.status}`);
    }

    const identityData = await identityResponse.json();

    return {
      patreon_id: identityData.data.id,
      identifier: identityData.data.attributes.email
    };
  }

  public async isSupporter({ patreon_id, previousRole }: { patreon_id?: string; previousRole?: Roles }): Promise<{
    role: Roles;
    patronSince: string | null;
  }> {
    // default to admin or default
    let role: Roles = previousRole && previousRole !== Roles.Supporter ? previousRole : Roles.Default;

    // if patreon not linked return default if they were a supporter, otherwise return current role
    if (!patreon_id) return { role, patronSince: null };

    // update patrons cache and check if they are a supporter
    await this.getPatrons();
    const patron = this.patrons.get(patreon_id);

    if (!patron || patron.patronStatus !== 'active_patron') {
      return { role, patronSince: null };
    }

    if (role === Roles.Default) role = Roles.Supporter;

    return { role, patronSince: patron.pledgeRelationshipStart };
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
    let creatorAccessToken = config.PATREON_CREATOR_ACCESS_TOKEN;
    const refreshToken = config.PATREON_CREATOR_REFRESH_TOKEN;

    let response = await this.fetchPatronMembers(creatorAccessToken);

    if (!response) {
      // Some network error happened, return the current patrons
      return this.patrons;
    }

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && refreshToken) {
      const newAccessToken = await this.refreshCreatorToken(refreshToken);
      if (newAccessToken) {
        creatorAccessToken = newAccessToken;
        response = await this.fetchPatronMembers(creatorAccessToken);
        if (!response) {
          return this.patrons;
        }
      }
    }

    if (!response.ok) {
      console.error('Failed to fetch patron members:', response.status);
      return this.patrons;
    }

    // Process initial page
    const data = await response.json();
    this.processMembers(data.data);

    // Handle pagination
    await this.processPaginatedMembers(data.links?.next, creatorAccessToken);

    return this.patrons;
  }

  private async fetchPatronMembers(accessToken: string): Promise<Response | null> {
    try {
      return await fetch(this.patronMembersUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Network error fetching patron members:', error);
      return null;
    }
  }

  private async refreshCreatorToken(refreshToken: string): Promise<string | null> {
    try {
      const tokenResponse = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.PATREON_CLIENT_ID,
          client_secret: config.PATREON_CLIENT_SECRET
        })
      });

      if (!tokenResponse.ok) {
        console.error('Failed to refresh creator token:', tokenResponse.status);
        return null;
      }

      const newToken = await tokenResponse.json();

      console.log('Creator access token was refreshed. Update stored credentials securely.');

      return newToken.access_token;
    } catch (error) {
      console.error('Network error refreshing creator token:', error);
      return null;
    }
  }

  private processMembers(members: PatreonMember[]): void {
    for (const member of members) {
      const userId = member.relationships?.user?.data?.id;
      if (userId) {
        this.patrons.set(userId, {
          id: userId,
          patronStatus: member.attributes.patron_status,
          pledgeRelationshipStart: member.attributes.pledge_relationship_start
        });
      }
    }
  }

  private async processPaginatedMembers(nextUrl: string | undefined, accessToken: string): Promise<void> {
    while (nextUrl) {
      try {
        const response = await fetch(nextUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch paginated members:', response.status);
          break;
        }

        const data: PatreonMembersResponse = await response.json();
        this.processMembers(data.data);
        nextUrl = data.links?.next;
      } catch (error) {
        console.error('Network error fetching paginated members:', error);
        break;
      }
    }
  }
}

export const PatreonProvider = new PatreonProviderImpl();
