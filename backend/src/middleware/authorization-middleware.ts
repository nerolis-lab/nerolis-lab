import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { verifyAdmin, verifyExistingUser } from '@src/services/user-service/login-service/login-service.js';
import type { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request<unknown, unknown, unknown, unknown> {
  user: DBUser;
}
export interface MaybeAuthenticatedRequest extends Request<unknown, unknown, unknown, unknown> {
  user?: DBUser;
}

export async function validateAuthHeader(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthorizationError('Invalid access token');
    }

    const accessToken = authHeader.split(' ')[1];
    const user = await verifyExistingUser(accessToken);

    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}

export async function withMaybeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (req as MaybeAuthenticatedRequest).user = undefined;

      next();
    } else {
      const accessToken = authHeader.split(' ')[1];
      const user = await verifyExistingUser(accessToken);

      (req as MaybeAuthenticatedRequest).user = user;

      next();
    }
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}

export async function validateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthorizationError('Invalid access token');
    }

    const accessToken = authHeader.split(' ')[1];
    const user = await verifyAdmin(accessToken);

    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}
