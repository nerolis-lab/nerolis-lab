import { config } from '@src/config/config.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import * as PatreonAPI from 'patreon-api.ts';
import { AuthProvider, Roles } from 'sleepapi-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

vi.mock('patreon-api.ts', async () => {
  const actual = await vi.importActual('patreon-api.ts');
  return {
    ...actual,
    PatreonUserClient: vi.fn(),
    PatreonCreatorClient: vi.fn(),
    simplify: vi.fn()
  };
});

vi.mock('@src/config/config.js', async () => ({
  config: {
    PATREON_CLIENT_ID: 'mockPatreonClientId',
    PATREON_CLIENT_SECRET: 'mockPatreonClientSecret',
    PATREON_CREATOR_ACCESS_TOKEN: 'mockPatreonAccessToken',
    PATREON_CREATOR_REFRESH_TOKEN: 'mockPatreonRefreshToken'
  }
}));

const MOCK_SUPPORTING_USER_ID = 'supporting-user-id';
const MOCK_SUPPORTING_USER_EMAIL = 'supporting-user@patreon.com';
const MOCK_NON_SUPPORTING_USER_ID = 'non-supporting-user-id';
const MOCK_NON_SUPPORTING_USER_EMAIL = 'non-supporting-user@patreon.com';

describe('PatreonProvider', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(PatreonAPI.simplify).mockImplementation((data: any) => data);
  });

  afterEach(() => {
    process.env = {};
    resetPatreonProvider();

    vi.clearAllMocks();
  });

  it('should have a provider', () => {
    expect(PatreonProvider.provider).toBe(AuthProvider.Patreon);
  });

  it('should default client to undefined', () => {
    expect(PatreonProvider.client).toBeUndefined();
  });

  describe('signup', () => {
    it('should have a signup method', () => {
      expect(PatreonProvider.signup).toBeDefined();
    });

    it('should call getUserClient and create a client when calling signup', async () => {
      mockUserClient({});
      mockCreatorClient();
      const redirect_uri = 'http://localhost:3000';

      const { auth, role } = await PatreonProvider.signup({
        authorization_code: 'some-authorization-code',
        redirect_uri
      });

      // assert token exchange
      expect(PatreonAPI.PatreonUserClient).toHaveBeenCalledWith({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          redirectUri: redirect_uri,
          scopes: [PatreonAPI.PatreonOauthScope.Identity, PatreonAPI.PatreonOauthScope.IdentityEmail]
        }
      });
      expect(mockedUserClient.oauth.getOauthTokenFromCode).toHaveBeenCalledWith({
        code: 'some-authorization-code'
      });

      // assert user was identified
      expect(mockedUserClient.fetchIdentity).toHaveBeenCalledWith(
        PatreonAPI.QueryBuilder.identity.setAttributes({
          user: ['email']
        }),
        {
          token: 'mockAccessToken'
        }
      );

      // assert campaign members were fetched
      expect(mockedCreatorClient.fetchCampaignMembers).toHaveBeenCalledWith(
        '12771188', // neroli campaign id
        PatreonAPI.QueryBuilder.campaignMembers
          .addRelationships(['user'])
          .setAttributes({
            member: ['patron_status', 'pledge_relationship_start']
          })
          .setRequestOptions({ count: 1000 })
      );

      // assert result
      expect(auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(auth.linkedProviders[AuthProvider.Patreon].identifier).toMatchInlineSnapshot(
        `"non-supporting-user@patreon.com"`
      );
      expect(role).toBe(Roles.Default);
    });

    it('should exchange authorization code for tokens and create a user if they do not exist', async () => {
      const user = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(user.name).toMatchInlineSnapshot(`"New user"`);
      expect(user.avatar).toBeUndefined();
      expect(user.friendCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(user.auth.activeProvider).toBe(AuthProvider.Patreon);
      expect(user.auth.tokens.accessToken).toMatchInlineSnapshot(`"mockAccessToken"`);
      expect(user.auth.tokens.refreshToken).toMatchInlineSnapshot(`"mockRefreshToken"`);
      expect(user.auth.tokens.expiryDate).toBeDefined();
      expect(user.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(user.auth.linkedProviders[AuthProvider.Patreon].identifier).toMatchInlineSnapshot(
        `"non-supporting-user@patreon.com"`
      );
      expect(user.role).toBe(Roles.Default);

      const insertedUser = await UserDAO.findMultiple();
      expect(insertedUser).toHaveLength(1);
      expect(insertedUser[0].patreon_id).toBe('non-supporting-user-id');
      expect(insertedUser[0].role).toBe(Roles.Default);
    });

    it('should add patreon link to user if they already exist', async () => {
      const accessToken = 'mockAccessToken';
      mockUserClient({ access_token: accessToken });
      mockCreatorClient();
      const user: DBUser = mocks.dbUser({ discord_id: 'discord id' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.patreon_id).toBeUndefined();

      const updatedUser = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000',
        preExistingUser: user
      });

      // Verify client setup and token exchange
      expect(PatreonAPI.PatreonUserClient).toHaveBeenCalledWith({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          redirectUri: 'http://localhost:3000',
          scopes: [PatreonAPI.PatreonOauthScope.Identity, PatreonAPI.PatreonOauthScope.IdentityEmail]
        }
      });

      expect(mockedUserClient.oauth.getOauthTokenFromCode).toHaveBeenCalledWith({
        code: '1234567890'
      });

      // Verify user was identified
      expect(mockedUserClient.fetchIdentity).toHaveBeenCalledWith(
        PatreonAPI.QueryBuilder.identity.setAttributes({
          user: ['email']
        }),
        {
          token: accessToken
        }
      );

      // Verify result
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Discord].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].identifier).toBe(MOCK_NON_SUPPORTING_USER_EMAIL);
      expect(updatedUser.role).toBe(Roles.Default);

      const dbUser = await UserDAO.find({ id: user.id });
      expect(dbUser?.patreon_id).toBe(MOCK_NON_SUPPORTING_USER_ID);
      expect(dbUser?.role).toBe(Roles.Default);
    });

    it('should set role to Default for non-active patrons during signup', async () => {
      const user = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(user.role).toBe(Roles.Default);
      expect(user.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);

      const insertedUser = await UserDAO.findMultiple();
      expect(insertedUser).toHaveLength(1);
      expect(insertedUser[0].role).toBe(Roles.Default);
    });

    it('should return users that already exist', async () => {
      mockUserClient({});
      mockCreatorClient();
      const user = await UserDAO.insert(
        mocks.dbUser({
          patreon_id: MOCK_NON_SUPPORTING_USER_ID,
          external_id: 'test-external-id'
        })
      );

      const updatedUser = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(updatedUser.externalId).toEqual(user.external_id);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].identifier).toBe(MOCK_NON_SUPPORTING_USER_EMAIL);
    });
  });

  describe('refresh', () => {
    it('should have a refresh method', () => {
      expect(PatreonProvider.refresh).toBeDefined();
    });

    it('should call getUserClient and create a client when calling refresh', async () => {
      mockUserClient({});
      const refresh_token = '1234567890';
      const redirect_uri = 'http://localhost:3000';

      await PatreonProvider.refresh({
        refresh_token,
        redirect_uri
      });

      expect(PatreonAPI.PatreonUserClient).toHaveBeenCalledWith({
        oauth: {
          clientId: config.PATREON_CLIENT_ID,
          clientSecret: config.PATREON_CLIENT_SECRET,
          redirectUri: redirect_uri,
          scopes: [PatreonAPI.PatreonOauthScope.Identity, PatreonAPI.PatreonOauthScope.IdentityEmail]
        }
      });

      expect(mockedUserClient.oauth.refreshToken).toHaveBeenCalledWith(refresh_token);
    });

    it('should call Patreon to refresh the token', async () => {
      mockUserClient({});
      const refreshToken = '1234567890';
      const { access_token, expiry_date } = await PatreonProvider.refresh({
        refresh_token: refreshToken,
        redirect_uri: 'http://localhost:3000'
      });

      expect(access_token).toBe('mockNewAccessToken');
      expect(expiry_date).toBeDefined();
    });
  });

  describe('unlink', () => {
    it('should set patreon_id to undefined when calling unlink with valid user', async () => {
      const user: DBUser = mocks.dbUser({ patreon_id: 'mockPatreonId' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.patreon_id).toBeDefined();
      await PatreonProvider.unlink(user);
      expect((await UserDAO.find({ id: user.id }))?.patreon_id).toBeUndefined();
    });
  });

  describe('verifyExistingUser', () => {
    it('should call Patreon to verify the user and update the last login date and role', async () => {
      mockUserClient({
        id: MOCK_SUPPORTING_USER_ID,
        email: MOCK_SUPPORTING_USER_EMAIL
      });
      mockCreatorClient();
      const initialDate = new Date();

      // Create a user that matches what our mocked client will return
      await UserDAO.insert(
        mocks.dbUser({
          patreon_id: MOCK_SUPPORTING_USER_ID,
          last_login: initialDate,
          role: Roles.Default
        })
      );

      await PatreonProvider.verifyExistingUser(
        mocks.userHeader({
          Authorization: 'mockAccessToken',
          Redirect: 'http://localhost:3000'
        })
      );

      // Verify identity was fetched
      expect(mockedUserClient.fetchIdentity).toHaveBeenCalledWith(
        PatreonAPI.QueryBuilder.identity.setAttributes({
          user: ['email']
        }),
        {
          token: 'mockAccessToken'
        }
      );

      // Verify campaign members were checked
      expect(mockedCreatorClient.fetchCampaignMembers).toHaveBeenCalledWith(
        '12771188',
        PatreonAPI.QueryBuilder.campaignMembers
          .addRelationships(['user'])
          .setAttributes({
            member: ['patron_status', 'pledge_relationship_start']
          })
          .setRequestOptions({ count: 1000 })
      );

      // Verify user was updated
      const updatedUser = await UserDAO.find({ patreon_id: MOCK_SUPPORTING_USER_ID });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
      expect(updatedUser?.role).toBe(Roles.Supporter);
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login date and role', async () => {
      const patreonId = 'mockPatreonId';
      const user = await UserDAO.insert(mocks.dbUser({ patreon_id: patreonId, role: Roles.Default }));
      const initialDate = new Date();
      await PatreonProvider.updateLastLogin(user, Roles.Supporter);

      const updatedUser = await UserDAO.find({ patreon_id: patreonId });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
      expect(updatedUser?.role).toBe(Roles.Supporter);
    });
  });

  describe('isSupporter', () => {
    it('should return supporter role for active patrons', async () => {
      mockCreatorClient();
      const { role, patronSince } = await PatreonProvider.isSupporter({
        patreon_id: MOCK_SUPPORTING_USER_ID
      });

      expect(mockedCreatorClient.fetchCampaignMembers).toHaveBeenCalledWith(
        '12771188',
        PatreonAPI.QueryBuilder.campaignMembers
          .addRelationships(['user'])
          .setAttributes({
            member: ['patron_status', 'pledge_relationship_start']
          })
          .setRequestOptions({ count: 1000 })
      );

      expect(role).toBe(Roles.Supporter);
      expect(patronSince).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('getPatronId', () => {
    it('should return the patron id', async () => {
      mockUserClient({
        id: MOCK_SUPPORTING_USER_ID,
        email: MOCK_SUPPORTING_USER_EMAIL
      });

      const { patreon_id, identifier } = await PatreonProvider.getPatronId({
        token: 'mockAccessToken',
        redirect_uri: 'http://localhost:3000'
      });

      expect(mockedUserClient.fetchIdentity).toHaveBeenCalledWith(
        PatreonAPI.QueryBuilder.identity.setAttributes({
          user: ['email']
        }),
        {
          token: 'mockAccessToken'
        }
      );

      expect(patreon_id).toBe(MOCK_SUPPORTING_USER_ID);
      expect(identifier).toBe(MOCK_SUPPORTING_USER_EMAIL);
    });
  });
});

let mockedUserClient: PatreonAPI.PatreonUserClient;
function mockUserClient(params: {
  access_token?: string;
  refresh_token?: string;
  expires_in_epoch?: string;
  id?: string;
  email?: string;
}) {
  const {
    access_token = 'mockAccessToken',
    refresh_token = 'mockRefreshToken',
    expires_in_epoch = new Date().getTime() + 1000 * 60 * 60,
    id = MOCK_NON_SUPPORTING_USER_ID,
    email = MOCK_NON_SUPPORTING_USER_EMAIL
  } = params;

  mockedUserClient = {
    oauth: {
      getOauthTokenFromCode: vi.fn().mockResolvedValue({
        access_token,
        refresh_token,
        expires_in_epoch
      }),
      refreshToken: vi.fn().mockResolvedValue({
        access_token: 'mockNewAccessToken',
        expires_in_epoch: new Date().getTime() + 1000 * 60 * 60
      })
    },
    fetchIdentity: vi.fn().mockResolvedValue({
      id,
      email
    })
  } as unknown as PatreonAPI.PatreonUserClient;

  vi.mocked(PatreonAPI.PatreonUserClient).mockImplementation(() => mockedUserClient);
}

let mockedCreatorClient: PatreonAPI.PatreonCreatorClient;
function mockCreatorClient() {
  mockedCreatorClient = {
    fetchCampaignMembers: vi.fn().mockResolvedValue({
      data: [
        {
          user: {
            id: MOCK_SUPPORTING_USER_ID,
            email: MOCK_SUPPORTING_USER_EMAIL
          },
          patronStatus: 'active_patron',
          pledgeRelationshipStart: '2024-01-01T00:00:00.000Z'
        },
        {
          user: {
            id: MOCK_NON_SUPPORTING_USER_ID,
            email: MOCK_NON_SUPPORTING_USER_EMAIL
          },
          patronStatus: null,
          pledgeRelationshipStart: undefined
        }
      ]
    })
  } as unknown as PatreonAPI.PatreonCreatorClient;

  vi.mocked(PatreonAPI.PatreonCreatorClient).mockImplementation(() => mockedCreatorClient);
}

function resetPatreonProvider() {
  PatreonProvider.client = undefined;
  PatreonProvider.creatorClient = undefined;
  // @ts-expect-error accessing private field for testing
  PatreonProvider.patrons = new Map();
  // @ts-expect-error accessing private field for testing
  PatreonProvider.lastPatronsUpdate = 0;
}
