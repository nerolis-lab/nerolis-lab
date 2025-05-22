import type UserController from '@src/controllers/user/user.controller.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import type { RequestBody } from '@src/routes/base-router.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';
import type {
  PokemonInstanceWithMeta,
  UpdateUserRequest,
  UpsertAreaBonusRequest,
  UpsertRecipeLevelRequest,
  UserSettingsRequest
} from 'sleepapi-common';

class UserRouterImpl {
  public async register(controller: UserController) {
    BaseRouter.router.get('/user', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { google_id, discord_id, patreon_id, ...rest } = user;

        res.json(rest);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.patch(
      '/user',
      validateAuthHeader,
      async (req: Request<Partial<UpdateUserRequest>>, res: Response) => {
        try {
          logger.log('Entered /user PATCH');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          const data = await controller.updateUser(user, req.body);

          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    // user settings
    BaseRouter.router.get('/user/settings', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user/settings GET');

        const authentication = req as AuthenticatedRequest;
        const user = authentication.user;
        if (!user) {
          throw new Error('User not found');
        }
        const data = await controller.getUserSettings(user);

        res.json(data);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/user/settings',
      validateAuthHeader,
      async (req: RequestBody<UserSettingsRequest>, res: Response) => {
        try {
          logger.log('Entered /user/settings PUT');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsertUserSettings(user, req.body);

          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    // User Pokémon
    BaseRouter.router.get('/user/pokemon', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user/pokemon GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const data = await controller.getUserPokemon(user);

        res.json(data);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/user/pokemon',
      validateAuthHeader,
      async (req: Request<unknown, unknown, PokemonInstanceWithMeta, unknown>, res: Response) => {
        try {
          logger.log('Entered /user/pokemon PUT');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsertPokemon({ user, pokemonInstance: req.body });

          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.delete(
      '/user/pokemon/:externalId',
      validateAuthHeader,
      async (req: Request<{ externalId: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          logger.log('Entered /user/pokemon/:externalId DELETE');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.deletePokemon({ user, externalId: req.params.externalId });

          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.delete('/user', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user DEL');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        await controller.deleteUser(user);

        res.sendStatus(204);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    // User recipe level
    BaseRouter.router.get('/user/recipe', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user/recipe GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const data = await controller.getUserRecipeLevels(user);

        res.json(data);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/user/recipe',
      validateAuthHeader,
      async (req: RequestBody<UpsertRecipeLevelRequest>, res: Response) => {
        try {
          logger.log('Entered /user/recipe PUT');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsertRecipeLevel({ user, recipe: req.body.recipe, level: req.body.level });

          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.get('/user/area', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        logger.log('Entered /user/area GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const data = await controller.getUserAreaBonuses(user);

        res.json(data);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/user/area',
      validateAuthHeader,
      async (req: RequestBody<UpsertAreaBonusRequest>, res: Response) => {
        try {
          logger.log('Entered /user/area PUT');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsertAreaBonus({ user, area: req.body.area, bonus: req.body.bonus });

          res.sendStatus(204);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const UserRouter = new UserRouterImpl();
