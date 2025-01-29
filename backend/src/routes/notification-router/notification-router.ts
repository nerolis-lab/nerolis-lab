import type NotificationController from '@src/controllers/notification/notification.controller.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class NotificationRouterImpl {
  public async register(controller: NotificationController) {
    BaseRouter.router.get('/notifications', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /notifications');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const notifications = await controller.getNotifications(user);
        res.json(notifications);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const NotificationRouter = new NotificationRouterImpl();
