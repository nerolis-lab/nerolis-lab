import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

interface MockPatronMembership {
  patronStatus: string;
  pledgeRelationshipStart?: string;
}

interface MockPatronResponse {
  data: {
    id: string;
    attributes: {
      email: string;
    };
  };
  memberships: MockPatronMembership[];
}

const mockPatronData: Record<'active' | 'inactive', MockPatronResponse> = {
  active: {
    data: {
      id: 'mockPatreonId',
      attributes: {
        email: 'mock@patreon.com'
      }
    },
    memberships: [
      {
        patronStatus: 'active_patron',
        pledgeRelationshipStart: '2024-01-01T00:00:00.000Z'
      }
    ]
  },
  inactive: {
    data: {
      id: 'mockPatreonId',
      attributes: {
        email: 'mock@patreon.com'
      }
    },
    memberships: [
      {
        patronStatus: 'former_patron'
      }
    ]
  }
};

let currentPatronData = mockPatronData.active;

vi.mock('patreon-api.ts', () => {
  return {
    PatreonUserClient: vi.fn().mockImplementation(() => ({
      oauth: {
        getOauthTokenFromCode: vi.fn().mockResolvedValue({
          access_token: 'mockAccessToken',
          refresh_token: 'mockRefreshToken',
          expires_in_epoch: Date.now() + 3600000 // 1 hour from now
        }),
        refreshToken: vi.fn().mockResolvedValue({
          access_token: 'mockNewAccessToken',
          expires_in_epoch: Date.now() + 3600000
        })
      },
      fetchIdentity: vi.fn().mockImplementation(() => Promise.resolve(currentPatronData))
    })),
    QueryBuilder: {
      identity: {
        addRelationships: vi.fn().mockReturnThis(),
        setAttributes: vi.fn().mockReturnThis()
      }
    },
    PatreonOauthScope: {
      IdentityEmail: 'identity.email'
    },
    simplify: vi.fn().mockImplementation(() => ({
      memberships: currentPatronData.memberships
    }))
  };
});

describe('PatreonProvider', () => {
  beforeEach(() => {
    PatreonProvider.client = undefined;
    currentPatronData = mockPatronData.active;
  });

  it('should be defined', () => {
    expect(PatreonProvider).toBeDefined();
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
      expect(PatreonProvider.client).toBeUndefined();
      await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(PatreonProvider.client).toBeDefined();
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
      expect(user.auth.linkedProviders[AuthProvider.Patreon].identifier).toMatchInlineSnapshot(`"mock@patreon.com"`);
      expect(user.role).toBe(Roles.Supporter);

      const insertedUser = await UserDAO.findMultiple();
      expect(insertedUser).toHaveLength(1);
      expect(insertedUser[0].patreon_id).toBe('mockPatreonId');
      expect(insertedUser[0].role).toBe(Roles.Supporter);
    });

    it('should add patreon link to user if they already exist', async () => {
      const user: DBUser = mocks.dbUser({ discord_id: 'discord id' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.patreon_id).toBeUndefined();

      const updatedUser = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000',
        preExistingUser: user
      });
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Discord].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].identifier).toMatchInlineSnapshot(
        `"mock@patreon.com"`
      );
      expect(updatedUser.role).toBe(Roles.Supporter);

      const dbUser = await UserDAO.find({ id: user.id });
      expect(dbUser?.patreon_id).toMatchInlineSnapshot(`"mockPatreonId"`);
      expect(dbUser?.role).toBe(Roles.Supporter);
    });

    it('should set role to Default for non-active patrons during signup', async () => {
      currentPatronData = mockPatronData.inactive;

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
      const user: DBUser = mocks.dbUser({ patreon_id: 'mockPatreonId', external_id: uuid.v4() });
      await UserDAO.insert(user);

      const updatedUser = await PatreonProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(updatedUser.externalId).toEqual(user.external_id);
    });
  });

  describe('refresh', () => {
    it('should have a refresh method', () => {
      expect(PatreonProvider.refresh).toBeDefined();
    });

    it('should call getUserClient and create a client when calling refresh', async () => {
      expect(PatreonProvider.client).toBeUndefined();
      await PatreonProvider.refresh({
        refresh_token: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(PatreonProvider.client).toBeDefined();
    });

    it('should call Patreon to refresh the token', async () => {
      const refreshToken = '1234567890';
      const { access_token, expiry_date } = await PatreonProvider.refresh({
        refresh_token: refreshToken,
        redirect_uri: 'http://localhost:3000'
      });

      expect(access_token).toMatchInlineSnapshot(`"mockNewAccessToken"`);
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
      const initialDate = new Date();
      await UserDAO.insert(mocks.dbUser({ patreon_id: 'mockPatreonId', last_login: initialDate, role: Roles.Default }));
      await PatreonProvider.verifyExistingUser(mocks.userHeader({ Authorization: 'mockAccessToken' }));

      const updatedUser = await UserDAO.find({ patreon_id: 'mockPatreonId' });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
      expect(updatedUser?.role).toBe(Roles.Supporter);
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login date and role', async () => {
      const patreonId = 'mockPatreonId';
      await UserDAO.insert(mocks.dbUser({ patreon_id: patreonId, role: Roles.Default }));
      const initialDate = new Date();
      await PatreonProvider.updateLastLogin(patreonId, Roles.Supporter);

      const updatedUser = await UserDAO.find({ patreon_id: patreonId });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
      expect(updatedUser?.role).toBe(Roles.Supporter);
    });
  });

  describe('getPatronStatus', () => {
    it('should return supporter role for active patrons', async () => {
      const { role, patreon_id, identifier, patronSince } = await PatreonProvider.getPatronStatus({
        token: 'mockAccessToken',
        redirect_uri: 'http://localhost:3000'
      });

      expect(PatreonProvider.client?.fetchIdentity).toHaveBeenCalled();
      expect(role).toBe(Roles.Supporter);
      expect(patreon_id).toBe('mockPatreonId');
      expect(identifier).toBe('mock@patreon.com');
      expect(patronSince).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
