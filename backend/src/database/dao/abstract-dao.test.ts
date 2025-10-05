import { Type } from '@sinclair/typebox';
import { DatabaseService } from '@src/database/database-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import type { Knex } from 'knex';
import { beforeEach, describe, expect, it } from 'vitest';
import { AbstractDAO, DBEntitySchema } from './abstract-dao.js';

const TestEntitySchema = Type.Composite([
  DBEntitySchema,
  Type.Object({
    name: Type.String(),
    value: Type.Number()
  })
]);

class TestDAO extends AbstractDAO<typeof TestEntitySchema> {
  public tableName = 'test_entity';
  public schema = TestEntitySchema;
}

// Initialize the DaoFixture - don't recreate databases each test for better performance
DaoFixture.init({ enforceForeignKeyConstraints: true });

describe('AbstractDAO', () => {
  const testDAO: TestDAO = new TestDAO();

  beforeEach(async () => {
    // Create table only if it doesn't exist (DaoFixture truncates but doesn't drop tables)
    const knex = await DatabaseService.getKnex();
    const hasTable = await knex.schema.hasTable('test_entity');
    if (!hasTable) {
      await knex.schema.createTable('test_entity', (table) => {
        table.increments('id').primary();
        table.integer('version').notNullable().defaultTo(1);
        table.string('name').notNullable();
        table.integer('value').notNullable();
      });
    }
  });

  describe('basic DAO operations', () => {
    it('should insert and find entity', async () => {
      const inserted = await testDAO.insert({ name: 'test', value: 42 });

      expect(inserted).toMatchObject({
        id: expect.any(Number),
        version: 1,
        name: 'test',
        value: 42
      });

      const found = await testDAO.find({ name: 'test' });
      expect(found).toEqual(inserted);
    });

    it('should update entity', async () => {
      const inserted = await testDAO.insert({ name: 'test', value: 42 });
      const updated = await testDAO.update({ ...inserted, value: 100 });

      expect(updated).toMatchObject({
        id: inserted.id,
        version: 2,
        name: 'test',
        value: 100
      });
    });

    it('should delete entity', async () => {
      await testDAO.insert({ name: 'test1', value: 42 });
      await testDAO.insert({ name: 'test2', value: 43 });

      const deletedCount = await testDAO.delete({ name: 'test1' });
      expect(deletedCount).toBe(1);

      const remaining = await testDAO.findMultiple();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('test2');
    });

    it('should upsert entity (insert new)', async () => {
      const result = await testDAO.upsert({
        updated: { name: 'new', value: 123 },
        filter: { name: 'new' }
      });

      expect(result).toMatchObject({
        id: expect.any(Number),
        version: 1,
        name: 'new',
        value: 123
      });
    });

    it('should upsert entity (update existing)', async () => {
      const inserted = await testDAO.insert({ name: 'existing', value: 50 });

      const result = await testDAO.upsert({
        updated: { name: 'existing', value: 100 },
        filter: { name: 'existing' }
      });

      expect(result).toMatchObject({
        id: inserted.id,
        version: 2,
        name: 'existing',
        value: 100
      });
    });

    it('should count entities', async () => {
      await testDAO.insert({ name: 'count1', value: 1 });
      await testDAO.insert({ name: 'count2', value: 2 });
      await testDAO.insert({ name: 'other', value: 3 });

      const totalCount = await testDAO.count();
      expect(totalCount).toBe(3);

      const filteredCount = await testDAO.count({ name: 'count1' });
      expect(filteredCount).toBe(1);
    });

    it('should findOrInsert - insert when entity does not exist', async () => {
      const result = await testDAO.findOrInsert({
        filter: { name: 'not-existing' },
        entityToInsert: { name: 'not-existing', value: 999 }
      });

      expect(result).toMatchObject({
        id: expect.any(Number),
        version: 1,
        name: 'not-existing',
        value: 999
      });

      // Verify it was actually inserted
      const found = await testDAO.find({ name: 'not-existing' });
      expect(found).toEqual(result);
    });

    it('should findOrInsert - return existing entity when found', async () => {
      const existing = await testDAO.insert({ name: 'existing-entity', value: 123 });

      const result = await testDAO.findOrInsert({
        filter: { name: 'existing-entity' },
        entityToInsert: { name: 'existing-entity', value: 456 } // Different value should be ignored
      });

      expect(result).toEqual(existing);
      expect(result.value).toBe(123); // Original value, not the new one
    });

    it('should findOrInsert with complex filter', async () => {
      await testDAO.insert({ name: 'complex1', value: 100 });
      await testDAO.insert({ name: 'complex2', value: 200 });

      // Find existing with value filter
      const result1 = await testDAO.findOrInsert({
        filter: { value: 100 },
        entityToInsert: { name: 'should-not-insert', value: 300 }
      });

      expect(result1.name).toBe('complex1');
      expect(result1.value).toBe(100);

      // Insert new with value filter that doesn't match
      const result2 = await testDAO.findOrInsert({
        filter: { value: 999 },
        entityToInsert: { name: 'new-complex', value: 999 }
      });

      expect(result2.name).toBe('new-complex');
      expect(result2.value).toBe(999);
    });
  });

  describe('transaction parameter support', () => {
    it('should accept transaction parameter in all methods', async () => {
      const mockTrx = (await DatabaseService.getKnex()) as unknown as Knex.Transaction;

      // Test all methods accept transaction parameter without throwing
      const inserted = await testDAO.insert({ name: 'tx-test', value: 1 }, { trx: mockTrx });
      expect(inserted.name).toBe('tx-test');

      const found = await testDAO.find({ name: 'tx-test' }, { trx: mockTrx });
      expect(found).toBeDefined();

      const updated = await testDAO.update({ ...inserted, value: 2 }, { trx: mockTrx });
      expect(updated.value).toBe(2);

      const multiple = await testDAO.findMultiple({}, { trx: mockTrx });
      expect(multiple.length).toBeGreaterThan(0);

      const count = await testDAO.count({}, { trx: mockTrx });
      expect(count).toBeGreaterThan(0);

      await testDAO.batchInsert({
        entities: [
          { name: 'batch1', value: 1, version: 1 },
          { name: 'batch2', value: 2, version: 1 }
        ],
        options: { trx: mockTrx }
      });

      const upserted = await testDAO.upsert({
        updated: { name: 'upsert-test', value: 99 },
        filter: { name: 'upsert-test' },
        options: { trx: mockTrx }
      });
      expect(upserted.name).toBe('upsert-test');

      const foundOrInserted = await testDAO.findOrInsert({
        filter: { name: 'find-or-insert-test' },
        entityToInsert: { name: 'find-or-insert-test', value: 77 },
        options: { trx: mockTrx }
      });
      expect(foundOrInserted.name).toBe('find-or-insert-test');

      // Clean up
      await testDAO.delete({ name: 'tx-test' }, { trx: mockTrx });
      await testDAO.delete({ name: 'batch1' }, { trx: mockTrx });
      await testDAO.delete({ name: 'batch2' }, { trx: mockTrx });
      await testDAO.delete({ name: 'upsert-test' }, { trx: mockTrx });
      await testDAO.delete({ name: 'find-or-insert-test' }, { trx: mockTrx });
    });

    it('should handle transaction parameter in find operations with options', async () => {
      await testDAO.insert({ name: 'sort1', value: 2 });
      await testDAO.insert({ name: 'sort2', value: 1 });

      const knex = await DatabaseService.getKnex();
      const mockTrx = knex as unknown as Knex.Transaction;

      // Test find with transaction and sort options
      const foundWithSort = await testDAO.findMultiple({}, { trx: mockTrx, sort: '+value', limit: 2 });

      expect(foundWithSort).toHaveLength(2);
      expect(foundWithSort[0].value).toBeLessThanOrEqual(foundWithSort[1].value);
    });
  });

  describe('DatabaseService.getKnex transaction handling', () => {
    it('should return transaction when provided', async () => {
      const normalKnex = await DatabaseService.getKnex();
      expect(normalKnex).toBeDefined();

      const mockTransaction = normalKnex as unknown as Knex.Transaction;
      const returnedKnex = await DatabaseService.getKnex(mockTransaction);

      // Should return the same transaction object
      expect(returnedKnex).toBe(mockTransaction);
    });

    it('should return normal knex when no transaction provided', async () => {
      const knex1 = await DatabaseService.getKnex();
      const knex2 = await DatabaseService.getKnex(undefined);

      expect(knex1).toBeDefined();
      expect(knex2).toBeDefined();
      // Both should be the same knex instance
      expect(knex1).toBe(knex2);
    });
  });
});
