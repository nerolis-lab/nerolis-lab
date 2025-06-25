import { ChangelogController } from '@src/controllers/changelog/changelog.controller.js';
import { existsSync, readFileSync } from 'fs';
import * as fileUtils from '@src/utils/file-utils/file-utils.js';
import { vi } from 'vitest';

vi.mock('fs');
vi.mock('@src/utils/file-utils/file-utils.js');

describe('changelog.controller', () => {
  let controller: ChangelogController;

  beforeEach(() => {
    controller = new ChangelogController();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('getChangelog', () => {
    it('should return changelog content from production path when available', async () => {
      const mockContent = '# Changelog\n\n## [1.0.0] - 2023-01-01\n- Initial release';
      const mockProductionPath = '/dist/CHANGELOG.md';

      vi.mocked(fileUtils.joinPath).mockReturnValueOnce(mockProductionPath).mockReturnValueOnce('/dev/CHANGELOG.md');
      vi.mocked(existsSync).mockReturnValueOnce(true);
      vi.mocked(readFileSync).mockReturnValue(mockContent);

      const result = await controller.getChangelog();

      expect(result).toBe(mockContent);
      expect(existsSync).toHaveBeenCalledWith(mockProductionPath);
      expect(readFileSync).toHaveBeenCalledWith(mockProductionPath, 'utf-8');
    });

    it('should fallback to development path when production path not available', async () => {
      const mockContent = '# Changelog\n\n## [1.0.0] - 2023-01-01\n- Initial release';
      const mockProductionPath = '/dist/CHANGELOG.md';
      const mockDevelopmentPath = '/dev/CHANGELOG.md';

      vi.mocked(fileUtils.joinPath).mockReturnValueOnce(mockProductionPath).mockReturnValueOnce(mockDevelopmentPath);
      vi.mocked(existsSync).mockReturnValueOnce(false).mockReturnValueOnce(true);
      vi.mocked(readFileSync).mockReturnValue(mockContent);

      const result = await controller.getChangelog();

      expect(result).toBe(mockContent);
      expect(existsSync).toHaveBeenCalledTimes(2);
      expect(existsSync).toHaveBeenNthCalledWith(1, mockProductionPath);
      expect(existsSync).toHaveBeenNthCalledWith(2, mockDevelopmentPath);
      expect(readFileSync).toHaveBeenCalledWith(mockDevelopmentPath, 'utf-8');
    });

    it('should throw error when changelog file not found', async () => {
      vi.mocked(fileUtils.joinPath).mockReturnValueOnce('/dist/CHANGELOG.md').mockReturnValueOnce('/dev/CHANGELOG.md');
      vi.mocked(existsSync).mockReturnValue(false);

      await expect(controller.getChangelog()).rejects.toThrow('Failed to read changelog file');
      expect(existsSync).toHaveBeenCalledTimes(2);
    });

    it('should throw error when file read fails', async () => {
      vi.mocked(fileUtils.joinPath).mockReturnValueOnce('/dist/CHANGELOG.md');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File read error');
      });

      await expect(controller.getChangelog()).rejects.toThrow('Failed to read changelog file');
    });
  });
});
