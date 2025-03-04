import type NotificationController from '@src/controllers/notification/notification.controller.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAdmin, validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import type { RequestBody } from '@src/routes/base-router.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';
import type { NewsNotificationRequest } from 'sleepapi-common';

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

    BaseRouter.router.delete('/notifications/:externalId', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /notifications/:externalId DELETE');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        await controller.dismissNotification(req.params.externalId);
        res.sendStatus(204);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.get('/notifications/news', validateAdmin, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /notifications/news GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const notifications = await controller.getNewsNotifications();
        res.json(notifications);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.post(
      '/notifications/news',
      validateAdmin,
      async (req: RequestBody<NewsNotificationRequest>, res: Response) => {
        try {
          logger.log('Entered /notifications/news POST');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.addNewsNotification({ admin: user, newsRequest: req.body });
          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const NotificationRouter = new NotificationRouterImpl();
