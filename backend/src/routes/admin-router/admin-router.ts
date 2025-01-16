import type AdminController from '@src/controllers/admin/admin.controller.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAdmin } from '@src/middleware/authorization-middleware.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class AdminRouterImpl {
  public async register(controller: AdminController) {
    BaseRouter.router.get('/admin/users', validateAdmin, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /admin/users');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const users = await controller.getUsers();
        res.json(users);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.get('/admin/verify', validateAdmin, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /admin/verify');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        res.sendStatus(204);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const AdminRouter = new AdminRouterImpl();
