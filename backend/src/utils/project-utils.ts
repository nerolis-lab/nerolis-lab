import { existsSync } from 'fs';
import { dirname, join } from 'path';

/**
 * Finds the project root by walking up the directory tree looking for monorepo indicators
 */
export function findProjectRoot(startPath: string = process.cwd()): string {
  let currentPath = startPath;

  while (currentPath !== dirname(currentPath)) {
    // Check for monorepo root indicators
    const hasChangelogMd = existsSync(join(currentPath, 'CHANGELOG.md'));
    const hasGitRoot = existsSync(join(currentPath, '.git'));
    const packageJsonPath = join(currentPath, 'package.json');

    if (existsSync(packageJsonPath)) {
      // If we find CHANGELOG.md or .git at this level, this is likely the root
      if (hasChangelogMd || hasGitRoot) {
        return currentPath;
      }
    }

    currentPath = dirname(currentPath);
  }

  // Fallback: just find any package.json
  currentPath = startPath;
  while (currentPath !== dirname(currentPath)) {
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      return currentPath;
    }
    currentPath = dirname(currentPath);
  }

  throw new Error('Could not find project root (no package.json found)');
}

/**
 * Gets a file path relative to the project root
 */
export function getProjectFile(relativePath: string): string {
  const projectRoot = findProjectRoot();
  return join(projectRoot, relativePath);
}
