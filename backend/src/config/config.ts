import { DatabaseMigrationError } from '@src/domain/error/database/database-error.js';
import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import dotenv from 'dotenv';

export class BackendConfig {
  constructor() {
    dotenv.config();
  }

  get config() {
    const { NODE_ENV, DATABASE_MIGRATION, ROLLBACK_BATCHES, PORT, GENERATE_TIERLIST } = process.env;

    if (DATABASE_MIGRATION && DATABASE_MIGRATION !== 'UP' && DATABASE_MIGRATION !== 'DOWN') {
      throw new DatabaseMigrationError('DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN]');
    }

    if (!ROLLBACK_BATCHES && DATABASE_MIGRATION === 'DOWN') {
      logger.warn('ROLLBACK_BATCHES is not set, all migrations will be rolled back at once');
    }

    const getProductionVariable = (key: string): string => {
      const value = process.env[key];
      if (NODE_ENV === 'PROD' && !value) {
        throw new ProgrammingError(`${key} is required in production`);
      }
      return value ?? `Missing env variable for ${key}, you can add it to backend/.env`;
    };

    return {
      NODE_ENV: NODE_ENV ?? 'DEV',
      PORT: PORT ?? 3000,
      DATABASE_MIGRATION,
      ROLLBACK_BATCHES: ROLLBACK_BATCHES ? Number(ROLLBACK_BATCHES) : undefined,
      DB_HOST: getProductionVariable('DB_HOST'),
      DB_PORT: getProductionVariable('DB_PORT'),
      DB_USER: getProductionVariable('DB_USER'),
      DB_PASS: getProductionVariable('DB_PASS'),
      GOOGLE_CLIENT_ID: getProductionVariable('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: getProductionVariable('GOOGLE_CLIENT_SECRET'),
      DISCORD_CLIENT_ID: getProductionVariable('DISCORD_CLIENT_ID'),
      DISCORD_CLIENT_SECRET: getProductionVariable('DISCORD_CLIENT_SECRET'),
      PATREON_CLIENT_ID: getProductionVariable('PATREON_CLIENT_ID'),
      PATREON_CLIENT_SECRET: getProductionVariable('PATREON_CLIENT_SECRET'),
      GENERATE_TIERLIST: GENERATE_TIERLIST === 'true',
      DATABASE_NAME: getProductionVariable('DATABASE_NAME')
    };
  }
}

export const config = new BackendConfig().config;
