import { ChangelogController } from '@src/controllers/changelog/changelog.controller.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('changelog.controller', () => {
  let controller: ChangelogController;

  beforeEach(() => {
    controller = new ChangelogController();
  });

  describe('getChangelog', () => {
    it('should return changelog data from the real service', async () => {
      const result = await controller.getChangelog();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      expect(result[0]).toHaveProperty('version');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('features');
      expect(result[0]).toHaveProperty('bugFixes');
      expect(result[0]).toHaveProperty('breakingChanges');
      expect(result[0]).toHaveProperty('otherChanges');
    });
  });
});
