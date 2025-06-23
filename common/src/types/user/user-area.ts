import type { IslandShortName } from '../../types/island/island';

export interface UpsertAreaBonusRequest {
  area: IslandShortName;
  bonus: number;
}
export type GetAreaBonusesResponse = Partial<Record<IslandShortName, number>>;
