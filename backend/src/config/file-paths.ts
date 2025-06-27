import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import { existsSync } from 'fs';
import { join } from 'path';
import { findProjectRoot } from '../utils/project-utils.js';

export class FilePathResolver {
  static projectRoot?: string;

  static getProjectRoot(): string {
    if (!this.projectRoot) {
      this.projectRoot = findProjectRoot();
    }
    return this.projectRoot;
  }

  static getChangelogPath(): string {
    if (process.env.CHANGELOG_PATH && existsSync(process.env.CHANGELOG_PATH)) {
      return process.env.CHANGELOG_PATH;
    }

    // Try project root detection
    try {
      const projectRoot = this.getProjectRoot();
      const changelogPath = join(projectRoot, 'CHANGELOG.md');

      if (existsSync(changelogPath)) {
        return changelogPath;
      }
    } catch {
      // Fall through to manual fallbacks if project root detection fails
    }

    // Manual fallback paths for common scenarios
    const fallbackPaths = [
      join(process.cwd(), '..', 'CHANGELOG.md'), // From backend/ to parent
      join(process.cwd(), 'CHANGELOG.md'), // From current directory
      join(__dirname, '..', '..', '..', 'CHANGELOG.md') // From backend/src/config to root
    ];

    for (const fallbackPath of fallbackPaths) {
      if (existsSync(fallbackPath)) {
        return fallbackPath;
      }
    }

    throw new ProgrammingError('CHANGELOG.md not found in any expected location');
  }
}
