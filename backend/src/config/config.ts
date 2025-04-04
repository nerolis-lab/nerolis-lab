import { DatabaseMigrationError } from '@src/domain/error/database/database-error.js';
import dotenv from 'dotenv';

export class BackendConfig {
  constructor() {
    dotenv.config();
  }

  get config() {
    const {
      NODE_ENV,
      DATABASE_MIGRATION,
      ROLLBACK_BATCHES,
      PORT,
      DB_HOST,
      DB_PORT,
      DB_USER,
      DB_PASS,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GENERATE_TIERLIST,
      DATABASE_NAME
    } = process.env;

    if (DATABASE_MIGRATION && DATABASE_MIGRATION !== 'UP' && DATABASE_MIGRATION !== 'DOWN') {
      throw new DatabaseMigrationError('DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN]');
    }

    if (!ROLLBACK_BATCHES && DATABASE_MIGRATION === 'DOWN') {
      logger.warn('ROLLBACK_BATCHES is not set, all migrations will be rolled back at once');
    }

    return {
      NODE_ENV: NODE_ENV ?? 'DEV',
      PORT: PORT ?? 3000,
      DATABASE_MIGRATION,
      ROLLBACK_BATCHES: ROLLBACK_BATCHES ? Number(ROLLBACK_BATCHES) : undefined,
      DB_HOST,
      DB_PORT,
      DB_USER,
      DB_PASS,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GENERATE_TIERLIST: GENERATE_TIERLIST === 'true',
      DATABASE_NAME: DATABASE_NAME ?? 'pokemonsleep'
    };
  }
}

export const config = new BackendConfig().config;
