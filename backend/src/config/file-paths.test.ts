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
    const customPath = '/custom/changelog.md';
    process.env.CHANGELOG_PATH = customPath;
    vi.mocked(existsSync).mockReturnValue(true);

    const result = FilePathResolver.getChangelogPath();

    expect(result).toBe(customPath);
    expect(existsSync).toHaveBeenCalledWith(customPath);
  });

  it('should fall back to project root when env var not set', () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const result = FilePathResolver.getChangelogPath().replaceAll('\\', '/');

    expect(result).toBe('/project/root/CHANGELOG.md');
  });

  it('should throw error when changelog not found', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    expect(() => FilePathResolver.getChangelogPath()).toThrow('CHANGELOG.md not found in any expected location');
  });
});
