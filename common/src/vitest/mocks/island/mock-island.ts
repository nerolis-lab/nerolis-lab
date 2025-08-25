import type { Island } from '../../../types';

export function island(attrs?: Partial<Island>): Island {
  return {
    name: 'Mock Island',
    berries: [],
    shortName: 'greengrass',
    expert: false,
    ...attrs
  };
}
