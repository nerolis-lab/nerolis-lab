import type { Static, TSchema } from '@sinclair/typebox';
import { Kind, Type } from '@sinclair/typebox';
import type { Knex } from 'knex';
import { DatabaseInsertError, DatabaseNotFoundError } from '../../domain/error/database/database-error.js';
import { chunkArray } from '../../utils/database-utils/array-utils.js';
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
    options?: { sort?: SortKey<DBEntityType> | Array<SortKey<DBEntityType>> }
  ): Promise<DBEntityType | undefined> {
    const knex = await DatabaseService.getKnex();
    const queryToExecute = this.#createQuery(knex.select(), filter, options).first();
    const result: DBEntityType | undefined = await queryToExecute;
    return result ? this.postProcess(result) : undefined;
  }

  async get(
    filter: Filter<DBEntityType>,
    options?: { sort?: SortKey<DBEntityType> | Array<SortKey<DBEntityType>> }
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
    }
  ): Promise<Array<DBEntityType>> {
    const knex = await DatabaseService.getKnex();
    let query = this.#createQuery(knex.select(), filter, options);
    query = options?.limit !== undefined ? query.limit(options.limit) : query;
    query = options?.offset !== undefined ? query.offset(options.offset) : query;

    const result = (await query) as Array<DBEntityType>;
    return result.map((row) => this.postProcess(row));
  }

  async insert(entity: Omit<DBEntityType, 'id' | 'version'>): Promise<DBEntityType> {
    const knex = await DatabaseService.getKnex();

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.get({ id: result[0] } as any);
  }

  async update(entity: DBEntityType): Promise<DBEntityType> {
    const knex = await DatabaseService.getKnex();

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.get({ id: entity.id } as any);
  }

  async delete(filter: Filter<DBEntityType> = {}): Promise<number> {
    const knex = await DatabaseService.getKnex();

    const queryToExecute = this.#createQuery(knex.delete(), filter, {});
    return await queryToExecute;
  }

  async upsert(params: { updated: Omit<DBEntityType, 'id' | 'version'>; filter: Filter<DBEntityType> }) {
    const { updated, filter } = params;
    const prev = await this.find(filter);

    if (prev) {
      const entityToUpdate = { ...updated, id: prev.id, version: prev.version } as DBEntityType;
      return await this.update(entityToUpdate);
    } else {
      return await this.insert(updated);
    }
  }

  async batchInsert(
    entities: Array<Omit<DBEntityType, 'id'>>,
    chunkSize = 1000,
    enableLogging?: boolean
  ): Promise<void> {
    const knex = await DatabaseService.getKnex();

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

  public async count(filter: Filter<DBEntityType> = {}) {
    const knex = await DatabaseService.getKnex();
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
