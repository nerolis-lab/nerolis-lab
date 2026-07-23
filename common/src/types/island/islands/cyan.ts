import { ORAN, PAMTRE, PECHA } from '../../berry/berries';
import type { ExpertIsland, Island } from '../island';
import { createExpertIsland } from '../island';

export const CYAN: Island = {
  name: 'Cyan Beach',
  shortName: 'cyan',
  berries: [ORAN, PAMTRE, PECHA],
  expert: false
};

export const CYAN_EXPERT: ExpertIsland = createExpertIsland(CYAN, {
  shortName: 'CBEX'
});
