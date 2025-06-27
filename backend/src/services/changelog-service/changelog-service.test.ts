import { ChangelogService } from '@src/services/changelog-service/changelog-service.js';
import { ChangelogParser } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('ChangelogService', () => {
  describe('getChangelog with real data', () => {
    it('should return changelog data from the real file', async () => {
      const result = await ChangelogService.getChangelog();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      expect(result[0]).toHaveProperty('version');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('features');
      expect(result[0]).toHaveProperty('bugFixes');
      expect(result[0]).toHaveProperty('breakingChanges');
      expect(result[0]).toHaveProperty('otherChanges');

      expect(result[0].version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['major', 'minor', 'patch']).toContain(result[0].type);
    });

    it('should parse different changelog formats correctly', () => {
      const testContent = `
      # [1.0.0](link) (2023-01-01)

      ### Features

      * Add user authentication ([abc1234](link))
      * **api:** Add new endpoint ([def5678](link))

      ### Bug Fixes

      * Fix memory leak ([ghi9012](link))`;

      const result = ChangelogParser.parseChangelog(testContent);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('1.0.0');
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].type).toBe('major');
      expect(result[0].features).toHaveLength(2);
      expect(result[0].bugFixes).toHaveLength(1);
      expect(result[0].features[0].description).toBe('Add user authentication');
      expect(result[0].features[1].scope).toBe('api');
    });

    it('should handle breaking changes correctly', () => {
      const testContent = `
      # [2.0.0](link) (2025-01-01)

      ### Features

      * feat!: Remove deprecated API ([abc1234](link))
      * **auth!:** Change authentication method ([def5678](link))`;

      const result = ChangelogParser.parseChangelog(testContent);

      expect(result).toHaveLength(1);
      expect(result[0].breakingChanges).toHaveLength(2);
      expect(result[0].features).toHaveLength(0);
      expect(result[0].breakingChanges[0].isBreaking).toBe(true);
    });

    it('should handle empty changelog content', () => {
      const result = ChangelogParser.parseChangelog('');
      expect(result).toHaveLength(0);
    });
  });
});
