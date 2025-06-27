import { readFileSync } from 'fs';
import { ChangelogParser, type Release } from 'sleepapi-common';
import { FilePathResolver } from '../../config/file-paths.js';

class ChangelogServiceImpl {
  public async getChangelog(): Promise<Release[]> {
    const changelogPath = FilePathResolver.getChangelogPath();
    const content = readFileSync(changelogPath, 'utf-8');
    return ChangelogParser.parseChangelog(content);
  }
}

export const ChangelogService = new ChangelogServiceImpl();
