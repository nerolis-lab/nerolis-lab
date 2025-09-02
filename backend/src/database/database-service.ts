import { config } from '@src/config/config.js';
import { DatabaseConnectionError } from '@src/domain/error/database/database-error.js';
import type { Knex } from 'knex';
import knex from 'knex';

class DatabaseServiceImpl {
  #knex: Knex | undefined;

  async getKnex(trx?: Knex.Transaction) {
    if (trx) {
      return trx;
    }

    if (!this.#knex) {
      const host = config.DB_HOST;
      const port = config.DB_PORT;
      const user = config.DB_USER;
      const password = config.DB_PASS;

      if (!host || !port || !user || !password) {
        throw new DatabaseConnectionError('Missing environment variables for database connection');
      }

      this.#knex = knex({
        client: 'mysql2',
        connection: {
          host,
          port: +port,
          user,
          password,
          database: config.DATABASE_NAME
        },
        migrations: {
          loadExtensions: ['.js', '.ts']
        }
      });
    }

    return trx || this.#knex;
  }

  async transaction<T>(
    callback: (trx: Knex.Transaction) => Promise<T>,
    isolationLevel?: Knex.IsolationLevels
  ): Promise<T> {
    const knex = await this.getKnex();
    return knex.transaction(callback, { isolationLevel });
  }
}

export const DatabaseService = new DatabaseServiceImpl();
