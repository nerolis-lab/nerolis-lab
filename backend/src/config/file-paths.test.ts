import { existsSync } from 'fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilePathResolver } from './file-paths.js';

vi.mock('fs');
vi.mock('../utils/project-utils.js', () => ({
  findProjectRoot: vi.fn().mockReturnValue('/project/root')
}));

describe('FilePathResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CHANGELOG_PATH;
  });

  it('should use environment variable when available', () => {
    process.env.CHANGELOG_PATH = '/custom/changelog.md';
    vi.mocked(existsSync).mockReturnValue(true);

    const result = FilePathResolver.getChangelogPath();

    expect(result).toBe('/custom/changelog.md');
    expect(existsSync).toHaveBeenCalledWith('/custom/changelog.md');
  });

  it('should fall back to project root when env var not set', () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const result = FilePathResolver.getChangelogPath();

    expect(result).toBe('/project/root/CHANGELOG.md');
  });

  it('should throw error when changelog not found', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(() => FilePathResolver.getChangelogPath()).toThrow('CHANGELOG.md not found in any expected location');
  });
});
