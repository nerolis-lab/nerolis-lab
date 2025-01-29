import type { DBUser } from '@src/database/dao/user/user-dao.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAdmin, validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import * as loginService from '@src/services/api-service/login/login-service.js';
import type { NextFunction, Request, Response } from 'express';
import { Roles, type Logger } from 'sleepapi-common';

describe('validateAuthHeader middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      sendStatus: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn() as unknown as NextFunction;

    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should respond with 401 if no Authorization header is present', async () => {
    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 401 if Authorization header does not start with Bearer', async () => {
    req.headers!.authorization = 'Basic token';
    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);

    expect(logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid access token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if Authorization header is valid and token is verified', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    const mockUser: DBUser = {
      id: 1,
      version: 1,
      sub: 'test-sub',
      friend_code: 'TESTFC',
      external_id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default
    };
    const spy = vi.spyOn(loginService, 'verifyExistingUser');
    spy.mockResolvedValue(mockUser);

    await validateAuthHeader(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
    spy.mockRestore();
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';

    const spy = vi.spyOn(loginService, 'verifyExistingUser');
    spy.mockRejectedValue(new Error('Invalid token'));

    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
    spy.mockRestore();
  });
});

describe('validateAdmin middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      sendStatus: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn() as unknown as NextFunction;

    global.logger = {
      debug: vi.fn() as unknown,
      log: vi.fn() as unknown,
      info: vi.fn() as unknown,
      warn: vi.fn() as unknown,
      error: vi.fn() as unknown
    } as Logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should respond with 401 if no Authorization header is present', async () => {
    await validateAdmin(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 401 if Authorization header does not start with Bearer', async () => {
    req.headers!.authorization = 'Basic token';
    await validateAdmin(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);

    expect(logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid access token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if Authorization header is valid and token is verified', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    const mockUser: DBUser = {
      id: 1,
      version: 1,
      sub: 'test-sub',
      external_id: '00000000-0000-0000-0000-000000000000',
      friend_code: 'TESTFC',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Admin
    };
    const spy = vi.spyOn(loginService, 'verifyAdmin');
    spy.mockResolvedValue(mockUser);

    await validateAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
    spy.mockRestore();
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';

    const spy = vi.spyOn(loginService, 'verifyAdmin');
    spy.mockRejectedValue(new Error('Invalid token'));

    await validateAdmin(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
    spy.mockRestore();
  });
});
