import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import { mocks } from '@src/vitest/index.js';
import type { LoginResponse, RefreshResponse, UserHeader } from 'sleepapi-common';
import { AuthProvider, Roles, uuid } from 'sleepapi-common';
import { AbstractProvider } from './abstract-provider.js';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

uuid.v4 = vi.fn().mockReturnValue('00000000-0000-0000-0000-000000000000');
TimeUtils.getMySQLNow = vi.fn().mockReturnValue('2024-01-01 18:00:00');

class TestProvider extends AbstractProvider<unknown> {
  public provider = AuthProvider.Google;
  public client = undefined;

  public async signup(): Promise<LoginResponse> {
    throw new Error('Method not implemented.');
  }

  public async refresh(): Promise<RefreshResponse> {
    throw new Error('Method not implemented.');
  }

  public async unlink(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async verifyExistingUser(userHeader: UserHeader): Promise<DBUser> {
    return await UserDAO.get({ google_id: userHeader.Authorization });
  }

  public async updateLastLogin(): Promise<DBUser> {
    throw new Error('Method not implemented.');
  }

  public async verifyAdmin(userHeader: UserHeader): Promise<DBUser> {
    return super.verifyAdmin(userHeader);
  }
}

describe('AbstractProvider', () => {
  let provider: TestProvider;

  beforeEach(async () => {
    provider = new TestProvider();
  });

  describe('verifyAdmin', () => {
    const googleId = 'test-google-id';
    const mockUserHeader: UserHeader = mocks.userHeader({ Authorization: googleId });

    it('should verify admin user successfully', async () => {
      const user = mocks.dbUser({
        google_id: googleId,
        role: Roles.Admin
      });
      await UserDAO.insert(user);
      const result = await provider.verifyAdmin(mockUserHeader);
      expect(result.external_id).toEqual(user.external_id);
    });

    it('should throw error for non-admin user', async () => {
      const user = mocks.dbUser({
        google_id: googleId,
        role: Roles.Default
      });
      await UserDAO.insert(user);
      await expect(provider.verifyAdmin(mockUserHeader)).rejects.toThrow('User is not an admin');
    });

    it('should throw error for non-existent user', async () => {
      await expect(provider.verifyAdmin(mockUserHeader)).rejects.toThrow(
        'Unable to find entry in user with filter [{"google_id":"test-google-id"}]'
      );
    });
  });
});
