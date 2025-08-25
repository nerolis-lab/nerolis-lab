import type { TransactionContext } from '@src/database/database-service.js';
import { DatabaseService } from '@src/database/database-service.js';

export interface TransactionOptions {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
}

export async function runInTransaction<T>(
  callback: (trx: TransactionContext) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  return DatabaseService.transaction(callback, options?.isolationLevel);
}

export async function runInTransactionWithRetry<T>(
  callback: (trx: TransactionContext) => Promise<T>,
  maxRetries = 3,
  retryDelay = 100,
  options?: TransactionOptions
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await runInTransaction(callback, options);
    } catch (error) {
      lastError = error as Error;

      const isDeadlock = lastError.message?.includes('Deadlock') || lastError.message?.includes('DEADLOCK');
      const isLockTimeout = lastError.message?.includes('Lock wait timeout');

      if ((isDeadlock || isLockTimeout) && attempt < maxRetries) {
        logger.warn(`Transaction failed (attempt ${attempt}/${maxRetries}): ${lastError.message}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      } else {
        throw lastError;
      }
    }
  }

  throw lastError;
}

export function isTransactionActive(trx?: TransactionContext): boolean {
  return trx !== undefined && !trx.isCompleted();
}
