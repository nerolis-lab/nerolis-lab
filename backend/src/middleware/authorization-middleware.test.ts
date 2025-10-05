import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import type { AuthenticatedRequest, MaybeAuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import {
  validateAdmin,
  validateAuthHeader,
  validatedUserHeader,
  withMaybeUser
} from '@src/middleware/authorization-middleware.js';
import type { AbstractProvider } from '@src/services/user-service/login-service/providers/abstract-provider.js';
import { ProviderFactory } from '@src/services/user-service/login-service/providers/provider-factory.js';
import type { NextFunction, Request, Response } from 'express';
import { AuthProvider, Roles, type Logger } from 'sleepapi-common';

vi.mock('@src/services/user-service/login-service/providers/provider-factory.js', () => ({
  ProviderFactory: {
    getProvider: vi.fn().mockReturnValue({
      verifyExistingUser: vi.fn(),
      verifyAdmin: vi.fn()
    })
  }
}));

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
    next = vi.fn();

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
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';

    const mockUser: DBUser = {
      id: 1,
      version: 1,
      google_id: 'test-google_id',
      friend_code: 'TESTFC',
      external_id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default
    };
    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyExistingUser: vi.fn().mockResolvedValue(mockUser)
    } as unknown as AbstractProvider<unknown>);

    await validateAuthHeader(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';
    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyExistingUser: vi.fn().mockRejectedValue(new Error('Invalid token'))
    } as unknown as AbstractProvider<unknown>);

    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
  });

  it('should respond with 401 if redirect is not provided', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    req.headers!.provider = AuthProvider.Discord;

    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid redirect');
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
    next = vi.fn();

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
    req.headers!.provider = AuthProvider.Google;

    await validateAdmin(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);

    expect(logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid access token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if Authorization header is valid and token is verified', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';
    const mockUser: DBUser = {
      id: 1,
      version: 1,
      google_id: 'test-google_id',
      external_id: '00000000-0000-0000-0000-000000000000',
      friend_code: 'TESTFC',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Admin
    };
    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyAdmin: vi.fn().mockResolvedValue(mockUser)
    } as unknown as AbstractProvider<unknown>);

    await validateAdmin(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';

    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyAdmin: vi.fn().mockRejectedValue(new Error('Invalid token'))
    } as unknown as AbstractProvider<unknown>);

    await validateAdmin(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
  });
});

describe('withMaybeUser middleware', () => {
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
    next = vi.fn();

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

  it('should set user to undefined if no Authorization header is present', async () => {
    await withMaybeUser(req as Request, res as Response, next);
    expect((req as MaybeAuthenticatedRequest).user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set user to undefined if Authorization header does not start with Bearer', async () => {
    req.headers!.authorization = 'Basic token';
    await withMaybeUser(req as Request, res as Response, next);
    expect((req as MaybeAuthenticatedRequest).user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set user if Authorization header is valid and token is verified', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';
    const mockUser: DBUser = {
      id: 1,
      version: 1,
      google_id: 'test-google_id',
      friend_code: 'TESTFC',
      external_id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      avatar: 'test-avatar',
      role: Roles.Default
    };
    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyExistingUser: vi.fn().mockResolvedValue(mockUser)
    } as unknown as AbstractProvider<unknown>);

    await withMaybeUser(req as Request, res as Response, next);
    expect((req as MaybeAuthenticatedRequest).user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';
    req.headers!.provider = AuthProvider.Google;
    req.headers!.redirect = 'https://example.com';
    vi.mocked(ProviderFactory.getProvider).mockReturnValue({
      verifyExistingUser: vi.fn().mockRejectedValue(new Error('Invalid token'))
    } as unknown as AbstractProvider<unknown>);

    await withMaybeUser(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
  });
});

describe('validatedUserHeader', () => {
  let headers: Record<string, string>;

  beforeEach(() => {
    headers = {
      authorization: 'Bearer validtoken',
      provider: AuthProvider.Google,
      redirect: 'https://example.com'
    };
  });

  describe('with shouldThrow: true', () => {
    it('should return valid UserHeader when all headers are present and valid', () => {
      const result = validatedUserHeader({ headers, shouldThrow: true });
      expect(result).toEqual({
        Authorization: 'validtoken',
        Provider: AuthProvider.Google,
        Redirect: 'https://example.com'
      });
    });

    it('should throw when authorization header is missing', () => {
      delete headers.authorization;
      expect(() => validatedUserHeader({ headers, shouldThrow: true })).toThrow('Invalid access token');
    });

    it('should throw when authorization header does not start with Bearer', () => {
      headers.authorization = 'Basic token';
      expect(() => validatedUserHeader({ headers, shouldThrow: true })).toThrow('Invalid access token');
    });

    it('should throw when redirect is missing', () => {
      delete headers.redirect;
      expect(() => validatedUserHeader({ headers, shouldThrow: true })).toThrow('Invalid redirect');
    });

    it('should throw when provider is missing', () => {
      delete headers.provider;
      expect(() => validatedUserHeader({ headers, shouldThrow: true })).toThrow('Invalid provider');
    });

    it('should throw when provider is invalid', () => {
      headers.provider = 'invalid-provider';
      expect(() => validatedUserHeader({ headers, shouldThrow: true })).toThrow('Invalid provider');
    });
  });

  describe('with shouldThrow: false', () => {
    it('should return valid UserHeader when all headers are present and valid', () => {
      const result = validatedUserHeader({ headers, shouldThrow: false });
      expect(result).toEqual({
        Authorization: 'validtoken',
        Provider: AuthProvider.Google,
        Redirect: 'https://example.com'
      });
    });

    it('should return undefined when authorization header is missing', () => {
      delete headers.authorization;
      expect(validatedUserHeader({ headers, shouldThrow: false })).toBeUndefined();
    });

    it('should return undefined when authorization header does not start with Bearer', () => {
      headers.authorization = 'Basic token';
      expect(validatedUserHeader({ headers, shouldThrow: false })).toBeUndefined();
    });

    it('should return undefined when redirect is missing', () => {
      delete headers.redirect;
      expect(validatedUserHeader({ headers, shouldThrow: false })).toBeUndefined();
    });

    it('should return undefined when provider is missing', () => {
      delete headers.provider;
      expect(validatedUserHeader({ headers, shouldThrow: false })).toBeUndefined();
    });

    it('should return undefined when provider is invalid', () => {
      headers.provider = 'invalid-provider';
      expect(validatedUserHeader({ headers, shouldThrow: false })).toBeUndefined();
    });
  });
});
