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
          const provider = req.body.provider;

          const user = (req as MaybeAuthenticatedRequest).user;

          const userData = await controller.signup({
            authorization_code: req.body.authorization_code,
            provider,
            redirect_uri: req.body.redirect_uri,
            preExistingUser: user
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
        const provider = req.body.provider;
        const redirect_uri = req.body.redirect_uri;
        const refresh_token = req.body.refresh_token;

        const refreshedData = await controller.refresh({
          refresh_token,
          provider,
          redirect_uri
        });

        res.json(refreshedData);
      } catch (err) {
        logger.error(err as Error);
        res.sendStatus(401);
      }
    });

    BaseRouter.router.delete('/login/unlink/:provider', validateAuthHeader, async (req: Request, res: Response) => {
      try {
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
