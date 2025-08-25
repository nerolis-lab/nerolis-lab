import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseService } from '@src/database/database-service.js';
import { isTransactionActive, runInTransaction, runInTransactionWithRetry } from './transaction-utils.js';

describe('Transaction Utils', () => {
  let mockTransaction: any;

  beforeEach(() => {
    global.logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn()
    };

    mockTransaction = {
      isCompleted: vi.fn().mockReturnValue(false),
      commit: vi.fn(),
      rollback: vi.fn()
    };
  });

  describe('runInTransaction', () => {
    it('should execute callback within transaction', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      const result = await runInTransaction(callback);

      expect(result).toBe('result');
      expect(callback).toHaveBeenCalledWith(mockTransaction);
      expect(DatabaseService.transaction).toHaveBeenCalled();
    });

    it('should pass isolation level to DatabaseService', async () => {
      const callback = vi.fn().mockResolvedValue('result');
      const transactionSpy = vi
        .spyOn(DatabaseService, 'transaction')
        .mockImplementation(async (cb) => cb(mockTransaction));

      await runInTransaction(callback, { isolationLevel: 'serializable' });

      expect(transactionSpy).toHaveBeenCalledWith(callback, 'serializable');
    });

    it('should propagate errors from callback', async () => {
      const error = new Error('Transaction failed');
      const callback = vi.fn().mockRejectedValue(error);
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      await expect(runInTransaction(callback)).rejects.toThrow('Transaction failed');
    });
  });

  describe('runInTransactionWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const callback = vi.fn().mockResolvedValue('success');
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      const result = await runInTransactionWithRetry(callback);

      expect(result).toBe('success');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should retry on deadlock error', async () => {
      const callback = vi.fn().mockRejectedValueOnce(new Error('Deadlock found')).mockResolvedValue('success');
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      const result = await runInTransactionWithRetry(callback, 3, 10);

      expect(result).toBe('success');
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should retry on lock timeout error', async () => {
      const callback = vi
        .fn()
        .mockRejectedValueOnce(new Error('Lock wait timeout exceeded'))
        .mockResolvedValue('success');
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      const result = await runInTransactionWithRetry(callback, 3, 10);

      expect(result).toBe('success');
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const error = new Error('DEADLOCK detected');
      const callback = vi.fn().mockRejectedValue(error);
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      await expect(runInTransactionWithRetry(callback, 2, 10)).rejects.toThrow('DEADLOCK detected');
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-transient errors', async () => {
      const error = new Error('Syntax error');
      const callback = vi.fn().mockRejectedValue(error);
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      await expect(runInTransactionWithRetry(callback)).rejects.toThrow('Syntax error');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should increase delay between retries', async () => {
      const callback = vi
        .fn()
        .mockRejectedValueOnce(new Error('Deadlock'))
        .mockRejectedValueOnce(new Error('Deadlock'))
        .mockResolvedValue('success');
      vi.spyOn(DatabaseService, 'transaction').mockImplementation(async (cb) => cb(mockTransaction));

      const start = Date.now();
      await runInTransactionWithRetry(callback, 3, 10);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(20);
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('isTransactionActive', () => {
    it('should return true for active transaction', () => {
      expect(isTransactionActive(mockTransaction)).toBe(true);
    });

    it('should return false for undefined transaction', () => {
      expect(isTransactionActive(undefined)).toBe(false);
    });

    it('should return false for completed transaction', () => {
      mockTransaction.isCompleted.mockReturnValue(true);
      expect(isTransactionActive(mockTransaction)).toBe(false);
    });
  });
});
