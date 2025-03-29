import type LoginController from '@src/controllers/login/login.controller.js';
import type { AuthenticatedRequest, MaybeAuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAuthHeader, withMaybeUser } from '@src/middleware/authorization-middleware.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';
import type { AuthProvider, RefreshRequest, SignupRequest } from 'sleepapi-common';

class LoginRouterImpl {
  public async register(controller: LoginController) {
    BaseRouter.router.post(
      '/login/signup',
      withMaybeUser,
      async (req: Request<unknown, unknown, SignupRequest>, res: Response) => {
        try {
          logger.info('Entered /login/signup');
          const provider = req.body.provider;

          if (provider === 'discord' && !req.body.redirect_uri) {
            throw new Error('redirect_uri is required for Discord authentication');
          }

          const user = (req as MaybeAuthenticatedRequest).user;

          const userData = await controller.signup({
            authorization_code: req.body.authorization_code,
            provider,
            redirect_uri: req.body.redirect_uri,
            existingUser: user
          });

          res.header('Content-Type', 'application/json').send(userData);
        } catch (err) {
          logger.error(err as Error);
          res.sendStatus(401);
        }
      }
    );

    BaseRouter.router.post('/login/refresh', async (req: Request<unknown, unknown, RefreshRequest>, res: Response) => {
      try {
        logger.info('Entered /login/refresh');
        const provider = req.body.provider;

        const refreshedData = await controller.refresh({
          refresh_token: req.body.refresh_token,
          provider,
          redirect_uri: req.body.redirect_uri
        });

        res.json(refreshedData);
      } catch (err) {
        logger.error(err as Error);
        res.sendStatus(401);
      }
    });

    BaseRouter.router.delete('/login/unlink/:provider', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.info('Entered /login/unlink/:provider');
        const provider = req.params.provider as AuthProvider;

        const authentication = req as AuthenticatedRequest;

        await controller.unlink(provider, authentication.user);
        res.sendStatus(204);
      } catch (err) {
        logger.error(err as Error);
        res.sendStatus(401);
      }
    });
  }
}

export const LoginRouter = new LoginRouterImpl();
