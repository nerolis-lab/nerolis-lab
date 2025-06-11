import { existsSync, readFileSync } from 'fs';
import { globby } from 'globby';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const DOCS_DIR = process.cwd();

describe('Documentation Content Structure', () => {
  describe('Component Documentation', () => {
    it('should have all expected component files', async () => {
      const componentFiles = await globby(['components/*.md'], { cwd: DOCS_DIR });
      const expectedFiles = [
        'components/index.md',
        'components/frontend.md',
        'components/backend.md',
        'components/common.md'
      ];

      expectedFiles.forEach((file) => {
        expect(componentFiles).toContain(file);
        expect(existsSync(join(DOCS_DIR, file))).toBe(true);
      });
    });

    it('should have Development Guidelines section in each component', async () => {
      const componentFiles = await globby(['components/*.md'], {
        cwd: DOCS_DIR,
        ignore: ['components/index.md'] // Skip the overview page
      });

      for (const file of componentFiles) {
        const filePath = join(DOCS_DIR, file);
        const content = readFileSync(filePath, 'utf-8');

        expect(content).toMatch(/## Development Guidelines/i);
      }
    });
  });

  describe('Getting Started Documentation', () => {
    it('should have all expected getting started files', async () => {
      const gettingStartedFiles = await globby(['getting-started/*.md'], { cwd: DOCS_DIR });
      const expectedFiles = [
        'getting-started/contributing.md',
        'getting-started/development-setup.md',
        'getting-started/linear-history.md'
      ];

      expectedFiles.forEach((file) => {
        expect(gettingStartedFiles).toContain(file);
        expect(existsSync(join(DOCS_DIR, file))).toBe(true);
      });
    });
  });

  describe('API Documentation', () => {
    it('should have API documentation directory', () => {
      expect(existsSync(join(DOCS_DIR, 'api'))).toBe(true);
    });
  });

  describe('Root Documentation', () => {
    it('should have index.md file', () => {
      expect(existsSync(join(DOCS_DIR, 'index.md'))).toBe(true);
    });

    it('should have proper frontmatter in index.md', () => {
      const content = readFileSync(join(DOCS_DIR, 'index.md'), 'utf-8');

      // Check for frontmatter presence
      expect(content).toMatch(/^---\n[\s\S]*?\n---/);
    });
  });
});
