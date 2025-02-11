import type { IslandShortName } from '../../domain/island/island';

export interface UpsertAreaBonusRequest {
  area: IslandShortName;
  bonus: number;
}
export type GetAreaBonusesResponse = Partial<Record<IslandShortName, number>>;
