import { config } from '@src/config/config.js';
import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import {
  client,
  deleteUser,
  getUserSettings,
  refresh,
  signup,
  updateUser,
  verifyAdmin,
  verifyExistingUser
} from '@src/services/user-service/login-service/login-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

uuid.v4 = vi.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
TimeUtils.getMySQLNow = vi.fn().mockReturnValue('2024-01-01 18:00:00');
vimic(global.logger, 'info');

describe('signup', () => {
  it('should call google API with correct credentials', async () => {
    client.getToken = vi.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    });
    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: {
        sub: 'some-sub',
        email: 'some-email'
      }
    });

    const loginResponse = await signup('some-auth-code');

    expect(await UserDAO.findMultiple()).toEqual([
      expect.objectContaining({
        avatar: undefined,
        external_id: '00000000-0000-0000-0000-000000000000',
        id: 1,
        name: 'New user',
        role: 'default',
        version: 1,
        sub: 'some-sub',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login: expect.any(Date)
      })
    ]);

    expect(loginResponse).toMatchInlineSnapshot(`
      {
        "access_token": "some-access-token",
        "avatar": undefined,
        "email": "some-email",
        "expiry_date": 10,
        "externalId": "00000000-0000-0000-0000-000000000000",
        "name": "New user",
        "refresh_token": "some-refresh-token",
        "role": "default",
      }
    `);
    expect(client.getToken).toHaveBeenCalledWith({ code: 'some-auth-code', redirect_uri: 'postmessage' });
    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: 'some-access-token' });
  });

  it('should throw an error if google response is missing tokens', async () => {
    client.getToken = vi.fn().mockResolvedValue({
      tokens: {}
    });

    await expect(() => signup('some-auth-code')).rejects.toThrow(AuthorizationError);
  });

  it('should handle existing user correctly', async () => {
    client.getToken = vi.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    });

    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: {
        sub: 'some-sub',
        email: 'some-email'
      }
    });

    await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Existing user',
      role: Roles.Default
    });

    const loginResponse = await signup('some-auth-code');

    expect(await UserDAO.findMultiple()).toEqual([
      expect.objectContaining({
        avatar: undefined,
        external_id: '00000000-0000-0000-0000-000000000000',
        id: 1,
        name: 'Existing user',
        friend_code: 'TESTFC',
        role: 'default',
        version: 1,
        sub: 'some-sub',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login: expect.any(Date)
      })
    ]);

    expect(loginResponse).toMatchInlineSnapshot(`
      {
        "access_token": "some-access-token",
        "avatar": undefined,
        "email": "some-email",
        "expiry_date": 10,
        "externalId": "00000000-0000-0000-0000-000000000000",
        "name": "Existing user",
        "refresh_token": "some-refresh-token",
        "role": "default",
      }
    `);
  });
});

describe('refresh', () => {
  it('should refresh the access token successfully', async () => {
    client.setCredentials = vi.fn();
    client.getAccessToken = vi.fn().mockResolvedValue({
      token: 'new-access-token'
    });
    client.credentials = {
      expiry_date: 10
    };

    const refreshResponse = await refresh('some-refresh-token');

    expect(refreshResponse).toMatchInlineSnapshot(`
{
  "access_token": "new-access-token",
  "expiry_date": 10,
}
`);

    expect(client.setCredentials).toHaveBeenCalledWith({ refresh_token: 'some-refresh-token' });
    expect(client.getAccessToken).toHaveBeenCalled();
  });

  it('should throw an error if Google API fails to provide a new access token', async () => {
    client.setCredentials = vi.fn();
    client.getAccessToken = vi.fn().mockResolvedValue({ token: null });
    client.credentials = {};

    await expect(() => refresh('some-refresh-token')).rejects.toThrow('Failed to refresh access token');
  });
});

describe('verify', () => {
  it('should verify the access token and return the correct user', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };
    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      sub: 'some-sub',
      role: Roles.Default
    });

    const user = await verifyExistingUser(accessToken);

    expect(user).toEqual(
      expect.objectContaining({
        avatar: undefined,
        external_id: '00000000-0000-0000-0000-000000000000',
        id: 1,
        name: 'Existing user',
        role: 'default',
        friend_code: 'TESTFC',
        version: 2,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login: expect.any(Date)
      })
    );

    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(client.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    });
  });

  it('should throw an error if token info does not match the expected client ID', async () => {
    const accessToken = 'invalid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: 'wrong-client-id'
    };

    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: userInfo
    });

    await expect(() => verifyExistingUser(accessToken)).rejects.toThrow('Token was not issued from this server');
  });

  it('should handle Google API request failure', async () => {
    const accessToken = 'valid-access-token';

    client.setCredentials = vi.fn();
    client.request = vi.fn().mockRejectedValue(new Error('Google API request failed'));

    await expect(() => verifyExistingUser(accessToken)).rejects.toThrow('Google API request failed');
  });

  it('should throw an error if user is not found in the database', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };

    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: userInfo
    });

    await expect(() => verifyExistingUser(accessToken)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[DatabaseNotFoundError: Unable to find entry in user with filter [{"sub":"some-sub"}]]`
    );
  });
});

describe('delete', () => {
  it('should delete user from database', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    expect((await UserDAO.findMultiple()).map((user) => user.id)).toEqual([1]);
    await deleteUser(user);

    expect(await UserDAO.findMultiple()).toEqual([]);
  });
});

describe('verifyAdmin', () => {
  it('should verify the access token and return the correct admin user', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };
    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Admin user',
      sub: 'some-sub',
      role: Roles.Admin
    });

    const user = await verifyAdmin(accessToken);

    expect(user).toEqual(
      expect.objectContaining({
        avatar: undefined,
        external_id: '00000000-0000-0000-0000-000000000000',
        id: 1,
        name: 'Admin user',
        role: 'admin',
        friend_code: 'TESTFC',
        version: 2,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login: expect.any(Date)
      })
    );

    expect(client.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(client.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    });
  });

  it('should throw an error if user is not an admin', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };
    client.setCredentials = vi.fn();
    client.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      name: 'Regular user',
      sub: 'some-sub',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    await expect(() => verifyAdmin(accessToken)).rejects.toThrow('User is not an admin');
  });
});

describe('updateUser', () => {
  it('should update user settings correctly', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    const updatedUser = await updateUser(user, { name: 'Updated user' });

    expect(updatedUser).toEqual(
      expect.objectContaining({
        avatar: undefined,
        external_id: '00000000-0000-0000-0000-000000000000',
        id: 1,
        name: 'Updated user',
        role: 'default',
        friend_code: 'TESTFC',
        version: 2,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        last_login: expect.any(Date)
      })
    );
  });
});

describe('getUserSettings', () => {
  it('should return user settings', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    const userSettings = await getUserSettings(user);

    expect(userSettings).toEqual(
      expect.objectContaining({
        name: 'Existing user',
        avatar: 'default',
        role: 'default',
        areaBonuses: {}
      })
    );
  });

  it('should return user settings with area bonuses', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    await UserAreaDAO.insert({
      fk_user_id: user.id,
      area: 'cyan',
      bonus: 75
    });

    const userSettings = await getUserSettings(user);

    expect(userSettings).toEqual(
      expect.objectContaining({
        areaBonuses: {
          cyan: 75
        }
      })
    );
  });
});
