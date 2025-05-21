import UserController from '@src/controllers/user/user.controller';
import { HTTPError } from '@src/domain/error/api/api-error';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware';
import { PatreonProvider } from '@src/services/user-service/login-service/providers/patreon/patreon-provider';
import { updateFriendCode as updateFriendCodeService } from '@src/services/user-service/user-service';
import type { DBUser, UpdateFriendCodeRequest } from 'sleepapi-common';
import { Roles } from 'sleepapi-common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@src/services/user-service/user-service.js');
vi.mock('@src/services/user-service/login-service/providers/patreon/patreon-provider.js');

describe('UserController', () => {
  let controller: UserController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockUser: DBUser;

  beforeEach(() => {
    controller = new UserController();
    mockUser = {
      id: '1',
      name: 'testuser',
      username: 'testuser',
      role: Roles.Default,
      friend_code: 'OLDCODE',
      patreon_id: 'patreon123',
      google_id: null,
      discord_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockRequest = {
      user: mockUser,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('updateFriendCode', () => {
    const validRequestBody: UpdateFriendCodeRequest = { newFriendCode: 'VALIDC' }; // 6 chars

    it('should update friend code for a valid supporter', async () => {
      mockUser.patreon_id = 'patreon123';
      mockRequest.user = mockUser;
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Supporter, patronSince: null });
      vi.mocked(updateFriendCodeService).mockResolvedValue({ ...mockUser, friend_code: validRequestBody.newFriendCode });

      const result = await controller.updateFriendCode(
        mockRequest as AuthenticatedRequest,
        validRequestBody
      );

      expect(result).toEqual({ success: true, friendCode: validRequestBody.newFriendCode });
      expect(PatreonProvider.isSupporter).toHaveBeenCalledWith({
        patreon_id: 'patreon123',
        previousRole: Roles.Default,
      });
      expect(updateFriendCodeService).toHaveBeenCalledWith(mockUser, validRequestBody.newFriendCode);
    });

    it('should allow admin to update friend code', async () => {
      mockUser.patreon_id = 'patreonAdmin';
      mockUser.role = Roles.Admin;
      mockRequest.user = mockUser;
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Admin, patronSince: null });
      vi.mocked(updateFriendCodeService).mockResolvedValue({ ...mockUser, friend_code: validRequestBody.newFriendCode });

      const result = await controller.updateFriendCode(
        mockRequest as AuthenticatedRequest,
        validRequestBody
      );

      expect(result).toEqual({ success: true, friendCode: validRequestBody.newFriendCode });
      expect(PatreonProvider.isSupporter).toHaveBeenCalledWith({
        patreon_id: 'patreonAdmin',
        previousRole: Roles.Admin,
      });
      expect(updateFriendCodeService).toHaveBeenCalledWith(mockUser, validRequestBody.newFriendCode);
    });

    it('should throw HTTPError 400 for invalid friend code format (too short)', async () => {
      const invalidBody: UpdateFriendCodeRequest = { newFriendCode: 'SHORT' };
      mockRequest.user = mockUser; // Ensure user is set for other checks

      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toThrowError(HTTPError);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toHaveProperty('statusCode', 400);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toHaveProperty('message', 'Invalid friend code format. Must be 6 characters, A-Z, 0-9.');
    });

    it('should throw HTTPError 400 for invalid friend code format (invalid characters)', async () => {
      const invalidBody: UpdateFriendCodeRequest = { newFriendCode: 'invalid!' };
      mockRequest.user = mockUser;

      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toThrowError(HTTPError);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toHaveProperty('statusCode', 400);
       await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, invalidBody)
      ).rejects.toHaveProperty('message', 'Invalid friend code format. Must be 6 characters, A-Z, 0-9.');
    });

    it('should throw HTTPError 403 if patreon_id is missing', async () => {
      mockUser.patreon_id = null;
      mockRequest.user = mockUser;

      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toThrowError(HTTPError);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toHaveProperty('statusCode', 403);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toHaveProperty('message', 'Patreon account not linked. Supporter status cannot be verified.');
    });

    it('should throw HTTPError 403 if user is not a supporter', async () => {
      mockUser.patreon_id = 'notSupporterPatreon';
      mockRequest.user = mockUser;
      vi.mocked(PatreonProvider.isSupporter).mockResolvedValue({ role: Roles.Default, patronSince: null });

      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toThrowError(HTTPError);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toHaveProperty('statusCode', 403);
      await expect(
        controller.updateFriendCode(mockRequest as AuthenticatedRequest, validRequestBody)
      ).rejects.toHaveProperty('message', 'User is not a Patreon supporter.');
      expect(PatreonProvider.isSupporter).toHaveBeenCalledWith({
        patreon_id: 'notSupporterPatreon',
        previousRole: Roles.Default,
      });
    });
  });
});
