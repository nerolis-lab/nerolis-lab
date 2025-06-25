import type { ChangelogController } from '@src/controllers/changelog/changelog.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';

class ChangelogRouterImpl {
  public async register(controller: ChangelogController) {
    BaseRouter.router.get('/changelog', async (_, res) => {
      try {
        logger.log('Entered /api/changelog');
        const changelog = await controller.getChangelog();
        res.header('Content-Type', 'text/plain').send(changelog);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Failed to load changelog');
      }
    });
  }
}

export const ChangelogRouter = new ChangelogRouterImpl();
