import type { Berry } from 'sleepapi-common';

// TODO: exists in common, clean up
export function berry(attrs?: Partial<Berry>): Berry {
  return {
    name: 'Mock berry',
    type: 'Mock type',
    value: 0,
    ...attrs
  };
}
