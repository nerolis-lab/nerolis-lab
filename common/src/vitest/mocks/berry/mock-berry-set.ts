import type { BerrySet, BerrySetSimple } from '../../../domain';
import { mockBerry } from './mock-berry';

export function mockBerrySet(attrs?: Partial<BerrySet>): BerrySet {
  return {
    amount: 0,
    berry: mockBerry(),
    level: 0,
    ...attrs
  };
}

export function mockBerrySetSimple(attrs?: Partial<BerrySetSimple>): BerrySetSimple {
  return {
    name: 'Mock berry',
    amount: 0,
    level: 0,
    ...attrs
  };
}
