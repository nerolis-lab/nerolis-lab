import { berry } from '@src/bun/mocks/berry/mock-berry.js';
import type { BerrySet } from 'sleepapi-common';

// TODO: exists in common, clean up
export function berrySet(attrs?: Partial<BerrySet>): BerrySet {
  return {
    amount: 0,
    berry: berry(),
    level: 0,
    ...attrs
  };
}
