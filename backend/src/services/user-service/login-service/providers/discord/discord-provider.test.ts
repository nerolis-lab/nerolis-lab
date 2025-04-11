import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { DiscordProvider } from '@src/services/user-service/login-service/providers/discord/discord-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { AuthProvider, uuid } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

vi.mock('discord-oauth2', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      tokenRequest: vi.fn().mockResolvedValue({
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
        expires_in: 3600
      }),
      getUser: vi.fn().mockResolvedValue({
        id: 'mockDiscordId',
        username: 'mockUsername',
        discriminator: '1234',
        avatar: 'mockAvatar'
      })
    }))
  };
});

describe('DiscordProvider', () => {
  beforeEach(() => {
    DiscordProvider.client = undefined;
  });

  it('should be defined', () => {
    expect(DiscordProvider).toBeDefined();
  });

  it('should have a provider', () => {
    expect(DiscordProvider.provider).toBe(AuthProvider.Discord);
  });

  it('should default client to undefined', () => {
    expect(DiscordProvider.client).toBeUndefined();
  });

  describe('signup', () => {
    it('should have a signup method', () => {
      expect(DiscordProvider.signup).toBeDefined();
    });

    it('should call getClient and create a client when calling signup', async () => {
      expect(DiscordProvider.client).toBeUndefined();
      await DiscordProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(DiscordProvider.client).toBeDefined();
    });

    it('should exchange authorization code for tokens and create a user if they do not exist', async () => {
      const user = await DiscordProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(user.name).toMatchInlineSnapshot(`"New user"`);
      expect(user.avatar).toBeUndefined();
      expect(user.friendCode).toMatch(/^[A-Z0-9]{6}$/);
      expect(user.auth.activeProvider).toBe(AuthProvider.Discord);
      expect(user.auth.tokens.accessToken).toMatchInlineSnapshot(`"mockAccessToken"`);
      expect(user.auth.tokens.refreshToken).toMatchInlineSnapshot(`"mockRefreshToken"`);
      expect(user.auth.tokens.expiryDate).toBeDefined();
      expect(user.auth.linkedProviders[AuthProvider.Discord].linked).toBe(true);
      expect(user.auth.linkedProviders[AuthProvider.Discord].identifier).toMatchInlineSnapshot(`"mockUsername"`);

      const insertedUser = await UserDAO.findMultiple();
      expect(insertedUser).toHaveLength(1);
      expect(insertedUser[0].discord_id).toBe('mockDiscordId');
    });

    it('should add discord link to user if they already exist', async () => {
      const user: DBUser = mocks.dbUser({ patreon_id: 'patreon id' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.discord_id).toBeUndefined();

      const updatedUser = await DiscordProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000',
        preExistingUser: user
      });
      expect(updatedUser.auth.linkedProviders[AuthProvider.Discord].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Patreon].linked).toBe(true);
      expect(updatedUser.auth.linkedProviders[AuthProvider.Discord].identifier).toMatchInlineSnapshot(`"mockUsername"`);

      expect((await UserDAO.find({ id: user.id }))?.discord_id).toMatchInlineSnapshot(`"mockDiscordId"`);
    });

    it('should return users that already exist', async () => {
      const user: DBUser = mocks.dbUser({ discord_id: 'mockDiscordId', external_id: uuid.v4() });
      await UserDAO.insert(user);

      const updatedUser = await DiscordProvider.signup({
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });

      expect(updatedUser.externalId).toEqual(user.external_id);
    });
  });

  describe('refresh', () => {
    it('should have a refresh method', () => {
      expect(DiscordProvider.refresh).toBeDefined();
    });

    it('should call getClient and create a client when calling refresh', async () => {
      expect(DiscordProvider.client).toBeUndefined();
      await DiscordProvider.refresh({
        refresh_token: '1234567890',
        redirect_uri: 'http://localhost:3000'
      });
      expect(DiscordProvider.client).toBeDefined();
    });

    it('should call Discord to refresh the token', async () => {
      const refreshToken = '1234567890';
      const { access_token, expiry_date } = await DiscordProvider.refresh({
        refresh_token: refreshToken,
        redirect_uri: 'http://localhost:3000'
      });

      expect(access_token).toMatchInlineSnapshot(`"mockAccessToken"`);
      expect(expiry_date).toBeDefined();
    });
  });

  describe('unlink', () => {
    it('should set discord_id to undefined when calling unlink with valid user', async () => {
      const user: DBUser = mocks.dbUser({ discord_id: 'mockDiscordId' });
      await UserDAO.insert(user);

      expect((await UserDAO.find({ id: user.id }))?.discord_id).toBeDefined();
      await DiscordProvider.unlink(user);
      expect((await UserDAO.find({ id: user.id }))?.discord_id).toBeUndefined();
    });
  });

  describe('verifyExistingUser', () => {
    it('should call Discord to verify the user and update the last login date', async () => {
      const initialDate = new Date();
      await UserDAO.insert(mocks.dbUser({ discord_id: 'mockDiscordId', last_login: initialDate }));
      await DiscordProvider.verifyExistingUser(mocks.userHeader({ Authorization: 'mockAccessToken' }));

      const updatedUser = await UserDAO.find({ discord_id: 'mockDiscordId' });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
    });
  });

  describe('updateLastLogin', () => {
    it('should update the last login date', async () => {
      const discordId = 'mockDiscordId';
      await UserDAO.insert(mocks.dbUser({ discord_id: discordId }));
      const initialDate = new Date();
      await DiscordProvider.updateLastLogin(discordId);

      const updatedUser = await UserDAO.find({ discord_id: discordId });
      expect(updatedUser?.last_login).not.toEqual(initialDate);
    });
  });
});
