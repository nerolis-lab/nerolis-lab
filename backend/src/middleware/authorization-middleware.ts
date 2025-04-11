import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { ProviderFactory } from '@src/services/user-service/login-service/providers/provider-factory.js';
import type { NextFunction, Request, Response } from 'express';
import type { IncomingHttpHeaders } from 'http';
import type { UserHeader } from 'sleepapi-common';
import { AuthProvider } from 'sleepapi-common';
export interface AuthenticatedRequest extends Request<unknown, unknown, unknown, unknown> {
  user: DBUser;
  userHeader: UserHeader;
}
export interface MaybeAuthenticatedRequest extends Request<unknown, unknown, unknown, unknown> {
  user?: DBUser;
  userHeader?: UserHeader;
}

export async function validateAuthHeader(req: Request, res: Response, next: NextFunction) {
  try {
    const userHeader = validatedUserHeader({ headers: req.headers, shouldThrow: true });
    const user = await ProviderFactory.getProvider(userHeader.Provider).verifyExistingUser(userHeader);

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).userHeader = userHeader;

    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}

export async function withMaybeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userHeader = validatedUserHeader({ headers: req.headers, shouldThrow: false });
    if (!userHeader) {
      (req as MaybeAuthenticatedRequest).user = undefined;
    } else {
      const provider = ProviderFactory.getProvider(userHeader.Provider);
      const user = await provider.verifyExistingUser(userHeader);
      (req as MaybeAuthenticatedRequest).user = user;
    }
    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}

export async function validateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const userHeader = validatedUserHeader({ headers: req.headers, shouldThrow: true });
    const user = await ProviderFactory.getProvider(userHeader.Provider).verifyAdmin(userHeader);

    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}

export function validatedUserHeader(params: { headers: IncomingHttpHeaders; shouldThrow: true }): UserHeader;
export function validatedUserHeader(params: {
  headers: IncomingHttpHeaders;
  shouldThrow: false;
}): UserHeader | undefined;
export function validatedUserHeader(params: {
  headers: IncomingHttpHeaders;
  shouldThrow: boolean;
}): UserHeader | undefined {
  const { headers, shouldThrow } = params;

  const failed = (message: string) => {
    if (shouldThrow) {
      throw new AuthorizationError(message);
    }
    return undefined;
  };

  const accessToken = headers.authorization;
  const provider = headers.provider as AuthProvider;
  const redirect = headers.redirect as string | undefined;

  if (!accessToken || !accessToken.startsWith('Bearer ')) {
    return failed('Invalid access token');
  }

  if (!redirect || typeof redirect !== 'string') {
    return failed('Invalid redirect');
  }

  if (!Object.values(AuthProvider).includes(provider)) {
    return failed('Invalid provider');
  }

  return {
    Authorization: accessToken.split(' ')[1],
    Provider: provider,
    Redirect: redirect
  };
}
