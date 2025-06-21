import { TierlistService } from '@src/services/tier-list/tierlist-service.js';
import type { PokemonWithTiering, TierlistSettings } from 'sleepapi-common';

export default class TierlistController {
  public async getCookingTierlist(request: TierlistSettings): Promise<PokemonWithTiering[]> {
    return TierlistService.getCookingTierlist(request);
  }
}
