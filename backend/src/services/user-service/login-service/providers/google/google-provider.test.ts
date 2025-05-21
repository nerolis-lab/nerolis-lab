import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { GoogleProvider } from '@src/services/user-service/login-service/providers/google/google-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { AuthProvider, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    getToken: vi.fn().mockResolvedValue({
      tokens: { access_token: 'mockAccessToken', refresh_token: 'mockRefreshToken', expiry_date: new Date() }
    }),
    request: vi.fn().mockResolvedValue({
      data: {
        sub: 'mockSub',
        email: 'mockEmail',
        given_name: 'mockGivenName',
        picture: 'mockPicture'
      }
    }),
    credentials: {
      access_token: 'mockAccessToken',
      refresh_token: 'mockRefreshToken',
      expiry_date: new Date()
    },
    getAccessToken: vi.fn().mockResolvedValue({
      token: 'mockAccessToken',
      expiry_date: new Date()
    }),
    setCredentials: vi.fn()
  }))
}));

describe('GoogleProvider', () => {
  beforeEach(() => {
    GoogleProvider.client = undefined;
  });

  it('should be defined', () => {
    expect(GoogleProvider).toBeDefined();
  });

  it('should have a provider', () => {
    expect(GoogleProvider.provider).toBe(AuthProvider.Google);
  });

  it('should default client to undefined', () => {
    expect(GoogleProvider.client).toBeUndefined();
  });

  describe('signup', () => {
    it('should have a signup method', () => {
      expect(GoogleProvider.signup).toBeDefined();
    });

    it('should call getClient and create a client when calling signup', async () => {
      expect(GoogleProvider.client).toBeUndefined();
      await GoogleProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(GoogleProvider.client).toBeDefined();
    });

    it('should exchange authorization code for tokens and create a user if they do not exist', async () => {
      const user = await GoogleProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(user.name).toMatchInlineSnapshot(`"New user"`);
      expect(user.avatar).toBeUndefined();
      expect(user.friendCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(user.auth.activeProvider).toBe(AuthProvider.Google);
      expect(user.auth.tokens.accessToken).toMatchInlineSnapshot(`"mockAccessToken"`);
      expect(user.auth.tokens.refreshToken).toMatchInlineSnapshot(`"mockRefreshToken"`);
      expect(user.auth.tokens.expiryDate).toBeInstanceOf(Date);
      expect(user.auth.linkedProviders[AuthProvider.Google].linked).toBe(true);
      expect(user.auth.linkedProviders[AuthProvider.Google].identifier).toMatchInlineSnapshot(`"mockEmail"`);

      const insertedUser = await UserDAO.findMultiple();
      expect(insertedUser).toHaveLength(1);
      expect(insertedUser[0].google_id).toBe('mockSub');
    });

    it('should add google link to user if they already exist', async () => {
      const user: DBUser = mocks.dbUser({ patreon_id: 'patreon id' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.google_id).toBeUndefined();

      const updatedUser = await GoogleProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000',
        preExistingUser: user
      });
      expect(updatedUser.auth.linkedProviders[AuthProvider.Google].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Google].identifier).toMatchInlineSnapshot(`"mockEmail"`);

      expect((await UserDAO.find({ id: user.id }))?.google_id).toMatchInlineSnapshot(`"mockSub"`);
    });

    it('should return users that already exist', async () => {
      const user: DBUser = mocks.dbUser({ google_id: 'mockSub', external_id: uuid.v4() });
      await UserDAO.insert(user);

      const updatedUser = await GoogleProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(updatedUser.externalId).toEqual(user.external_id);
    });
  });

  describe('refresh', () => {
    it('should have a refresh method', () => {
      expect(GoogleProvider.refresh).toBeDefined();
    });

    it('should call getClient and create a client when calling refresh', async () => {
      expect(GoogleProvider.client).toBeUndefined();
      await GoogleProvider.refresh({
        refresh_token: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(GoogleProvider.client).toBeDefined();
    });

    it('should call Google to refresh the token', async () => {
      const refreshToken = '1234567890';
      const { access_token, expiry_date } = await GoogleProvider.refresh({
        refresh_token: refreshToken,
        redirect_uri: 'http://localhost:3000'
      });

      expect(GoogleProvider.client?.setCredentials).toHaveBeenCalledWith({ refresh_token: refreshToken });
      expect(GoogleProvider.client?.getAccessToken).toHaveBeenCalled();

      expect(access_token).toMatchInlineSnapshot(`"mockAccessToken"`);
      expect(expiry_date).toBeInstanceOf(Date);
    });
  });

  describe('unlink', () => {
    it('should set google_id to undefined when calling unlink with valid user', async () => {
      const user: DBUser = mocks.dbUser({ google_id: 'ABUNZU EASTER EGG' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.google_id).toBeDefined();
      await GoogleProvider.unlink(user);
      expect((await UserDAO.find({ id: user.id }))?.google_id).toBeUndefined();
    });
  });

  describe('verifyExistingUser', () => {
    it('should call Google to verify the user and update the last login date', async () => {
      const initialDate = new Date();
      await UserDAO.insert(mocks.dbUser({ google_id: 'mockSub', last_login: initialDate }));
      await GoogleProvider.verifyExistingUser(mocks.userHeader({ Authorization: 'mockAccessToken' }));

      expect(GoogleProvider.client?.setCredentials).toHaveBeenCalledWith({ access_token: 'mockAccessToken' });
      expect(GoogleProvider.client?.request).toHaveBeenCalled();

      const updatedUser = await UserDAO.find({ google_id: 'mockSub' });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login date', async () => {
      const googleId = 'mockSub';
      const initialDate = new Date('2023-01-01T00:00:00.000Z');
      const user = await UserDAO.insert(mocks.dbUser({ google_id: googleId, last_login: initialDate }));

      const initialUser = await UserDAO.find({ google_id: googleId });
      expect(initialUser?.last_login).toEqual(initialDate);

      await GoogleProvider.updateLastLogin(user);

      const updatedUser = await UserDAO.find({ google_id: googleId });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
      expect(updatedUser?.last_login).toBeInstanceOf(Date);
    });
  });
});
