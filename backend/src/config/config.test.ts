import { BackendConfig } from '@src/config/config.js';
import { describe, expect, it } from 'vitest';

describe('config', () => {
  it('shall use default values', () => {
    const backendConfig = new BackendConfig();
    process.env = {};

    expect(backendConfig.config).toMatchInlineSnapshot(`
      {
        "DATABASE_MIGRATION": undefined,
        "DATABASE_NAME": "pokemonsleep",
        "DB_HOST": undefined,
        "DB_PASS": undefined,
        "DB_PORT": undefined,
        "DB_USER": undefined,
        "GENERATE_TIERLIST": false,
        "GOOGLE_CLIENT_ID": undefined,
        "GOOGLE_CLIENT_SECRET": undefined,
        "NODE_ENV": "DEV",
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

    expect(backendConfig.config).toMatchInlineSnapshot(`
      {
        "DATABASE_MIGRATION": "UP",
        "DATABASE_NAME": "some-database",
        "DB_HOST": "some-host",
        "DB_PASS": "some-pass",
        "DB_PORT": "1",
        "DB_USER": "some-user",
        "GENERATE_TIERLIST": false,
        "GOOGLE_CLIENT_ID": "some-google-id",
        "GOOGLE_CLIENT_SECRET": "some-google-secret",
        "NODE_ENV": "DEV",
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
