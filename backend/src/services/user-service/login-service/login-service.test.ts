import { config } from '@src/config/config.js';
import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import {
  deleteUser,
  getUserSettings,
  googleClient,
  refresh,
  signup,
  updateUser,
  upsertUserSettings,
  verifyAdmin,
  verifyExistingUser
} from '@src/services/user-service/login-service/login-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { AuthProvider, commonMocks, MIN_POT_SIZE, Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

uuid.v4 = vi.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
TimeUtils.getMySQLNow = vi.fn().mockReturnValue('2024-01-01 18:00:00');
vimic(global.logger, 'info');

describe('signup', () => {
  it('should call google API with correct credentials', async () => {
    googleClient.getToken = vi.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    });
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
      data: {
        sub: 'some-sub',
        email: 'some-email'
      }
    });

    const loginResponse = await signup({ provider: AuthProvider.Google, authorization_code: 'some-auth-code' });

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

    expect(loginResponse).toEqual({
      auth: {
        activeProvider: 'google',
        linkedProviders: {
          google: {
            identifier: 'some-email',
            linked: true
          },
          discord: {
            linked: false
          }
        },
        tokens: {
          accessToken: 'some-access-token',
          expiryDate: 10,
          refreshToken: 'some-refresh-token'
        }
      },
      avatar: undefined,
      externalId: '00000000-0000-0000-0000-000000000000',
      friendCode: expect.any(String),
      name: 'New user',
      role: 'default'
    });
    expect(googleClient.getToken).toHaveBeenCalledWith({ code: 'some-auth-code', redirect_uri: 'postmessage' });
    expect(googleClient.setCredentials).toHaveBeenCalledWith({ access_token: 'some-access-token' });
  });

  it('should throw an error if google response is missing tokens', async () => {
    googleClient.getToken = vi.fn().mockResolvedValue({
      tokens: {}
    });

    await expect(() => signup({ provider: AuthProvider.Google, authorization_code: 'some-auth-code' })).rejects.toThrow(
      AuthorizationError
    );
  });

  it('should handle existing user correctly', async () => {
    googleClient.getToken = vi.fn().mockResolvedValue({
      tokens: {
        refresh_token: 'some-refresh-token',
        access_token: 'some-access-token',
        expiry_date: 10
      }
    });

    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
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

    const loginResponse = await signup({ provider: AuthProvider.Google, authorization_code: 'some-auth-code' });

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
        "auth": {
          "activeProvider": "google",
          "linkedProviders": {
            "discord": {
              "linked": false,
            },
            "google": {
              "identifier": "some-email",
              "linked": true,
            },
          },
          "tokens": {
            "accessToken": "some-access-token",
            "expiryDate": 10,
            "refreshToken": "some-refresh-token",
          },
        },
        "avatar": undefined,
        "externalId": "00000000-0000-0000-0000-000000000000",
        "friendCode": "TESTFC",
        "name": "Existing user",
        "role": "default",
      }
    `);
  });
});

describe('refresh', () => {
  it('should refresh the access token successfully', async () => {
    googleClient.setCredentials = vi.fn();
    googleClient.getAccessToken = vi.fn().mockResolvedValue({
      token: 'new-access-token'
    });
    googleClient.credentials = {
      expiry_date: 10
    };

    const refreshResponse = await refresh({ provider: AuthProvider.Google, refresh_token: 'some-refresh-token' });

    expect(refreshResponse).toMatchInlineSnapshot(`
{
  "access_token": "new-access-token",
  "expiry_date": 10,
}
`);

    expect(googleClient.setCredentials).toHaveBeenCalledWith({ refresh_token: 'some-refresh-token' });
    expect(googleClient.getAccessToken).toHaveBeenCalled();
  });

  it('should throw an error if Google API fails to provide a new access token', async () => {
    googleClient.setCredentials = vi.fn();
    googleClient.getAccessToken = vi.fn().mockResolvedValue({ token: null });
    googleClient.credentials = {};

    await expect(() => refresh({ provider: AuthProvider.Google, refresh_token: 'some-refresh-token' })).rejects.toThrow(
      'Failed to refresh Google access token'
    );
  });
});

describe('verify', () => {
  it('should verify the access token and return the correct user', async () => {
    const accessToken = 'valid-access-token';
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      sub: 'some-sub',
      role: Roles.Default
    });

    const user = await verifyExistingUser(commonMocks.userHeader({ Authorization: accessToken }));

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

    expect(googleClient.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(googleClient.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    });
  });

  it('should throw an error if token info does not match the expected client ID', async () => {
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn();

    await expect(() => verifyExistingUser(commonMocks.userHeader())).rejects.toThrow(
      'Missing sub in Google token info response'
    );
  });

  it('should handle Google API request failure', async () => {
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockRejectedValue(new Error('Google API request failed'));

    await expect(() => verifyExistingUser(commonMocks.userHeader())).rejects.toThrow('Google API request failed');
  });

  it('should throw an error if user is not found in the database', async () => {
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };

    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
      data: userInfo
    });

    await expect(() => verifyExistingUser(commonMocks.userHeader())).rejects.toThrowErrorMatchingInlineSnapshot(
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
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Admin user',
      sub: 'some-sub',
      role: Roles.Admin
    });

    const user = await verifyAdmin(commonMocks.userHeader({ Authorization: accessToken }));

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

    expect(googleClient.setCredentials).toHaveBeenCalledWith({ access_token: accessToken });
    expect(googleClient.request).toHaveBeenCalledWith({
      url: `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
    });
  });

  it('should throw an error if user is not an admin', async () => {
    const userInfo = {
      sub: 'some-sub',
      aud: config.GOOGLE_CLIENT_ID
    };
    googleClient.setCredentials = vi.fn();
    googleClient.request = vi.fn().mockResolvedValue({
      data: userInfo
    });
    await UserDAO.insert({
      external_id: uuid.v4(),
      name: 'Regular user',
      sub: 'some-sub',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    await expect(() => verifyAdmin(commonMocks.userHeader())).rejects.toThrow('User is not an admin');
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

    await UserSettingsDAO.insert({
      fk_user_id: user.id,
      pot_size: MIN_POT_SIZE
    });

    const userSettings = await getUserSettings(user, commonMocks.userHeader());

    expect(userSettings).toEqual(
      expect.objectContaining({
        name: 'Existing user',
        avatar: 'default',
        role: 'default',
        areaBonuses: {},
        potSize: MIN_POT_SIZE
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

    await UserSettingsDAO.insert({
      fk_user_id: user.id,
      pot_size: MIN_POT_SIZE
    });

    await UserAreaDAO.insert({
      fk_user_id: user.id,
      area: 'cyan',
      bonus: 75
    });

    const userSettings = await getUserSettings(user, commonMocks.userHeader());

    expect(userSettings).toEqual(
      expect.objectContaining({
        areaBonuses: {
          cyan: 75
        }
      })
    );
  });
});

describe('upsertUserSettings', () => {
  it('should insert user settings when they do not exist', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    expect(await UserSettingsDAO.findMultiple()).toEqual([]);

    await upsertUserSettings(user, 2000);

    const settings = await UserSettingsDAO.findMultiple();
    expect(settings).toHaveLength(1);
    expect(settings[0]).toEqual(
      expect.objectContaining({
        fk_user_id: user.id,
        pot_size: 2000
      })
    );
  });

  it('should update user settings when they already exist', async () => {
    const user = await UserDAO.insert({
      sub: 'some-sub',
      external_id: uuid.v4(),
      name: 'Existing user',
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    await UserSettingsDAO.insert({
      fk_user_id: user.id,
      pot_size: MIN_POT_SIZE
    });

    let settings = await UserSettingsDAO.findMultiple();
    expect(settings).toHaveLength(1);
    expect(settings[0].pot_size).toBe(MIN_POT_SIZE);

    const newPotSize = 3000;
    await upsertUserSettings(user, newPotSize);

    settings = await UserSettingsDAO.findMultiple();
    expect(settings).toHaveLength(1);
    expect(settings[0]).toEqual(
      expect.objectContaining({
        fk_user_id: user.id,
        pot_size: newPotSize
      })
    );
  });

  it('should handle multiple users with different settings', async () => {
    uuid.v4 = vi
      .fn()
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000001')
      .mockReturnValueOnce('00000000-0000-0000-0000-000000000002');

    const user1 = await UserDAO.insert({
      sub: 'user1-sub',
      external_id: uuid.v4(),
      name: 'User One',
      friend_code: 'TEST01',
      role: Roles.Default
    });

    const user2 = await UserDAO.insert({
      sub: 'user2-sub',
      external_id: uuid.v4(),
      name: 'User Two',
      friend_code: 'TEST02',
      role: Roles.Default
    });

    await upsertUserSettings(user1, 2000);
    await upsertUserSettings(user2, 3000);

    const settings = await UserSettingsDAO.findMultiple();
    expect(settings).toHaveLength(2);

    const user1Settings = settings.find((s) => s.fk_user_id === user1.id);
    const user2Settings = settings.find((s) => s.fk_user_id === user2.id);

    expect(user1Settings).toEqual(
      expect.objectContaining({
        fk_user_id: user1.id,
        pot_size: 2000
      })
    );

    expect(user2Settings).toEqual(
      expect.objectContaining({
        fk_user_id: user2.id,
        pot_size: 3000
      })
    );
  });
});
