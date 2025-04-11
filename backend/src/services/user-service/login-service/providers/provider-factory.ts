import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { AuthProvider } from 'sleepapi-common';
import type { AbstractProvider } from './abstract-provider.js';
import { DiscordProvider } from './discord/discord-provider.js';
import { GoogleProvider } from './google/google-provider.js';
import { PatreonProvider } from './patreon/patreon-provider.js';

export class ProviderFactory {
  private static providers: Record<AuthProvider, AbstractProvider<unknown>> = {
    [AuthProvider.Google]: GoogleProvider,
    [AuthProvider.Discord]: DiscordProvider,
    [AuthProvider.Patreon]: PatreonProvider
  };

  static getProvider(authProvider: AuthProvider) {
    const provider = this.providers[authProvider];
    if (!provider) {
      throw new BadRequestError(`Provider ${authProvider} not found`);
    }
    return provider;
  }
}
