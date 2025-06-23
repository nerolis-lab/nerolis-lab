import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { CookingTierlist } from '@src/services/tier-list/cooking-tier-list.js';
import type { PokemonWithTiering } from 'sleepapi-common';
import { type TierlistSettings } from 'sleepapi-common';

class TierlistServiceImpl {
  public async getCookingTierlist(request: TierlistSettings): Promise<PokemonWithTiering[]> {
    return CookingTierlist.get(request);
  }

  public async seed() {
    const userRecipes = defaultUserRecipes();

    await CookingTierlist.seed({ camp: false, level: 30 }, userRecipes);
    await CookingTierlist.seed({ camp: true, level: 30 }, userRecipes);
    await CookingTierlist.seed({ camp: false, level: 60 }, userRecipes);
    await CookingTierlist.seed({ camp: true, level: 60 }, userRecipes);
  }
}

export const TierlistService = new TierlistServiceImpl();
