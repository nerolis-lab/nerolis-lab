import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { GoogleProvider } from '@src/services/user-service/login-service/providers/google/google-provider.js';
import { ProviderFactory } from '@src/services/user-service/login-service/providers/provider-factory.js';
import { AuthProvider } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('ProviderFactory', function () {
  it('should return the correct provider', () => {
    expect(ProviderFactory.getProvider(AuthProvider.Google)).toBe(GoogleProvider);
  });

  it('should throw an error if the provider is not found', () => {
    expect(() => ProviderFactory.getProvider('not-a-provider' as AuthProvider)).toThrowError(
      new BadRequestError('Provider not-a-provider not found')
    );
  });

  it('should have a provider for each auth provider', () => {
    Object.values(AuthProvider).forEach((provider) => {
      expect(ProviderFactory.getProvider(provider)).toBeDefined();
    });
  });
});
