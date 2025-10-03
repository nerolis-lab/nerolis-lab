import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import { AuthProvider, Roles } from 'sleepapi-common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

// Mock fetch for direct API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

function setupDefaultMockResponses() {
  mockFetch.mockImplementation((url: string) => {
    // Token exchange/refresh endpoint
    if (url === 'https://www.patreon.com/api/oauth2/token') {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'mockAccessToken',
            refresh_token: 'mockRefreshToken',
            expires_in: 2678400
          })
      });
    }

    // Identity endpoint
    if (url.includes('/identity')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: MOCK_SUPPORTING_USER_ID,
              attributes: {
                email: MOCK_SUPPORTING_USER_EMAIL
              }
            }
          })
      });
    }

    // Campaign members endpoint
    if (url.includes('/campaigns/') && url.includes('/members')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                relationships: {
                  user: {
                    data: {
                      id: MOCK_SUPPORTING_USER_ID
                    }
                  }
                },
                attributes: {
                  patron_status: 'active_patron',
                  pledge_relationship_start: '2023-01-01T00:00:00.000Z'
                }
              }
            ],
            links: {}
          })
      });
    }

    // Default fallback
    return Promise.resolve({
      ok: false,
      status: 404
    });
  });
}

function resetPatreonProvider() {
  PatreonProvider.client = undefined;
  // @ts-expect-error accessing private field for testing
  PatreonProvider.patrons = new Map();
  // @ts-expect-error accessing private field for testing
  PatreonProvider.lastPatronsUpdate = 0;
}

describe('PatreonProvider', () => {
  beforeEach(() => {
    setupDefaultMockResponses();
  });

  afterEach(() => {
    resetPatreonProvider();
    vi.clearAllMocks();
  });

  it('should have a provider', () => {
    expect(PatreonProvider.provider).toBe(AuthProvider.Patreon);
  });

  describe('signup', () => {
    it('should exchange authorization code for tokens and create a user', async () => {
      const params = {
        authorization_code: '1234567890',
        redirect_uri: 'http://localhost:3000'
      };

      const result = await PatreonProvider.signup(params);

      // Verify token exchange call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.patreon.com/api/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(URLSearchParams)
        })
      );

      // Verify identity fetch call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mockAccessToken'
          })
        })
      );

      expect(result).toMatchObject({
        auth: {
          tokens: {
            accessToken: 'mockAccessToken',
            refreshToken: 'mockRefreshToken'
          },
          activeProvider: AuthProvider.Patreon
        }
      });
    });

    it('should handle token exchange failure', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://www.patreon.com/api/oauth2/token') {
          return Promise.resolve({
            ok: false,
            status: 400
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const params = {
        authorization_code: 'invalid-code',
        redirect_uri: 'http://localhost:3000'
      };

      await expect(PatreonProvider.signup(params)).rejects.toThrow('Failed to exchange authorization code for tokens');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const params = {
        refresh_token: 'mockRefreshToken',
        redirect_uri: 'http://localhost:3000'
      };

      const result = await PatreonProvider.refresh(params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.patreon.com/api/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(URLSearchParams)
        })
      );

      expect(result).toMatchObject({
        access_token: 'mockAccessToken',
        expiry_date: expect.any(Number)
      });
    });

    it('should handle refresh failure', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://www.patreon.com/api/oauth2/token') {
          return Promise.resolve({
            ok: false,
            status: 400
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const params = {
        refresh_token: 'invalid-refresh-token',
        redirect_uri: 'http://localhost:3000'
      };

      await expect(PatreonProvider.refresh(params)).rejects.toThrow('Failed to refresh token');
    });
  });

  describe('getPatronId', () => {
    it('should return patron id and identifier', async () => {
      const params = {
        token: 'mockAccessToken',
        redirect_uri: 'http://localhost:3000'
      };

      const result = await PatreonProvider.getPatronId(params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mockAccessToken'
          })
        })
      );

      expect(result).toEqual({
        patreon_id: MOCK_SUPPORTING_USER_ID,
        identifier: MOCK_SUPPORTING_USER_EMAIL
      });
    });

    it('should handle identity fetch failure', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/identity')) {
          return Promise.resolve({
            ok: false,
            status: 401
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const params = {
        token: 'invalid-token',
        redirect_uri: 'http://localhost:3000'
      };

      await expect(PatreonProvider.getPatronId(params)).rejects.toThrow('Failed to fetch Patreon identity');
    });
  });

  describe('isSupporter', () => {
    it('should return supporter role for active patrons', async () => {
      const result = await PatreonProvider.isSupporter({
        patreon_id: MOCK_SUPPORTING_USER_ID,
        previousRole: Roles.Default
      });

      expect(result).toEqual({
        role: Roles.Supporter,
        patronSince: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should return default role for non-active patrons', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/campaigns/') && url.includes('/members')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    relationships: {
                      user: {
                        data: {
                          id: MOCK_NON_SUPPORTING_USER_ID
                        }
                      }
                    },
                    attributes: {
                      patron_status: null,
                      pledge_relationship_start: '2023-01-01T00:00:00.000Z'
                    }
                  }
                ],
                links: {}
              })
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const result = await PatreonProvider.isSupporter({
        patreon_id: MOCK_NON_SUPPORTING_USER_ID,
        previousRole: Roles.Default
      });

      expect(result).toEqual({
        role: Roles.Default,
        patronSince: null
      });
    });

    it('should preserve admin role when patreon_id is undefined', async () => {
      const result = await PatreonProvider.isSupporter({
        patreon_id: undefined,
        previousRole: Roles.Admin
      });

      expect(result).toEqual({
        role: Roles.Admin,
        patronSince: null
      });
    });
  });

  describe('unlink', () => {
    it('should set patreon_id to undefined when unlinking', async () => {
      const user: DBUser = await UserDAO.insert({
        ...mocks.dbUser(),
        patreon_id: 'some-patreon-id',
        role: Roles.Supporter
      });

      await PatreonProvider.unlink(user);

      const updatedUser = await UserDAO.get({ external_id: user.external_id });
      expect(updatedUser.patreon_id).toBeUndefined();
      expect(updatedUser.role).toBe(Roles.Default);
    });

    it('should preserve admin role when unlinking', async () => {
      const user: DBUser = await UserDAO.insert({
        ...mocks.dbUser(),
        patreon_id: 'some-patreon-id',
        role: Roles.Admin
      });

      await PatreonProvider.unlink(user);

      const updatedUser = await UserDAO.get({ external_id: user.external_id });
      expect(updatedUser.patreon_id).toBeUndefined();
      expect(updatedUser.role).toBe(Roles.Admin);
    });
  });
});
