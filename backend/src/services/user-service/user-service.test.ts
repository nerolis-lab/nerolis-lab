import { UserAreaDAO } from '@src/database/dao/user-area/user-area-dao.js';
import { UserSettingsDAO } from '@src/database/dao/user-settings/user-settings-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user-dao.js';
import { FriendService } from '@src/services/friend-service/friend-service.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { UpdateUserRequest } from 'sleepapi-common';
import { MAX_POT_SIZE, Roles, uuid, type IslandShortName } from 'sleepapi-common';
import { deleteUser, getUserSettings, updateUser, upsertUserSettings } from './user-service.js';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

uuid.v4 = vi.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
TimeUtils.getMySQLNow = vi.fn().mockReturnValue('2024-01-01 18:00:00');

vi.mock('@src/services/friend-service/friend-service.js', () => ({
  FriendService: {
    validateFriendCodeUpdate: vi.fn()
  }
}));

vi.mock('@src/services/user-service/login-service/providers/patreon/patreon-provider.js', () => ({
  PatreonProvider: {
    getPatronId: vi.fn(),
    parsePatronStatus: vi.fn(),
    isSupporter: vi.fn()
  }
}));

describe('updateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    expect(FriendService.validateFriendCodeUpdate).not.toHaveBeenCalled();
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

  it('should update friend code if provided', async () => {
    const user: DBUser = mocks.dbUser({
      external_id: uuid.v4(),
      friend_code: 'OLDCODE',
      name: 'Test User',
      role: Roles.Default,
      google_id: 'google-id'
    });
    await UserDAO.insert(user);

    const newSettings: Partial<UpdateUserRequest> = {
      friend_code: 'NEWCODE'
    };

    await updateUser(user, newSettings);

    expect(FriendService.validateFriendCodeUpdate).toHaveBeenCalledWith(user, 'NEWCODE');
    const updatedUserInDb = await UserDAO.find({ id: user.id });
    expect(updatedUserInDb?.friend_code).toBe('NEWCODE');
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

    const settings = await getUserSettings(user);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      areaBonuses: {
        AREA1: 10,
        AREA2: 20
      },
      potSize: MAX_POT_SIZE,
      supporterSince: null
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

    vi.mocked(PatreonProvider.getPatronId).mockResolvedValue({
      identifier: 'patreon-email@example.com',
      patreon_id: 'patreon-id'
    });
    vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({
      role: Roles.Supporter,
      patronSince: '2024-01-01'
    });

    const settings = await getUserSettings(user);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Supporter,
      areaBonuses: {},
      potSize: MAX_POT_SIZE,
      supporterSince: '2024-01-01'
    });

    expect(PatreonProvider.isSupporter).toHaveBeenCalledWith({ patreon_id: user.patreon_id, previousRole: user.role });
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

    const settings = await getUserSettings(user);

    expect(settings).toEqual({
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default,
      areaBonuses: {},
      potSize: 150,
      supporterSince: null
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
