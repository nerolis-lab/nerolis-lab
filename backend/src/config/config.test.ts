import { BackendConfig } from '@src/config/config.js';
import { describe, expect, it } from 'vitest';

describe('config', () => {
  it('shall use default values', () => {
    const backendConfig = new BackendConfig();
    process.env = {};

    expect(backendConfig.config).toMatchInlineSnapshot(`
      {
        "DATABASE_MIGRATION": undefined,
        "DATABASE_NAME": "Missing env variable for DATABASE_NAME, you can add it to backend/.env",
        "DB_HOST": "Missing env variable for DB_HOST, you can add it to backend/.env",
        "DB_PASS": "Missing env variable for DB_PASS, you can add it to backend/.env",
        "DB_PORT": "Missing env variable for DB_PORT, you can add it to backend/.env",
        "DB_USER": "Missing env variable for DB_USER, you can add it to backend/.env",
        "DISCORD_CLIENT_ID": "Missing env variable for DISCORD_CLIENT_ID, you can add it to backend/.env",
        "DISCORD_CLIENT_SECRET": "Missing env variable for DISCORD_CLIENT_SECRET, you can add it to backend/.env",
        "GENERATE_TIERLIST": false,
        "GOOGLE_CLIENT_ID": "Missing env variable for GOOGLE_CLIENT_ID, you can add it to backend/.env",
        "GOOGLE_CLIENT_SECRET": "Missing env variable for GOOGLE_CLIENT_SECRET, you can add it to backend/.env",
        "NODE_ENV": "DEV",
        "PATREON_CLIENT_ID": "Missing env variable for PATREON_CLIENT_ID, you can add it to backend/.env",
        "PATREON_CLIENT_SECRET": "Missing env variable for PATREON_CLIENT_SECRET, you can add it to backend/.env",
        "PORT": 3000,
        "ROLLBACK_BATCHES": undefined,
      }
    `);
  });

  it('shall accept valid values', () => {
    const backendConfig = new BackendConfig();
    process.env.DATABASE_MIGRATION = 'UP';
    process.env.DATABASE_NAME = 'some-database';
    process.env.DB_HOST = 'some-host';
    process.env.DB_PASS = 'some-pass';
    process.env.DB_PORT = '1';
    process.env.DB_USER = 'some-user';
    process.env.GENERATE_TIERLIST = 'false';
    process.env.NODE_ENV = 'DEV';
    process.env.PORT = '2';
    process.env.ROLLBACK_BATCHES = '3';
    process.env.GOOGLE_CLIENT_ID = 'some-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'some-google-secret';
    process.env.DISCORD_CLIENT_ID = 'some-discord-id';
    process.env.DISCORD_CLIENT_SECRET = 'some-discord-secret';
    process.env.PATREON_CLIENT_ID = 'some-patreon-id';
    process.env.PATREON_CLIENT_SECRET = 'some-patreon-secret';

    expect(backendConfig.config).toMatchInlineSnapshot(`
      {
        "DATABASE_MIGRATION": "UP",
        "DATABASE_NAME": "some-database",
        "DB_HOST": "some-host",
        "DB_PASS": "some-pass",
        "DB_PORT": "1",
        "DB_USER": "some-user",
        "DISCORD_CLIENT_ID": "some-discord-id",
        "DISCORD_CLIENT_SECRET": "some-discord-secret",
        "GENERATE_TIERLIST": false,
        "GOOGLE_CLIENT_ID": "some-google-id",
        "GOOGLE_CLIENT_SECRET": "some-google-secret",
        "NODE_ENV": "DEV",
        "PATREON_CLIENT_ID": "some-patreon-id",
        "PATREON_CLIENT_SECRET": "some-patreon-secret",
        "PORT": "2",
        "ROLLBACK_BATCHES": 3,
      }
    `);
  });

  it('shall throw if DATABASE_MIGRATION is set to unexpected value', () => {
    const backendConfig = new BackendConfig();
    process.env.DATABASE_MIGRATION = 'incorrect';

    expect(() => backendConfig.config).toThrowErrorMatchingInlineSnapshot(
      `[DatabaseMigrationError: DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN]]`
    );
  });
});
