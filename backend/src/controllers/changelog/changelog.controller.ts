import tsoa from '@tsoa/runtime';
import { existsSync, readFileSync } from 'fs';
import { joinPath } from '../../utils/file-utils/file-utils.js';
const { Controller, Get, Route, Tags } = tsoa;

@Route('changelog')
@Tags('changelog')
export class ChangelogController extends Controller {
  @Get('/')
  public async getChangelog(): Promise<string> {
    try {
      // Try production path first (dist/CHANGELOG.md)
      const productionPath = joinPath('../../CHANGELOG.md', import.meta.url);
      if (existsSync(productionPath)) {
        const content = readFileSync(productionPath, 'utf-8');
        return content;
      }

      // Fall back to development path (project root)
      const developmentPath = joinPath('../../../../CHANGELOG.md', import.meta.url);
      if (existsSync(developmentPath)) {
        const content = readFileSync(developmentPath, 'utf-8');
        return content;
      }

      throw new Error('CHANGELOG.md not found');
    } catch {
      throw new Error('Failed to read changelog file');
    }
  }
}
