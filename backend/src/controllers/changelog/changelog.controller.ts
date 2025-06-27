import { ChangelogService } from '@src/services/changelog-service/changelog-service.js';
import tsoa from '@tsoa/runtime';
import { type Release } from 'sleepapi-common';
const { Controller, Get, Route, Tags } = tsoa;

@Route('changelog')
@Tags('changelog')
export class ChangelogController extends Controller {
  @Get('/')
  public async getChangelog(): Promise<Release[]> {
    return ChangelogService.getChangelog();
  }
}
