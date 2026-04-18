import type { ExpertIsland, Island } from '../island';
import { createExpertIsland } from '../island';

export const GREENGRASS: Island = {
  name: 'Greengrass Isle',
  shortName: 'greengrass',
  berries: [],
  expert: false
};

export const GREENGRASS_EXPERT: ExpertIsland = createExpertIsland(GREENGRASS, {
  shortName: 'GGEX'
});
