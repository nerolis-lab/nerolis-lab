import type FriendController from '@src/controllers/friend/friend.controller.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';
import {
  UserNotFoundError,
  CannotRemoveSelfError,
  FriendshipNotFoundError,
} from '@src/services/friend-service/friend-service.js';
import { SleepAPIError } from 'sleepapi-common';

class FriendRouterImpl {
  public async register(controller: FriendController) {
    BaseRouter.router.get('/friends', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /friends');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const friends = await controller.getFriends(user);
        res.json(friends);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.post(
      '/friend/request/:receiver_code',
      validateAuthHeader,
      async (req: Request<{ receiver_code: string }>, res: Response) => {
        try {
          logger.log('Entered /friend/request');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.sendRequest(user, req.params.receiver_code);
          res.status(204).send();
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/friend/accept/:sender_code',
      validateAuthHeader,
      async (req: Request<{ sender_code: string }>, res: Response) => {
        try {
          logger.log('Entered /friend/accept');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.acceptRequest(user, req.params.sender_code);
          res.status(204).send();
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/friend/decline/:sender_code',
      validateAuthHeader,
      async (req: Request<{ sender_code: string }>, res: Response) => {
        try {
          logger.log('Entered /friend/decline');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.declineRequest(user, req.params.sender_code);
          res.status(204).send();
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.delete(
      '/friend/remove/:friend_code',
      validateAuthHeader,
      async (req: Request<{ friend_code: string }>, res: Response) => {
        try {
          logger.log(`Entered /friend/remove/${req.params.friend_code}`);

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            // This case should ideally be caught by validateAuthHeader,
            // but as a safeguard:
            logger.error('User not found in authenticated request');
            throw new Error('User not found');
          }

          await controller.removeFriend(user, req.params.friend_code);
          res.status(204).send();
        } catch (err) {
          logger.error(err as Error);
          if (err instanceof UserNotFoundError || err instanceof FriendshipNotFoundError) {
            res.status(404).send(err.message);
          } else if (err instanceof CannotRemoveSelfError) {
            res.status(400).send(err.message);
          } else if (err instanceof SleepAPIError) {
            res.status(err.statusCode ?? 500).send(err.message);
          } else {
            res.status(500).send('Something went wrong');
          }
        }
      }
    );
  }
}

export const FriendRouter = new FriendRouterImpl();
