import type { Berry } from '../../../domain';

export function mockBerry(attrs?: Partial<Berry>): Berry {
  return {
    name: 'Mock berry',
    value: 0,
    type: 'Mocked type',
    ...attrs
  };
}
