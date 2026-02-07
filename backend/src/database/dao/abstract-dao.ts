import type { Static, TSchema } from '@sinclair/typebox';
import { Kind, Type } from '@sinclair/typebox';
import type { Knex } from 'knex';
import { chunkArray } from 'sleepapi-common';
import { DatabaseInsertError, DatabaseNotFoundError } from '../../domain/error/database/database-error.js';
import type { Filter } from '../../utils/database-utils/find-filter.js';
import { AbstractFilterOperator } from '../../utils/database-utils/find-filter.js';
import { DatabaseService } from '../database-service.js';

export const DBWithVersionedIdSchema = Type.Object({
  id: Type.Number({ minimum: 0 }),
  version: Type.Number({ minimum: 1 })
});

export const DBEntitySchema = DBWithVersionedIdSchema;
export type DBEntity = Static<typeof DBEntitySchema>;

type SortKey<DBEntityType extends object> = keyof DBEntityType extends string
  ? `+${keyof DBEntityType}` | `-${keyof DBEntityType}`
  : never;

export abstract class AbstractDAO<
  DBEntitySchemaType extends typeof DBEntitySchema,
  DBEntityType extends DBEntity = Static<DBEntitySchemaType>
> {
  public abstract get tableName(): string;
  protected abstract get schema(): DBEntitySchemaType;

  async find(
    filter: Filter<DBEntityType>,
    options?: { sort?: SortKey<DBEntityType> | Array<SortKey<DBEntityType>>; trx?: Knex.Transaction }
  ): Promise<DBEntityType | undefined> {
    const knex = await DatabaseService.getKnex(options?.trx);
    const queryToExecute = this.#createQuery(knex.select(), filter, options).first();
    const result: DBEntityType | undefined = await queryToExecute;
    return result ? this.postProcess(result) : undefined;
  }

  async get(
    filter: Filter<DBEntityType>,
    options?: { sort?: SortKey<DBEntityType> | Array<SortKey<DBEntityType>>; trx?: Knex.Transaction }
  ): Promise<DBEntityType> {
    const result = await this.find(filter, options);
    if (!result) {
      throw new DatabaseNotFoundError(
        `Unable to find entry in ${this.tableName} with filter [${JSON.stringify(filter)}]`
      );
    }
    return result;
  }

  async findMultiple(
    filter: Filter<DBEntityType> = {},
    options?: {
      sort?: SortKey<DBEntityType> | Array<SortKey<DBEntityType>>;
      limit?: number;
      offset?: number;
      trx?: Knex.Transaction;
    }
  ): Promise<Array<DBEntityType>> {
    const knex = await DatabaseService.getKnex(options?.trx);
    let query = this.#createQuery(knex.select(), filter, options);
    query = options?.limit !== undefined ? query.limit(options.limit) : query;
    query = options?.offset !== undefined ? query.offset(options.offset) : query;

    const result = (await query) as Array<DBEntityType>;
    return result.map((row) => this.postProcess(row));
  }

  async insert(
    entity: Omit<DBEntityType, 'id' | 'version'>,
    options?: { trx?: Knex.Transaction }
  ): Promise<DBEntityType> {
    const knex = await DatabaseService.getKnex(options?.trx);

    const result = await knex
      .insert(
        this.preProcess({
          ...entity,
          id: undefined,
          version: 1
        })
      )
      .into(this.tableName);

    if (result.length !== 1) {
      throw new DatabaseInsertError(`Insert expected one element but was ${result.length}`);
    }

    return this.get({ id: result[0] } as Filter<DBEntityType>, options);
  }

  async update(entity: DBEntityType, options?: { trx?: Knex.Transaction }): Promise<DBEntityType> {
    const knex = await DatabaseService.getKnex(options?.trx);

    await knex
      .update(
        this.preProcess({
          ...entity,
          version: (entity.version ?? 0) + 1,
          ...('updated_at' in entity && { updated_at: new Date() })
        })
      )
      .into(this.tableName)
      .where({ id: entity.id });

    return this.get({ id: entity.id } as Filter<DBEntityType>, options);
  }

  async delete(filter: Filter<DBEntityType> = {}, options?: { trx?: Knex.Transaction }): Promise<number> {
    const knex = await DatabaseService.getKnex(options?.trx);

    const queryToExecute = this.#createQuery(knex.delete(), filter, {});
    return await queryToExecute;
  }

  // TODO: could probably use insert on conflict merge instead
  async upsert(params: {
    updated: Omit<DBEntityType, 'id' | 'version'>;
    filter: Filter<DBEntityType>;
    options?: { trx?: Knex.Transaction };
  }) {
    const { updated, filter, options } = params;
    const prev = await this.find(filter, options);

    if (prev) {
      const entityToUpdate = { ...updated, id: prev.id, version: prev.version } as DBEntityType;
      return await this.update(entityToUpdate, options);
    } else {
      return await this.insert(updated, options);
    }
  }

  // TODO: could probably use insert on conflict ignore instead
  async findOrInsert(params: {
    filter: Filter<DBEntityType>;
    entityToInsert: Omit<DBEntityType, 'id' | 'version'>;
    options?: { trx?: Knex.Transaction };
  }): Promise<DBEntityType> {
    const { filter, entityToInsert, options } = params;
    const existing = await this.find(filter, options);

    if (existing) {
      return existing;
    } else {
      return await this.insert(entityToInsert, options);
    }
  }

  async batchInsert(params: {
    entities: Array<Omit<DBEntityType, 'id'>>;
    chunkSize?: number;
    enableLogging?: boolean;
    options?: { trx?: Knex.Transaction };
  }) {
    const { entities, chunkSize = 1000, enableLogging = false, options } = params;
    const knex = await DatabaseService.getKnex(options?.trx);

    let amountInserted = 0;

    for (const chunk of chunkArray(entities, chunkSize)) {
      await knex.batchInsert(
        this.tableName,
        chunk.map((entity) =>
          this.preProcess({
            ...entity,
            id: undefined,
            version: 1
          })
        )
      );
      amountInserted += chunk.length;
      if (enableLogging && amountInserted > 1) logger.debug(`Inserted ${amountInserted} into ${this.tableName}`);
    }
  }

  #createQuery(
    queryBuilder: Knex.QueryBuilder,
    filter: Filter<DBEntityType>,
    options?: { sort?: SortKey<DBEntityType> | SortKey<DBEntityType>[] }
  ) {
    let query = queryBuilder.from(this.tableName);
    Object.entries(filter).forEach(([key, filterValue]) => {
      if (key === 'some') {
        return;
      }

      const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
      filterValues.forEach((it) => {
        if (it instanceof AbstractFilterOperator) {
          query = it.apply(key, query);
        } else if (filterValue !== undefined) {
          query = query.where(key, filterValue);
        }
      });
    });
    const { some } = filter;
    if (some) {
      query = query.andWhere((subquery) => {
        Object.entries(some).forEach(([key, filterValue]) => {
          const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
          filterValues.forEach((it) => {
            if (it instanceof AbstractFilterOperator) {
              subquery = it.apply(key, subquery.or);
            } else if (filterValue !== undefined) {
              subquery = subquery.or.where(key, filterValue);
            }
          });
        });
      });
    }
    if (options?.sort) {
      const sortColumns = Array.isArray(options?.sort) ? options.sort : [options.sort];
      sortColumns.forEach((sortColumn) => {
        const order = sortColumn.substring(0, 1) === '-' ? ('desc' as const) : ('asc' as const);
        const column = sortColumn.substring(1);
        query = query.orderBy(column, order);
      });
    }
    return query;
  }

  public async count(filter: Filter<DBEntityType> = {}, options?: { trx?: Knex.Transaction }) {
    const knex = await DatabaseService.getKnex(options?.trx);
    const [{ count }] = await this.#createQuery(knex.count('*', { as: 'count' }), filter);
    return Number(count);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected preProcess<X extends object | undefined>(row: X): any {
    if (row === undefined) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const { created_at, ...processed } = row as any;

    Object.entries(processed).forEach(([key, value]) => {
      if (value === undefined) {
        processed[key] = null;
      } else if (value instanceof Date) {
        processed[key] = value.toISOString().slice(0, 19).replace('T', ' ');
      }
    });
    return processed;
  }

  protected postProcess<X extends object | undefined>(row: X): X {
    if (row === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as any;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = { ...row } as any;
    Object.entries(this.schema.properties).forEach(([key, value]) => {
      const schema: TSchema = value;
      const current = result[key];

      if (current === null) {
        result[key] = undefined;
      }

      if (schema[Kind] === 'Boolean') {
        if ((current || current === 0) && !(current instanceof Boolean)) {
          result[key] = Boolean(current);
        }
      } else if (schema[Kind] === 'Number') {
        if (!(current instanceof Number)) {
          result[key] = Number(current);
        }
      } else if (schema[Kind] === 'Date') {
        if (!isNaN(Date.parse(current))) {
          result[key] = new Date(current + 'Z');
        }
      }
    });
    return result;
  }
}
