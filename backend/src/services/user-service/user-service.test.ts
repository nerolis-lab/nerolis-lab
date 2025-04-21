import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { UpdateUserRequest, UserHeader } from 'sleepapi-common';
import { AuthProvider, MAX_POT_SIZE, Roles, uuid, type IslandShortName } from 'sleepapi-common';
import { deleteUser, getUserSettings, updateUser, upsertUserSettings } from './user-service.js';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

uuid.v4 = vi.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
TimeUtils.getMySQLNow = vi.fn().mockReturnValue('2024-01-01 18:00:00');

vi.mock('@src/services/user-service/login-service/providers/patreon/patreon-provider.js', () => ({
  PatreonProvider: {
    getPatronStatus: vi.fn()
  }
}));

describe('updateUser', () => {
  it('should update user details successfully', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      name: 'Original Name',
      avatar: 'original-avatar',
      google_id: 'google-id'
    });

    await UserDAO.insert(user);

    const newSettings: Partial<UpdateUserRequest> = {
      name: 'Updated Name',
      avatar: 'new-avatar',
      role: Roles.Supporter
    };

    const updatedUser = await updateUser(user, newSettings);

    expect(updatedUser).toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        avatar: 'new-avatar',
        role: Roles.Supporter,
        external_id: '00000000-0000-0000-0000-000000000000',
        friend_code: 'TESTFC'
      })
    );
  });
});

describe('deleteUser', () => {
  it('should delete user successfully', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      role: Roles.Default,
      google_id: 'google-id'
    });

    await UserDAO.insert(user);
    await deleteUser(user);

    const users = await UserDAO.findMultiple();
    expect(users).toHaveLength(0);
  });
});

describe('getUserSettings', () => {
  const mockUserHeader: UserHeader = mocks.userHeader({
    Authorization: 'Bearer token',
    Provider: AuthProvider.Google,
    Redirect: 'http://localhost:3000'
  });

  it('should return user settings with area bonuses', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      google_id: 'google-id'
    });

    await UserDAO.insert(user);

    const areaBonuses: Array<{ fk_user_id: number; area: IslandShortName; bonus: number }> = [
      { fk_user_id: user.id, area: 'AREA1' as IslandShortName, bonus: 10 },
      { fk_user_id: user.id, area: 'AREA2' as IslandShortName, bonus: 20 }
    ];

    for (const areaBonus of areaBonuses) {
      await UserAreaDAO.insert(areaBonus);
    }

    const settings = await getUserSettings(user, mockUserHeader);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      areaBonuses: {
        AREA1: 10,
        AREA2: 20
      },
      potSize: MAX_POT_SIZE,
      supporterSince: undefined
    });
  });

  it('should include supporter information for Patreon users', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Supporter,
      google_id: 'google-id',
      patreon_id: 'patreon-id'
    });

    await UserDAO.insert(user);

    vi.mocked(PatreonProvider.getPatronStatus).mockResolvedValue({
      role: Roles.Supporter,
      patronSince: '2024-01-01',
      patreon_id: 'patreon-id',
      identifier: 'patreon-email@example.com'
    });

    const settings = await getUserSettings(user, mockUserHeader);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Supporter,
      areaBonuses: {},
      potSize: MAX_POT_SIZE,
      supporterSince: '2024-01-01'
    });

    expect(PatreonProvider.getPatronStatus).toHaveBeenCalledWith({
      token: 'Bearer token',
      redirect_uri: 'http://localhost:3000'
    });
  });

  it('should return custom pot size if set', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      google_id: 'google-id'
    });

    await UserDAO.insert(user);
    await UserSettingsDAO.insert({
      fk_user_id: user.id,
      pot_size: 150
    });

    const settings = await getUserSettings(user, mockUserHeader);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      areaBonuses: {},
      potSize: 150,
      supporterSince: undefined
    });
  });
});

describe('upsertUserSettings', () => {
  it('should create new user settings', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      role: Roles.Default,
      google_id: 'google-id'
    });

    await UserDAO.insert(user);
    await upsertUserSettings(user, 150);

    const settings = await UserSettingsDAO.find({ fk_user_id: user.id });
    expect(settings).toEqual(
      expect.objectContaining({
        fk_user_id: user.id,
        pot_size: 150
      })
    );
  });

  it('should update existing user settings', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      name: 'Test User',
      role: Roles.Default,
      google_id: 'google-id'
    });

    await UserDAO.insert(user);
    await UserSettingsDAO.insert({
      fk_user_id: user.id,
      pot_size: 100
    });

    await upsertUserSettings(user, 200);

    const settings = await UserSettingsDAO.find({ fk_user_id: user.id });
    expect(settings).toEqual(
      expect.objectContaining({
        fk_user_id: user.id,
        pot_size: 200
      })
    );
  });
});
